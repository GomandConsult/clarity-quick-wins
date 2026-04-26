import * as React from 'react'
import { render } from '@react-email/components'
import { createFileRoute } from '@tanstack/react-router'
import { z } from 'zod'
import { TEMPLATES } from '@/lib/email-templates/registry'

const SITE_NAME = 'Gomand Consult'
const FROM_ADDRESS = `${SITE_NAME} <noreply@notify.gomandconsult.com>`
const TEMPLATE_NAME = 'diagnostic-report'
const RESEND_GATEWAY_URL = 'https://connector-gateway.lovable.dev/resend'

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
        const lovableApiKey = process.env.LOVABLE_API_KEY
        const resendApiKey = process.env.RESEND_API_KEY

        if (!lovableApiKey || !resendApiKey) {
          console.error('Missing email gateway credentials')
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
        const plainText = await render(element, { plainText: true })
        const subject =
          typeof template.subject === 'function'
            ? template.subject(result as any)
            : template.subject

        const resp = await fetch(`${RESEND_GATEWAY_URL}/emails`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${lovableApiKey}`,
            'X-Connection-Api-Key': resendApiKey,
          },
          body: JSON.stringify({
            from: FROM_ADDRESS,
            to: [recipientEmail],
            subject,
            html,
            text: plainText,
          }),
        })

        if (!resp.ok) {
          const errBody = await resp.text()
          console.error('Resend send failed', {
            status: resp.status,
            body: errBody,
            recipient_redacted: redact(recipientEmail),
          })
          return Response.json({ error: 'send_failed' }, { status: 502 })
        }

        console.log('Diagnostic report sent via Resend', {
          recipient_redacted: redact(recipientEmail),
        })

        return Response.json({ ok: true, sent: true })
      },
    },
  },
})
