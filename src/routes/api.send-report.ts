import { createFileRoute } from "@tanstack/react-router";
import { z } from "zod";

const GATEWAY_URL = "https://connector-gateway.lovable.dev/resend";
const BOOKING_URL = "https://calendar.notion.so/meet/gomandconsult/premiereconsultation";

const PILLAR_NAMES: Record<string, string> = {
  offer: "Offre & différenciation",
  audience: "Cible & message",
  conversion: "Présence & conversion",
  acquisition: "Acquisition & contenu",
  measurement: "Mesure & système",
};

const PILLAR_EXPLANATION: Record<string, string[]> = {
  offer: [
    "Votre point de départ : une offre limpide que l'on comprend en une phrase.",
    "Avant de chercher plus de visibilité, clarifiez ce que vous vendez et pourquoi vous.",
  ],
  audience: [
    "Parler à tout le monde, c'est ne convaincre personne.",
    "Choisissez un segment prioritaire et reformulez votre message avec ses mots.",
  ],
  conversion: [
    "Une fois qu'un visiteur arrive, sait-il quoi faire dans les 5 secondes ?",
    "Un seul CTA clair, partout, accélère plus la croissance qu'un nouveau site.",
  ],
  acquisition: [
    "La régularité bat l'intensité. Un canal, tenu 30 jours, vaut mieux que cinq lancés en l'air.",
    "Identifiez ce qui marche déjà — même approximativement — et doublez la dose.",
  ],
  measurement: [
    "Sans mesure, pas de décision : vous pilotez à l'aveugle.",
    "Trois indicateurs simples, suivis chaque semaine, suffisent à reprendre la main.",
  ],
};

const QUICK_WINS: Record<string, { time: string; text: string }[]> = {
  offer: [
    { time: "30 min", text: "Écrivez votre phrase d'offre : Pour [cible], j'aide à [résultat] grâce à [méthode], en [livrable]." },
    { time: "30 min", text: "Listez 3 preuves (résultat, témoignage, exemple, chiffres)." },
    { time: "2 h", text: "Créez 1 mini-pack « offre phare » (nom + contenu + à partir de + délai)." },
  ],
  audience: [
    { time: "30 min", text: "Choisissez 1 segment prioritaire pour 30 jours + notez « pas pour qui »." },
    { time: "30 min", text: "Écrivez 5 phrases « problème client » avec leurs mots." },
    { time: "2 h", text: "Rédigez une mini-FAQ (5 questions) pour lever les objections." },
  ],
  conversion: [
    { time: "30 min", text: "Ajoutez 1 CTA unique partout (profil, site, signature)." },
    { time: "30 min", text: "Rendez le contact évident (bouton réserver / devis)." },
    { time: "2 h", text: "Ajoutez 3 preuves visibles (avis, logos, cas, témoignages)." },
  ],
  acquisition: [
    { time: "30 min", text: "Choisissez 1 canal principal pour 30 jours." },
    { time: "30 min", text: "Planifiez 2 posts / 2 actions réseau pour les 14 prochains jours." },
    { time: "2 h", text: "Créez 1 template réutilisable (post ou message de reconnexion)." },
  ],
  measurement: [
    { time: "30 min", text: "Créez un tableau « Leads » (date, source, besoin, next step)." },
    { time: "30 min", text: "Choisissez 3 KPI max et notez-les 1x/semaine." },
    { time: "2 h", text: "Bloquez 20 min/semaine « revue marketing »." },
  ],
};

const PillarKey = z.enum(["offer", "audience", "conversion", "acquisition", "measurement"]);

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
});

function escape(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function buildHtml(result: z.infer<typeof BodySchema>["result"]): string {
  const priorityName = PILLAR_NAMES[result.priority];
  const explanation = PILLAR_EXPLANATION[result.priority];
  const quickWins = QUICK_WINS[result.priority];

  const winsHtml = quickWins
    .map(
      (qw) => `
        <tr>
          <td style="padding:0 0 12px 0;">
            <table cellpadding="0" cellspacing="0" border="0" width="100%" style="background:#f6f7f9;border-radius:10px;">
              <tr>
                <td style="padding:14px 16px;font-family:Arial,sans-serif;font-size:14px;color:#1a2540;line-height:1.55;">
                  <span style="display:inline-block;background:#1f3b73;color:#ffffff;font-weight:600;font-size:11px;padding:3px 8px;border-radius:6px;margin-right:8px;letter-spacing:0.04em;">${escape(qw.time)}</span>
                  ${escape(qw.text)}
                </td>
              </tr>
            </table>
          </td>
        </tr>`
    )
    .join("");

  const pillarRows = (Object.keys(result.pillarScores) as Array<keyof typeof result.pillarScores>)
    .map((k) => {
      const isPriority = k === result.priority;
      return `<tr>
        <td style="padding:4px 0;font-family:Arial,sans-serif;font-size:13px;color:${isPriority ? "#1f3b73" : "#55607a"};font-weight:${isPriority ? 600 : 400};">
          ${escape(PILLAR_NAMES[k])}${isPriority ? " · priorité" : ""}
        </td>
        <td align="right" style="padding:4px 0;font-family:Arial,sans-serif;font-size:13px;color:#55607a;">
          ${result.pillarScores[k]}/6
        </td>
      </tr>`;
    })
    .join("");

  return `<!doctype html>
<html lang="fr">
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Votre mini-diagnostic marketing</title></head>
<body style="margin:0;padding:0;background:#f1f3f6;font-family:Arial,sans-serif;color:#1a2540;">
  <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="background:#f1f3f6;padding:32px 16px;">
    <tr>
      <td align="center">
        <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="600" style="max-width:600px;background:#ffffff;border-radius:16px;overflow:hidden;">
          <tr>
            <td style="padding:28px 32px 8px 32px;">
              <div style="font-size:12px;letter-spacing:0.18em;text-transform:uppercase;color:#1f3b73;font-weight:600;">Marketing Clarity · Gomand Consult</div>
              <h1 style="font-family:Georgia,serif;font-size:26px;line-height:1.2;color:#1a2540;margin:10px 0 4px 0;">Votre mini-diagnostic marketing</h1>
              <p style="font-size:14px;color:#55607a;margin:0;">Voici votre score, votre priorité #1 et 3 actions pour avancer.</p>
            </td>
          </tr>

          <tr>
            <td style="padding:24px 32px 8px 32px;">
              <table cellpadding="0" cellspacing="0" border="0" width="100%" style="background:#f6f7f9;border-radius:12px;">
                <tr>
                  <td style="padding:20px 22px;">
                    <div style="font-family:Georgia,serif;font-size:42px;color:#1f3b73;line-height:1;font-weight:600;">
                      ${result.total}<span style="font-size:20px;color:#9aa3b8;"> / 30</span>
                    </div>
                    <div style="font-size:14px;color:#55607a;margin-top:6px;">Niveau : <strong style="color:#1a2540;">${escape(result.label)}</strong></div>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <tr>
            <td style="padding:16px 32px 0 32px;">
              <div style="font-size:12px;letter-spacing:0.12em;text-transform:uppercase;color:#55607a;font-weight:600;margin-bottom:6px;">Détail par pilier</div>
              <table cellpadding="0" cellspacing="0" border="0" width="100%">${pillarRows}</table>
            </td>
          </tr>

          <tr>
            <td style="padding:24px 32px 8px 32px;">
              <div style="font-size:12px;letter-spacing:0.18em;text-transform:uppercase;color:#1f3b73;font-weight:600;">Votre priorité #1</div>
              <h2 style="font-family:Georgia,serif;font-size:22px;color:#1a2540;margin:6px 0 10px 0;">${escape(priorityName)}</h2>
              ${explanation.map((p) => `<p style="font-size:14px;line-height:1.6;color:#1a2540;margin:0 0 8px 0;">${escape(p)}</p>`).join("")}
            </td>
          </tr>

          <tr>
            <td style="padding:18px 32px 8px 32px;">
              <div style="font-size:12px;letter-spacing:0.12em;text-transform:uppercase;color:#1f3b73;font-weight:600;margin-bottom:10px;">3 quick wins</div>
              <table cellpadding="0" cellspacing="0" border="0" width="100%">${winsHtml}</table>
            </td>
          </tr>

          <tr>
            <td style="padding:8px 32px 28px 32px;">
              <table cellpadding="0" cellspacing="0" border="0" width="100%" style="background:#1f3b73;border-radius:14px;">
                <tr>
                  <td style="padding:24px 26px;color:#ffffff;">
                    <div style="font-size:12px;letter-spacing:0.18em;text-transform:uppercase;opacity:0.7;">Prochaine étape</div>
                    <h3 style="font-family:Georgia,serif;font-size:20px;color:#ffffff;margin:6px 0 10px 0;">Un follow-up gratuit de 45 minutes</h3>
                    <p style="font-size:14px;line-height:1.6;color:#ffffff;opacity:0.92;margin:0 0 16px 0;">
                      Nous relisons ensemble votre mini-rapport, validons votre priorité #1 et choisissons les 2–3 actions les plus utiles pour les 30 prochains jours. Sans engagement.
                    </p>
                    <a href="${BOOKING_URL}" style="display:inline-block;background:#e8a64e;color:#2b1d05;text-decoration:none;font-weight:600;font-size:14px;padding:12px 20px;border-radius:10px;">
                      Réserver mon follow-up gratuit (45 min)
                    </a>
                    <div style="font-size:12px;color:#ffffff;opacity:0.75;margin-top:10px;">En visio · 45 min · Plan simple et priorisé</div>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <tr>
            <td style="padding:0 32px 28px 32px;border-top:1px solid #eef0f4;">
              <p style="font-size:12px;color:#9aa3b8;margin:18px 0 0 0;line-height:1.6;">
                Vous recevez cet email parce que vous avez complété le mini-diagnostic Marketing Clarity.<br>
                — Gomand Consult
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

function buildText(result: z.infer<typeof BodySchema>["result"]): string {
  const priorityName = PILLAR_NAMES[result.priority];
  const wins = QUICK_WINS[result.priority]
    .map((qw, i) => `${i + 1}. [${qw.time}] ${qw.text}`)
    .join("\n");
  return [
    "Votre mini-diagnostic marketing — Gomand Consult",
    "",
    `Score : ${result.total}/30 — ${result.label}`,
    "",
    `Priorité #1 : ${priorityName}`,
    ...PILLAR_EXPLANATION[result.priority],
    "",
    "3 quick wins :",
    wins,
    "",
    "Prochaine étape — follow-up gratuit (45 min, en visio) :",
    BOOKING_URL,
    "",
    "— Gomand Consult",
  ].join("\n");
}

export const Route = createFileRoute("/api/send-report")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const LOVABLE_API_KEY = process.env.LOVABLE_API_KEY;
        const RESEND_API_KEY = process.env.RESEND_API_KEY;
        if (!LOVABLE_API_KEY) {
          return new Response(JSON.stringify({ error: "LOVABLE_API_KEY not configured" }), { status: 500, headers: { "Content-Type": "application/json" } });
        }
        if (!RESEND_API_KEY) {
          return new Response(JSON.stringify({ error: "RESEND_API_KEY not configured" }), { status: 500, headers: { "Content-Type": "application/json" } });
        }

        let raw: unknown;
        try {
          raw = await request.json();
        } catch {
          return new Response(JSON.stringify({ error: "invalid_json" }), { status: 400, headers: { "Content-Type": "application/json" } });
        }

        const parsed = BodySchema.safeParse(raw);
        if (!parsed.success) {
          return new Response(JSON.stringify({ error: "invalid_input", details: parsed.error.flatten() }), { status: 400, headers: { "Content-Type": "application/json" } });
        }

        const { email, result } = parsed.data;
        const html = buildHtml(result);
        const text = buildText(result);

        const res = await fetch(`${GATEWAY_URL}/emails`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${LOVABLE_API_KEY}`,
            "X-Connection-Api-Key": RESEND_API_KEY,
          },
          body: JSON.stringify({
            from: "Gomand Consult <onboarding@resend.dev>",
            to: [email],
            subject: "Votre mini-diagnostic marketing (score + priorité #1)",
            html,
            text,
            reply_to: "hello@gomandconsult.com",
          }),
        });

        const data = await res.json().catch(() => ({}));
        if (!res.ok) {
          console.error("Resend send failed", res.status, data);
          return new Response(JSON.stringify({ error: "email_failed", status: res.status, data }), { status: 502, headers: { "Content-Type": "application/json" } });
        }

        return new Response(JSON.stringify({ ok: true, id: (data as { id?: string }).id }), {
          status: 200,
          headers: { "Content-Type": "application/json" },
        });
      },
    },
  },
});
