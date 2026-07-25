import * as React from 'react'
import { render } from '@react-email/components'
import { createClient } from '@supabase/supabase-js'
import { createFileRoute } from '@tanstack/react-router'
import { z } from 'zod'
import { TEMPLATES } from '@/lib/email-templates/registry'

const SITE_NAME = 'Gomand Consult'
const SENDER_DOMAIN = 'notify.gomandconsult.com'
const FROM_DOMAIN = 'notify.gomandconsult.com'
const FROM_ADDRESS = `${SITE_NAME} <noreply@${FROM_DOMAIN}>`
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

function redact(email: string): string {
  const [l, d] = email.split('@')
  if (!l || !d) return '***'
  return `${l[0]}***@${d}`
}

function generateToken(): string {
  const bytes = new Uint8Array(32)
  crypto.getRandomValues(bytes)
  return Array.from(bytes).map((b) => b.toString(16).padStart(2, '0')).join('')
}

export const Route = createFileRoute('/api/send-report')({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const supabaseUrl = process.env.SUPABASE_URL || import.meta.env.VITE_SUPABASE_URL
        const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
        const bccEmail = process.env.SEND_REPORT_BCC?.trim() || null
        const environment = process.env.NODE_ENV === 'production' ? 'prod' : 'preview'

        if (!supabaseUrl || !serviceKey) {
          console.error('send-report: missing Supabase config')
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
        const recipientEmail = email.toLowerCase()
        const sendId = crypto.randomUUID()
        const supabase = createClient(supabaseUrl, serviceKey, {
          auth: { persistSession: false },
        })

        const logAttempt = async (fields: {
          status: string
          error_message?: string | null
          provider_message_id?: string | null
          bcc?: string | null
        }) => {
          try {
            await supabase.from('email_delivery_log').insert({
              send_id: sendId,
              to_email: recipientEmail,
              report_priority: result.priority,
              report_total: result.total,
              status: fields.status,
              provider_message_id: fields.provider_message_id ?? null,
              error_message: fields.error_message ?? null,
              environment,
              bcc_email: fields.bcc ?? null,
              metadata: { template: TEMPLATE_NAME },
            })
          } catch (e) {
            console.error('send-report: log insert failed', e)
          }
        }

        const template = TEMPLATES[TEMPLATE_NAME]
        if (!template) {
          await logAttempt({ status: 'failed', error_message: 'template_not_found' })
          return Response.json({ error: 'template_not_found', send_id: sendId }, { status: 500 })
        }

        // Suppression check
        const { data: suppressed } = await supabase
          .from('suppressed_emails')
          .select('id')
          .eq('email', recipientEmail)
          .maybeSingle()

        if (suppressed) {
          await logAttempt({ status: 'suppressed' })
          return Response.json(
            { error: 'email_suppressed', send_id: sendId },
            { status: 400 },
          )
        }

        // Unsubscribe token
        let unsubscribeToken: string
        const { data: existingToken } = await supabase
          .from('email_unsubscribe_tokens')
          .select('token, used_at')
          .eq('email', recipientEmail)
          .maybeSingle()

        if (existingToken?.token && !existingToken.used_at) {
          unsubscribeToken = existingToken.token
        } else {
          unsubscribeToken = generateToken()
          await supabase
            .from('email_unsubscribe_tokens')
            .upsert(
              { token: unsubscribeToken, email: recipientEmail },
              { onConflict: 'email', ignoreDuplicates: true },
            )
          const { data: stored } = await supabase
            .from('email_unsubscribe_tokens')
            .select('token')
            .eq('email', recipientEmail)
            .maybeSingle()
          if (stored?.token) unsubscribeToken = stored.token
        }

        // Render template
        const element = React.createElement(template.component, {
          total: result.total,
          label: result.label,
          priority: result.priority,
          pillarScores: result.pillarScores,
        })
        const html = await render(element)
        const plainText = await render(element, { plainText: true })
        const subject =
          typeof template.subject === 'function'
            ? template.subject(result as any)
            : template.subject

        const enqueueOne = async (to: string, isBcc: boolean) => {
          const messageId = crypto.randomUUID()
          await supabase.from('email_send_log').insert({
            message_id: messageId,
            template_name: TEMPLATE_NAME,
            recipient_email: to,
            status: 'pending',
          })
          const { error } = await supabase.rpc('enqueue_email', {
            queue_name: 'transactional_emails',
            payload: {
              message_id: messageId,
              to,
              from: FROM_ADDRESS,
              sender_domain: SENDER_DOMAIN,
              subject: isBcc ? `[BCC copy] ${subject}` : subject,
              html,
              text: plainText,
              purpose: 'transactional',
              label: TEMPLATE_NAME,
              idempotency_key: isBcc ? `${sendId}-bcc` : sendId,
              unsubscribe_token: unsubscribeToken,
              queued_at: new Date().toISOString(),
            },
          })
          return { messageId, error }
        }

        const primary = await enqueueOne(recipientEmail, false)
        if (primary.error) {
          console.error('send-report: enqueue failed', {
            recipient_redacted: redact(recipientEmail),
            error: primary.error,
          })
          await logAttempt({
            status: 'failed',
            error_message: primary.error.message || 'enqueue_failed',
          })
          return Response.json(
            { error: 'send_failed', send_id: sendId },
            { status: 502 },
          )
        }

        await logAttempt({
          status: 'queued',
          provider_message_id: primary.messageId,
        })

        // Optional BCC copy (test mode)
        if (bccEmail && bccEmail !== recipientEmail) {
          const bcc = await enqueueOne(bccEmail, true)
          await logAttempt({
            status: bcc.error ? 'failed' : 'queued',
            provider_message_id: bcc.error ? null : bcc.messageId,
            error_message: bcc.error?.message ?? null,
            bcc: bccEmail,
          })
        }

        console.log('send-report: queued', {
          send_id: sendId,
          recipient_redacted: redact(recipientEmail),
          bcc_enabled: Boolean(bccEmail),
        })

        return Response.json({ ok: true, queued: true, send_id: sendId })
      },
    },
  },
})
