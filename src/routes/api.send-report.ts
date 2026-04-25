import * as React from 'react'
import { render } from '@react-email/components'
import { createClient } from '@supabase/supabase-js'
import { createFileRoute } from '@tanstack/react-router'
import { z } from 'zod'
import { TEMPLATES } from '@/lib/email-templates/registry'

const SITE_NAME = 'Gomand Consult'
const SENDER_DOMAIN = 'notify.gomandconsult.com'
const FROM_DOMAIN = 'notify.gomandconsult.com'
const TEMPLATE_NAME = 'diagnostic-report'

const PillarKey = z.enum(['offer', 'audience', 'conversion', 'acquisition', 'measurement'])

const BodySchema = z.object({
  email: z.string().trim().email().max(255),
  result: z.object({
    total: z.number().int().min(0).max(30),
    label: z.string().min(1).max(50),
    priority: PillarKey,
    pillarScores: z.object({
      offer: z.number().int().min(0).max(6),
      audience: z.number().int().min(0).max(6),
      conversion: z.number().int().min(0).max(6),
      acquisition: z.number().int().min(0).max(6),
      measurement: z.number().int().min(0).max(6),
    }),
  }),
})

function generateToken(): string {
  const bytes = new Uint8Array(32)
  crypto.getRandomValues(bytes)
  return Array.from(bytes)
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('')
}

function redact(email: string): string {
  const [l, d] = email.split('@')
  if (!l || !d) return '***'
  return `${l[0]}***@${d}`
}

export const Route = createFileRoute('/api/send-report')({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
        const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

        if (!supabaseUrl || !supabaseServiceKey) {
          console.error('Missing required env vars')
          return Response.json({ error: 'server_misconfigured' }, { status: 500 })
        }

        let raw: unknown
        try {
          raw = await request.json()
        } catch {
          return Response.json({ error: 'invalid_json' }, { status: 400 })
        }

        const parsed = BodySchema.safeParse(raw)
        if (!parsed.success) {
          return Response.json(
            { error: 'invalid_input', details: parsed.error.flatten() },
            { status: 400 },
          )
        }

        const { email, result } = parsed.data
        const recipientEmail = email
        const normalizedEmail = recipientEmail.toLowerCase()
        const messageId = crypto.randomUUID()
        const idempotencyKey = `diagnostic-report-${messageId}`

        const supabase: any = createClient(supabaseUrl, supabaseServiceKey)

        const template = TEMPLATES[TEMPLATE_NAME]
        if (!template) {
          return Response.json({ error: 'template_not_found' }, { status: 500 })
        }

        // 1. Suppression check
        const { data: suppressed, error: suppressionError } = await supabase
          .from('suppressed_emails')
          .select('id')
          .eq('email', normalizedEmail)
          .maybeSingle()

        if (suppressionError) {
          console.error('Suppression check failed', { error: suppressionError })
          return Response.json({ error: 'suppression_check_failed' }, { status: 500 })
        }

        if (suppressed) {
          await supabase.from('email_send_log').insert({
            message_id: messageId,
            template_name: TEMPLATE_NAME,
            recipient_email: recipientEmail,
            status: 'suppressed',
          })
          return Response.json({ ok: true, suppressed: true })
        }

        // 2. Get or create unsubscribe token
        let unsubscribeToken: string
        const { data: existing } = await supabase
          .from('email_unsubscribe_tokens')
          .select('token, used_at')
          .eq('email', normalizedEmail)
          .maybeSingle()

        if (existing && !existing.used_at) {
          unsubscribeToken = existing.token
        } else {
          unsubscribeToken = generateToken()
          await supabase
            .from('email_unsubscribe_tokens')
            .upsert(
              { token: unsubscribeToken, email: normalizedEmail },
              { onConflict: 'email', ignoreDuplicates: true },
            )
          const { data: stored } = await supabase
            .from('email_unsubscribe_tokens')
            .select('token')
            .eq('email', normalizedEmail)
            .maybeSingle()
          if (stored?.token) unsubscribeToken = stored.token
        }

        // 3. Render template
        const element = React.createElement(template.component, {
          total: result.total,
          label: result.label,
          priority: result.priority,
          pillarScores: result.pillarScores,
        })
        const html = await render(element)
        const plainText = await render(element, { plainText: true })
        const resolvedSubject =
          typeof template.subject === 'function'
            ? template.subject(result as any)
            : template.subject

        // 4. Log pending then enqueue
        await supabase.from('email_send_log').insert({
          message_id: messageId,
          template_name: TEMPLATE_NAME,
          recipient_email: recipientEmail,
          status: 'pending',
        })

        const { error: enqueueError } = await supabase.rpc('enqueue_email', {
          queue_name: 'transactional_emails',
          payload: {
            message_id: messageId,
            to: recipientEmail,
            from: `${SITE_NAME} <noreply@${FROM_DOMAIN}>`,
            sender_domain: SENDER_DOMAIN,
            subject: resolvedSubject,
            html,
            text: plainText,
            purpose: 'transactional',
            label: TEMPLATE_NAME,
            idempotency_key: idempotencyKey,
            unsubscribe_token: unsubscribeToken,
            queued_at: new Date().toISOString(),
          },
        })

        if (enqueueError) {
          console.error('Failed to enqueue email', { error: enqueueError })
          await supabase.from('email_send_log').insert({
            message_id: messageId,
            template_name: TEMPLATE_NAME,
            recipient_email: recipientEmail,
            status: 'failed',
            error_message: 'Failed to enqueue email',
          })
          return Response.json({ error: 'enqueue_failed' }, { status: 500 })
        }

        console.log('Diagnostic report enqueued', {
          recipient_redacted: redact(recipientEmail),
        })

        return Response.json({ ok: true, queued: true })
      },
    },
  },
})
