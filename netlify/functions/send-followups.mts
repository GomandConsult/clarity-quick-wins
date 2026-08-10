import type { Config } from "@netlify/functions";
import * as React from "react";
import { render } from "@react-email/components";
import { Resend } from "resend";
import { TEMPLATES } from "../../src/lib/email-templates/registry";
import { findContactsDueForFollowup, markClarityFollowupSent } from "../../src/lib/hubspot";

const SITE_NAME = "Gomand Consult";
const FROM_DOMAIN = "clarity.gomandconsult.com";
const FROM_ADDRESS = `${SITE_NAME} <noreply@${FROM_DOMAIN}>`;
const TEMPLATE_NAME = "diagnostic-followup";
const FOLLOWUP_DELAY_DAYS = 2;

function redact(email: string): string {
  const [l, d] = email.split("@");
  if (!l || !d) return "***";
  return `${l[0]}***@${d}`;
}

export default async () => {
  const resendKey = process.env.RESEND_API_KEY;
  const hubspotKey = process.env.HUBSPOT_KEY;

  if (!resendKey || !hubspotKey) {
    console.error("send-followups: missing RESEND_API_KEY or HUBSPOT_KEY");
    return new Response(null, { status: 500 });
  }

  const template = TEMPLATES[TEMPLATE_NAME];
  const resend = new Resend(resendKey);

  const contacts = await findContactsDueForFollowup(FOLLOWUP_DELAY_DAYS);
  console.log(`send-followups: ${contacts.length} contact(s) due`);

  let sent = 0;
  let failed = 0;

  for (const contact of contacts) {
    try {
      const element = React.createElement(template.component, { priority: contact.priority });
      const html = await render(element);
      const text = await render(element, { plainText: true });
      const subject = typeof template.subject === "function" ? template.subject({}) : template.subject;

      const { error } = await resend.emails.send({
        from: FROM_ADDRESS,
        to: contact.email,
        subject,
        html,
        text,
      });

      if (error) {
        failed++;
        console.error("send-followups: resend send failed", {
          recipient_redacted: redact(contact.email),
          error,
        });
        continue;
      }

      await markClarityFollowupSent(contact.id, Date.now());
      sent++;
    } catch (err) {
      failed++;
      console.error("send-followups: error processing contact", {
        recipient_redacted: redact(contact.email),
        error: err instanceof Error ? err.message : err,
      });
    }
  }

  console.log(`send-followups: done — sent=${sent} failed=${failed}`);
  return Response.json({ sent, failed });
};

export const config: Config = {
  schedule: "@daily",
};
