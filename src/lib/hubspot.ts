const HUBSPOT_API_BASE = "https://api.hubapi.com";

export interface ClarityContactProperties {
  clarity_score: string;
  clarity_level: string;
  clarity_priority: string;
  clarity_score_offer: string;
  clarity_score_audience: string;
  clarity_score_conversion: string;
  clarity_score_acquisition: string;
  clarity_score_measurement: string;
  clarity_completed_at: string;
  clarity_report_sent_at: string;
}

interface HubspotContact {
  id: string;
  properties: Record<string, string | null>;
}

function hubspotFetch(path: string, init: RequestInit): Promise<Response> {
  const apiKey = process.env.HUBSPOT_KEY;
  if (!apiKey) throw new Error("missing_hubspot_key");
  return fetch(`${HUBSPOT_API_BASE}${path}`, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
      ...(init.headers ?? {}),
    },
  });
}

/**
 * Creates the contact if it doesn't exist, otherwise updates it.
 * Never downgrades an existing lifecyclestage (e.g. won't reset a
 * "customer" back to "lead" just because they retook the diagnostic).
 */
export async function upsertClarityContact(
  email: string,
  properties: ClarityContactProperties,
): Promise<{ id: string; created: boolean }> {
  const lookupRes = await hubspotFetch(
    `/crm/v3/objects/contacts/${encodeURIComponent(email)}?idProperty=email&properties=lifecyclestage`,
    { method: "GET" },
  );

  if (lookupRes.status === 404) {
    const createRes = await hubspotFetch(`/crm/v3/objects/contacts`, {
      method: "POST",
      body: JSON.stringify({
        properties: { email, lifecyclestage: "lead", ...properties },
      }),
    });
    if (!createRes.ok) {
      throw new Error(`hubspot_create_failed: ${createRes.status} ${await createRes.text()}`);
    }
    const created = (await createRes.json()) as HubspotContact;
    return { id: created.id, created: true };
  }

  if (!lookupRes.ok) {
    throw new Error(`hubspot_lookup_failed: ${lookupRes.status} ${await lookupRes.text()}`);
  }

  const existing = (await lookupRes.json()) as HubspotContact;
  const patchProperties: Record<string, string> = { ...properties };
  if (!existing.properties.lifecyclestage) {
    patchProperties.lifecyclestage = "lead";
  }

  const patchRes = await hubspotFetch(`/crm/v3/objects/contacts/${existing.id}`, {
    method: "PATCH",
    body: JSON.stringify({ properties: patchProperties }),
  });
  if (!patchRes.ok) {
    throw new Error(`hubspot_patch_failed: ${patchRes.status} ${await patchRes.text()}`);
  }
  return { id: existing.id, created: false };
}

export async function markClarityFollowupSent(contactId: string, sentAtMs: number): Promise<void> {
  const res = await hubspotFetch(`/crm/v3/objects/contacts/${contactId}`, {
    method: "PATCH",
    body: JSON.stringify({
      properties: { clarity_followup_sent_at: String(sentAtMs) },
    }),
  });
  if (!res.ok) {
    throw new Error(`hubspot_mark_followup_failed: ${res.status} ${await res.text()}`);
  }
}

export interface ContactDueForFollowup {
  id: string;
  email: string;
  priority: string;
}

/**
 * Contacts whose report was sent at least `minAgeDays` ago and who
 * haven't received the motivational follow-up yet.
 */
export async function findContactsDueForFollowup(
  minAgeDays: number,
): Promise<ContactDueForFollowup[]> {
  const cutoff = Date.now() - minAgeDays * 24 * 60 * 60 * 1000;

  const res = await hubspotFetch(`/crm/v3/objects/contacts/search`, {
    method: "POST",
    body: JSON.stringify({
      filterGroups: [
        {
          filters: [
            { propertyName: "clarity_report_sent_at", operator: "HAS_PROPERTY" },
            { propertyName: "clarity_followup_sent_at", operator: "NOT_HAS_PROPERTY" },
            { propertyName: "clarity_report_sent_at", operator: "LTE", value: String(cutoff) },
          ],
        },
      ],
      properties: ["email", "clarity_priority"],
      limit: 100,
    }),
  });

  if (!res.ok) {
    throw new Error(`hubspot_search_failed: ${res.status} ${await res.text()}`);
  }

  const data = (await res.json()) as { results: HubspotContact[] };
  return data.results
    .filter((c) => c.properties.email)
    .map((c) => ({
      id: c.id,
      email: c.properties.email as string,
      priority: c.properties.clarity_priority ?? "offer",
    }));
}
