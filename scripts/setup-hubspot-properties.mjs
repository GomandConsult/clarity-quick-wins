#!/usr/bin/env node
// One-time setup script: creates the HubSpot contact property group and
// custom properties used by the Marketing Clarity diagnostic. Idempotent —
// safe to re-run; existing properties/groups are left untouched.
//
// Usage:
//   HUBSPOT_KEY=your-private-app-token node scripts/setup-hubspot-properties.mjs

const API_BASE = "https://api.hubapi.com";
const apiKey = process.env.HUBSPOT_KEY;

if (!apiKey) {
  console.error("Missing HUBSPOT_KEY environment variable.");
  console.error("Usage: HUBSPOT_KEY=your-private-app-token node scripts/setup-hubspot-properties.mjs");
  process.exit(1);
}

async function hubspotFetch(path, init = {}) {
  const res = await fetch(`${API_BASE}${path}`, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
      ...(init.headers ?? {}),
    },
  });
  return res;
}

const GROUP_NAME = "clarity_diagnostic";

const PROPERTIES = [
  {
    name: "clarity_score",
    label: "Clarity — Score total (/30)",
    type: "number",
    fieldType: "number",
  },
  {
    name: "clarity_level",
    label: "Clarity — Niveau",
    type: "enumeration",
    fieldType: "select",
    options: [
      { label: "À clarifier", value: "À clarifier" },
      { label: "En progression", value: "En progression" },
      { label: "Solide", value: "Solide" },
    ],
  },
  {
    name: "clarity_priority",
    label: "Clarity — Priorité #1",
    type: "enumeration",
    fieldType: "select",
    options: [
      { label: "Offre & différenciation", value: "offer" },
      { label: "Cible & message", value: "audience" },
      { label: "Présence & conversion", value: "conversion" },
      { label: "Acquisition & contenu", value: "acquisition" },
      { label: "Mesure & système", value: "measurement" },
    ],
  },
  { name: "clarity_score_offer", label: "Clarity — Score Offre (/6)", type: "number", fieldType: "number" },
  { name: "clarity_score_audience", label: "Clarity — Score Cible (/6)", type: "number", fieldType: "number" },
  { name: "clarity_score_conversion", label: "Clarity — Score Conversion (/6)", type: "number", fieldType: "number" },
  { name: "clarity_score_acquisition", label: "Clarity — Score Acquisition (/6)", type: "number", fieldType: "number" },
  { name: "clarity_score_measurement", label: "Clarity — Score Mesure (/6)", type: "number", fieldType: "number" },
  {
    name: "clarity_completed_at",
    label: "Clarity — Diagnostic complété le",
    type: "datetime",
    fieldType: "date",
  },
  {
    name: "clarity_report_sent_at",
    label: "Clarity — Rapport envoyé le",
    type: "datetime",
    fieldType: "date",
  },
  {
    name: "clarity_followup_sent_at",
    label: "Clarity — Relance envoyée le",
    type: "datetime",
    fieldType: "date",
  },
];

async function ensureGroup() {
  const res = await hubspotFetch(`/crm/v3/properties/contacts/groups/${GROUP_NAME}`);
  if (res.status === 200) {
    console.log(`✓ Property group "${GROUP_NAME}" already exists`);
    return;
  }
  const createRes = await hubspotFetch(`/crm/v3/properties/contacts/groups`, {
    method: "POST",
    body: JSON.stringify({ name: GROUP_NAME, label: "Marketing Clarity" }),
  });
  if (!createRes.ok && createRes.status !== 409) {
    throw new Error(`Failed to create property group: ${createRes.status} ${await createRes.text()}`);
  }
  console.log(`✓ Created property group "${GROUP_NAME}"`);
}

async function ensureProperty(prop) {
  const res = await hubspotFetch(`/crm/v3/properties/contacts/${prop.name}`);
  if (res.status === 200) {
    console.log(`✓ Property "${prop.name}" already exists`);
    return;
  }
  const createRes = await hubspotFetch(`/crm/v3/properties/contacts`, {
    method: "POST",
    body: JSON.stringify({
      name: prop.name,
      label: prop.label,
      type: prop.type,
      fieldType: prop.fieldType,
      groupName: GROUP_NAME,
      options: prop.options,
    }),
  });
  if (!createRes.ok && createRes.status !== 409) {
    throw new Error(`Failed to create property "${prop.name}": ${createRes.status} ${await createRes.text()}`);
  }
  console.log(`✓ Created property "${prop.name}"`);
}

async function main() {
  await ensureGroup();
  for (const prop of PROPERTIES) {
    await ensureProperty(prop);
  }
  console.log("\nDone.");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
