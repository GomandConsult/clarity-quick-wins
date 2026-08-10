import * as React from 'react'
import { render } from '@react-email/components'
import { Resend } from 'resend'
import { createFileRoute } from '@tanstack/react-router'
import { z } from 'zod'
import { TEMPLATES } from '@/lib/email-templates/registry'
import { upsertClarityContact } from '@/lib/hubspot'

const SITE_NAME = 'Gomand Consult'
const FROM_DOMAIN = 'clarity.gomandconsult.com'
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

export const Route = createFileRoute('/api/send-report')({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const apiKey = process.env.RESEND_API_KEY
        const bccEmail = process.env.SEND_REPORT_BCC?.trim() || undefined

        if (!apiKey) {
          console.error('send-report: missing RESEND_API_KEY')
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

        const template = TEMPLATES[TEMPLATE_NAME]
        if (!template) {
          return Response.json({ error: 'template_not_found' }, { status: 500 })
        }

        const element = React.createElement(template.component, {
          total: result.total,
          label: result.label,
          priority: result.priority,
          pillarScores: result.pillarScores,
        })
        const html = await render(element)
        const text = await render(element, { plainText: true })
        const subject =
          typeof template.subject === 'function'
            ? template.subject(result as any)
            : template.subject

        const resend = new Resend(apiKey)
        const { data, error } = await resend.emails.send({
          from: FROM_ADDRESS,
          to: recipientEmail,
          bcc: bccEmail && bccEmail !== recipientEmail ? bccEmail : undefined,
          subject,
          html,
          text,
        })

        if (error) {
          console.error('send-report: resend send failed', {
            recipient_redacted: redact(recipientEmail),
            error,
          })
          return Response.json({ error: 'send_failed' }, { status: 502 })
        }

        console.log('send-report: sent', {
          message_id: data?.id,
          recipient_redacted: redact(recipientEmail),
          bcc_enabled: Boolean(bccEmail),
        })

        // Best-effort CRM sync — the email already went out, so a HubSpot
        // failure here shouldn't turn into a user-facing error.
        if (process.env.HUBSPOT_KEY) {
          try {
            const now = String(Date.now())
            await upsertClarityContact(recipientEmail, {
              clarity_score: String(result.total),
              clarity_level: result.label,
              clarity_priority: result.priority,
              clarity_score_offer: String(result.pillarScores.offer),
              clarity_score_audience: String(result.pillarScores.audience),
              clarity_score_conversion: String(result.pillarScores.conversion),
              clarity_score_acquisition: String(result.pillarScores.acquisition),
              clarity_score_measurement: String(result.pillarScores.measurement),
              clarity_completed_at: now,
              clarity_report_sent_at: now,
            })
          } catch (hubspotError) {
            console.error('send-report: hubspot sync failed', {
              recipient_redacted: redact(recipientEmail),
              error: hubspotError instanceof Error ? hubspotError.message : hubspotError,
            })
          }
        }

        return Response.json({ ok: true, message_id: data?.id })
      },
    },
  },
})
