import * as React from 'react'
import {
  Body,
  Button,
  Container,
  Head,
  Heading,
  Html,
  Preview,
  Section,
  Text,
} from '@react-email/components'
import type { TemplateEntry } from './registry'

const SITE_NAME = 'Gomand Consult'
const BOOKING_URL = 'https://calendar.notion.so/meet/gomandconsult/premiereconsultation'

// Gomand palette
const C = {
  primary: '#30434f',
  accent: '#859CA6',
  surface: '#e4e3e2',
  text: '#30434f',
  text2: '#575659',
  muted: '#687a82',
  white: '#ffffff',
  primarySoft: '#f1f3f4',
  border: '#e4e3e2',
}

const PILLAR_NAMES: Record<string, string> = {
  offer: 'Offre & différenciation',
  audience: 'Cible & message',
  conversion: 'Présence & conversion',
  acquisition: 'Acquisition & contenu',
  measurement: 'Mesure & système',
}

const PILLAR_EXPLANATION: Record<string, string[]> = {
  offer: [
    "Votre point de départ : une offre limpide que l'on comprend en une phrase.",
    'Avant de chercher plus de visibilité, clarifiez ce que vous vendez et pourquoi vous.',
  ],
  audience: [
    "Parler à tout le monde, c'est ne convaincre personne.",
    'Choisissez un segment prioritaire et reformulez votre message avec ses mots.',
  ],
  conversion: [
    "Une fois qu'un visiteur arrive, sait-il quoi faire dans les 5 secondes ?",
    'Un seul CTA clair, partout, accélère plus la croissance qu’un nouveau site.',
  ],
  acquisition: [
    "La régularité bat l'intensité. Un canal, tenu 30 jours, vaut mieux que cinq lancés en l'air.",
    'Identifiez ce qui marche déjà — même approximativement — et doublez la dose.',
  ],
  measurement: [
    'Sans mesure, pas de décision : vous pilotez à l’aveugle.',
    'Trois indicateurs simples, suivis chaque semaine, suffisent à reprendre la main.',
  ],
}

const QUICK_WINS: Record<string, { time: string; text: string }[]> = {
  offer: [
    { time: '30 min', text: "Écrivez votre phrase d'offre : Pour [cible], j'aide à [résultat] grâce à [méthode], en [livrable]." },
    { time: '30 min', text: 'Listez 3 preuves (résultat, témoignage, exemple, chiffres).' },
    { time: '2 h', text: 'Créez 1 mini-pack « offre phare » (nom + contenu + à partir de + délai).' },
  ],
  audience: [
    { time: '30 min', text: 'Choisissez 1 segment prioritaire pour 30 jours + notez « pas pour qui ».' },
    { time: '30 min', text: 'Écrivez 5 phrases « problème client » avec leurs mots.' },
    { time: '2 h', text: 'Rédigez une mini-FAQ (5 questions) pour lever les objections.' },
  ],
  conversion: [
    { time: '30 min', text: 'Ajoutez 1 CTA unique partout (profil, site, signature).' },
    { time: '30 min', text: 'Rendez le contact évident (bouton réserver / devis).' },
    { time: '2 h', text: 'Ajoutez 3 preuves visibles (avis, logos, cas, témoignages).' },
  ],
  acquisition: [
    { time: '30 min', text: 'Choisissez 1 canal principal pour 30 jours.' },
    { time: '30 min', text: 'Planifiez 2 posts / 2 actions réseau pour les 14 prochains jours.' },
    { time: '2 h', text: 'Créez 1 template réutilisable (post ou message de reconnexion).' },
  ],
  measurement: [
    { time: '30 min', text: 'Créez un tableau « Leads » (date, source, besoin, next step).' },
    { time: '30 min', text: 'Choisissez 3 KPI max et notez-les 1x/semaine.' },
    { time: '2 h', text: 'Bloquez 20 min/semaine « revue marketing ».' },
  ],
}

interface DiagnosticReportProps {
  total?: number
  label?: string
  priority?: keyof typeof PILLAR_NAMES
  pillarScores?: Record<string, number>
}

const PILLAR_ORDER = ['offer', 'audience', 'conversion', 'acquisition', 'measurement']

const DiagnosticReportEmail = ({
  total = 15,
  label = 'En progression',
  priority = 'offer',
  pillarScores = { offer: 2, audience: 3, conversion: 4, acquisition: 3, measurement: 3 },
}: DiagnosticReportProps) => {
  const priorityName = PILLAR_NAMES[priority] ?? PILLAR_NAMES.offer
  const explanation = PILLAR_EXPLANATION[priority] ?? PILLAR_EXPLANATION.offer
  const wins = QUICK_WINS[priority] ?? QUICK_WINS.offer

  return (
    <Html lang="fr" dir="ltr">
      <Head />
      <Preview>Votre mini-diagnostic marketing — score, point de départ et 3 quick wins</Preview>
      <Body style={main}>
        <Container style={container}>
          {/* ===== Score block ===== */}
          <Section style={card}>
            <Text style={kicker}>Votre mini-rapport</Text>

            <table width="100%" cellPadding={0} cellSpacing={0} role="presentation" style={{ marginTop: 14 }}>
              <tbody>
                <tr>
                  <td style={scoreNumberCell}>
                    <span style={scoreNumber}>{total}</span>
                    <span style={scoreDenominator}>/30</span>
                  </td>
                  <td style={scoreLevelCell} align="left">
                    <div style={scoreLevelKicker}>Niveau</div>
                    <div style={scoreLevelValue}>{label}</div>
                  </td>
                </tr>
              </tbody>
            </table>

            {/* Pillar bars */}
            <div style={{ marginTop: 24 }}>
              {PILLAR_ORDER.map((k) => {
                const value = pillarScores[k] ?? 0
                const pct = Math.max(0, Math.min(100, (value / 6) * 100))
                const isPriority = k === priority
                return (
                  <div key={k} style={{ marginBottom: 12 }}>
                    <table width="100%" cellPadding={0} cellSpacing={0} role="presentation">
                      <tbody>
                        <tr>
                          <td style={isPriority ? pillarLabelPriority : pillarLabel}>
                            {PILLAR_NAMES[k]}
                            {isPriority && (
                              <span style={pillarTag}> · point de départ</span>
                            )}
                          </td>
                          <td align="right" style={pillarValue}>
                            {value}/6
                          </td>
                        </tr>
                      </tbody>
                    </table>
                    {/* Bar */}
                    <table
                      width="100%"
                      cellPadding={0}
                      cellSpacing={0}
                      role="presentation"
                      style={barTrack}
                    >
                      <tbody>
                        <tr>
                          <td
                            style={{
                              ...barFill,
                              width: `${pct}%`,
                            }}
                          >
                            &nbsp;
                          </td>
                          <td style={{ width: `${100 - pct}%` }}>&nbsp;</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                )
              })}
            </div>
          </Section>

          {/* ===== Priority block ===== */}
          <Section style={priorityCard}>
            <Text style={kickerPrimary}>Point de départ</Text>
            <Heading as="h2" style={priorityTitle}>
              {priorityName}
            </Heading>
            {explanation.map((p, i) => (
              <Text key={i} style={priorityParagraph}>
                {p}
              </Text>
            ))}

            <Text style={quickWinsKicker}>3 quick wins</Text>
            {wins.map((qw, i) => (
              <table
                key={i}
                width="100%"
                cellPadding={0}
                cellSpacing={0}
                role="presentation"
                style={winCard}
              >
                <tbody>
                  <tr>
                    <td style={winBadgeCell}>
                      <span style={winBadge}>{qw.time}</span>
                    </td>
                    <td style={winTextCell}>{qw.text}</td>
                  </tr>
                </tbody>
              </table>
            ))}
          </Section>

          {/* ===== CTA block ===== */}
          <Section style={ctaCard}>
            <Text style={ctaKicker}>Prochaine étape</Text>
            <Heading as="h3" style={ctaTitle}>
              Un avis extérieur et un plan clair ?
            </Heading>
            <Text style={ctaParagraph}>
              45 min gratuites pour relire votre rapport, confirmer votre point de départ et choisir
              2–3 actions concrètes pour les 30 prochains jours. Sans engagement.
            </Text>
            <Button href={BOOKING_URL} style={ctaButton}>
              Réserver mon follow-up gratuit (45 min) →
            </Button>
            <Text style={ctaFooter}>En visio · 45 min · Plan simple et priorisé</Text>
          </Section>

          <Text style={footer}>
            Vous recevez cet email parce que vous avez complété le mini-diagnostic Marketing Clarity.
            <br />
            <strong style={{ color: C.primary }}>{SITE_NAME}</strong>
          </Text>
        </Container>
      </Body>
    </Html>
  )
}

export const template = {
  component: DiagnosticReportEmail,
  subject: 'Votre mini-diagnostic marketing (score + point de départ)',
  displayName: 'Diagnostic report',
  previewData: {
    total: 18,
    label: 'En progression',
    priority: 'offer',
    pillarScores: { offer: 2, audience: 4, conversion: 4, acquisition: 4, measurement: 4 },
  },
} satisfies TemplateEntry

// ===== Styles =====
const main: React.CSSProperties = {
  backgroundColor: C.surface,
  fontFamily: 'Inter, Arial, Helvetica, sans-serif',
  color: C.text,
  margin: 0,
  padding: '32px 12px',
}

const container: React.CSSProperties = {
  maxWidth: '620px',
  margin: '0 auto',
}

const card: React.CSSProperties = {
  backgroundColor: C.white,
  borderRadius: '20px',
  border: `1px solid ${C.border}`,
  padding: '28px 24px',
  marginBottom: '16px',
}

const kicker: React.CSSProperties = {
  fontSize: '11px',
  letterSpacing: '0.18em',
  textTransform: 'uppercase',
  color: C.accent,
  fontWeight: 600,
  margin: 0,
}

const kickerPrimary: React.CSSProperties = {
  ...kicker,
  color: C.primary,
}

const scoreNumberCell: React.CSSProperties = {
  verticalAlign: 'bottom',
  paddingRight: '20px',
  whiteSpace: 'nowrap',
}

const scoreNumber: React.CSSProperties = {
  fontFamily: 'Georgia, "Times New Roman", serif',
  fontSize: '64px',
  fontWeight: 600,
  color: C.primary,
  lineHeight: 1,
}

const scoreDenominator: React.CSSProperties = {
  fontSize: '28px',
  color: C.muted,
  fontWeight: 400,
  marginLeft: '4px',
}

const scoreLevelCell: React.CSSProperties = {
  verticalAlign: 'bottom',
  paddingBottom: '6px',
}

const scoreLevelKicker: React.CSSProperties = {
  fontSize: '11px',
  letterSpacing: '0.14em',
  textTransform: 'uppercase',
  color: C.muted,
  fontWeight: 500,
  marginBottom: '4px',
}

const scoreLevelValue: React.CSSProperties = {
  fontSize: '20px',
  fontWeight: 600,
  color: C.primary,
}

const pillarLabel: React.CSSProperties = {
  fontSize: '13px',
  color: C.text2,
  fontWeight: 400,
  paddingBottom: '6px',
}

const pillarLabelPriority: React.CSSProperties = {
  ...pillarLabel,
  color: C.primary,
  fontWeight: 600,
}

const pillarTag: React.CSSProperties = {
  fontSize: '10px',
  letterSpacing: '0.12em',
  textTransform: 'uppercase',
  color: C.accent,
  fontWeight: 600,
  marginLeft: '4px',
}

const pillarValue: React.CSSProperties = {
  fontSize: '13px',
  color: C.muted,
  fontVariantNumeric: 'tabular-nums',
  paddingBottom: '6px',
}

const barTrack: React.CSSProperties = {
  width: '100%',
  height: '8px',
  backgroundColor: C.surface,
  borderRadius: '999px',
  overflow: 'hidden',
  borderCollapse: 'separate',
  tableLayout: 'fixed',
}

const barFill: React.CSSProperties = {
  backgroundColor: C.primary,
  height: '8px',
  fontSize: 0,
  lineHeight: '8px',
  borderRadius: '999px',
}

const priorityCard: React.CSSProperties = {
  backgroundColor: C.primarySoft,
  borderRadius: '20px',
  border: `1px solid ${C.border}`,
  padding: '28px 24px',
  marginBottom: '16px',
}

const priorityTitle: React.CSSProperties = {
  fontFamily: 'Georgia, "Times New Roman", serif',
  fontSize: '28px',
  lineHeight: 1.2,
  color: C.primary,
  margin: '8px 0 14px',
  fontWeight: 600,
}

const priorityParagraph: React.CSSProperties = {
  fontSize: '15px',
  lineHeight: 1.6,
  color: C.text2,
  margin: '0 0 10px',
}

const quickWinsKicker: React.CSSProperties = {
  fontSize: '12px',
  letterSpacing: '0.14em',
  textTransform: 'uppercase',
  color: C.primary,
  fontWeight: 700,
  margin: '24px 0 12px',
}

const winCard: React.CSSProperties = {
  backgroundColor: C.white,
  borderRadius: '12px',
  border: `1px solid ${C.border}`,
  marginBottom: '10px',
}

const winBadgeCell: React.CSSProperties = {
  width: '78px',
  padding: '14px 0 14px 14px',
  verticalAlign: 'top',
}

const winBadge: React.CSSProperties = {
  display: 'inline-block',
  backgroundColor: C.surface,
  color: C.primary,
  borderLeft: `3px solid ${C.accent}`,
  fontSize: '11px',
  fontWeight: 700,
  letterSpacing: '0.04em',
  padding: '6px 10px',
  borderRadius: '6px',
  textTransform: 'uppercase',
  whiteSpace: 'nowrap',
}

const winTextCell: React.CSSProperties = {
  padding: '14px 16px 14px 12px',
  fontSize: '14px',
  lineHeight: 1.55,
  color: C.text,
  verticalAlign: 'top',
}

const ctaCard: React.CSSProperties = {
  backgroundColor: C.primary,
  borderRadius: '20px',
  padding: '28px 24px',
  marginBottom: '20px',
}

const ctaKicker: React.CSSProperties = {
  fontSize: '11px',
  letterSpacing: '0.18em',
  textTransform: 'uppercase',
  color: C.accent,
  fontWeight: 600,
  margin: 0,
}

const ctaTitle: React.CSSProperties = {
  fontFamily: 'Georgia, "Times New Roman", serif',
  fontSize: '26px',
  lineHeight: 1.2,
  color: C.white,
  margin: '8px 0 12px',
  fontWeight: 600,
}

const ctaParagraph: React.CSSProperties = {
  fontSize: '15px',
  lineHeight: 1.6,
  color: C.surface,
  margin: '0 0 20px',
}

const ctaButton: React.CSSProperties = {
  display: 'inline-block',
  backgroundColor: C.accent,
  color: C.white,
  textDecoration: 'none',
  fontWeight: 700,
  fontSize: '15px',
  padding: '14px 22px',
  borderRadius: '10px',
}

const ctaFooter: React.CSSProperties = {
  fontSize: '13px',
  color: C.surface,
  marginTop: '14px',
  marginBottom: 0,
  opacity: 0.85,
}

const footer: React.CSSProperties = {
  fontSize: '12px',
  color: C.muted,
  textAlign: 'center',
  margin: '8px 12px 0',
  lineHeight: 1.6,
}
