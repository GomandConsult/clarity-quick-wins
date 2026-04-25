import * as React from 'react'
import {
  Body,
  Button,
  Container,
  Head,
  Heading,
  Hr,
  Html,
  Preview,
  Section,
  Text,
} from '@react-email/components'
import type { TemplateEntry } from './registry'

const SITE_NAME = 'Gomand Consult'
const BOOKING_URL = 'https://calendar.notion.so/meet/gomandconsult/premiereconsultation'

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

const DiagnosticReportEmail = ({
  total = 15,
  label = 'En progression',
  priority = 'offer',
  pillarScores = { offer: 2, audience: 3, conversion: 4, acquisition: 3, measurement: 3 },
}: DiagnosticReportProps) => {
  const priorityName = PILLAR_NAMES[priority] ?? PILLAR_NAMES.offer
  const explanation = PILLAR_EXPLANATION[priority] ?? PILLAR_EXPLANATION.offer
  const wins = QUICK_WINS[priority] ?? QUICK_WINS.offer
  const pillarKeys = Object.keys(PILLAR_NAMES)

  return (
    <Html lang="fr" dir="ltr">
      <Head />
      <Preview>Votre mini-diagnostic marketing — score, priorité #1 et 3 quick wins</Preview>
      <Body style={main}>
        <Container style={container}>
          <Section style={headerSection}>
            <Text style={kicker}>Marketing Clarity · {SITE_NAME}</Text>
            <Heading style={h1}>Votre mini-diagnostic marketing</Heading>
            <Text style={lead}>
              Voici votre score, votre priorité #1 et 3 actions concrètes pour avancer.
            </Text>
          </Section>

          <Section style={scoreCard}>
            <Text style={scoreNumber}>
              {total}
              <span style={scoreDenominator}> / 30</span>
            </Text>
            <Text style={scoreLabel}>
              Niveau : <strong style={{ color: '#30434f' }}>{label}</strong>
            </Text>
          </Section>

          <Section style={section}>
            <Text style={sectionLabel}>Détail par pilier</Text>
            {pillarKeys.map((k) => {
              const isPriority = k === priority
              return (
                <table key={k} width="100%" cellPadding={0} cellSpacing={0} role="presentation" style={pillarRow}>
                  <tbody>
                    <tr>
                      <td style={{ ...pillarName, ...(isPriority ? pillarPriority : {}) }}>
                        {PILLAR_NAMES[k]}
                        {isPriority ? ' · priorité' : ''}
                      </td>
                      <td align="right" style={pillarScore}>
                        {pillarScores[k] ?? 0}/6
                      </td>
                    </tr>
                  </tbody>
                </table>
              )
            })}
          </Section>

          <Section style={section}>
            <Text style={kickerAccent}>Votre priorité #1</Text>
            <Heading as="h2" style={h2}>
              {priorityName}
            </Heading>
            {explanation.map((p, i) => (
              <Text key={i} style={paragraph}>
                {p}
              </Text>
            ))}
          </Section>

          <Section style={section}>
            <Text style={kickerAccent}>3 quick wins</Text>
            {wins.map((qw, i) => (
              <Section key={i} style={winCard}>
                <Text style={winText}>
                  <span style={winBadge}>{qw.time}</span>
                  {qw.text}
                </Text>
              </Section>
            ))}
          </Section>

          <Section style={ctaCard}>
            <Text style={ctaKicker}>Prochaine étape</Text>
            <Heading as="h3" style={ctaTitle}>
              Un follow-up gratuit de 45 minutes
            </Heading>
            <Text style={ctaParagraph}>
              Nous relisons ensemble votre mini-rapport, validons votre priorité #1 et choisissons
              les 2–3 actions les plus utiles pour les 30 prochains jours. Sans engagement.
            </Text>
            <Button href={BOOKING_URL} style={ctaButton}>
              Réserver mon follow-up gratuit (45 min)
            </Button>
            <Text style={ctaFooter}>En visio · 45 min · Plan simple et priorisé</Text>
          </Section>

          <Hr style={hr} />
          <Text style={footer}>
            Vous recevez cet email parce que vous avez complété le mini-diagnostic Marketing Clarity.
            <br />— {SITE_NAME}
          </Text>
        </Container>
      </Body>
    </Html>
  )
}

export const template = {
  component: DiagnosticReportEmail,
  subject: 'Votre mini-diagnostic marketing (score + priorité #1)',
  displayName: 'Diagnostic report',
  previewData: {
    total: 18,
    label: 'En progression',
    priority: 'offer',
    pillarScores: { offer: 2, audience: 4, conversion: 4, acquisition: 4, measurement: 4 },
  },
} satisfies TemplateEntry

// ===== Styles (Gomand palette) =====
// Primary #30434f · Accent #859CA6 · Light bg #e4e3e2 · Text 2nd #575659 · Muted #687a82
const main: React.CSSProperties = {
  backgroundColor: '#ffffff',
  fontFamily: 'Inter, Arial, Helvetica, sans-serif',
  color: '#30434f',
  margin: 0,
  padding: '32px 16px',
}
const container: React.CSSProperties = {
  maxWidth: '600px',
  margin: '0 auto',
  backgroundColor: '#ffffff',
  borderRadius: '16px',
  border: '1px solid #e4e3e2',
  overflow: 'hidden',
}
const headerSection: React.CSSProperties = { padding: '32px 32px 8px 32px' }
const kicker: React.CSSProperties = {
  fontSize: '11px',
  letterSpacing: '0.18em',
  textTransform: 'uppercase',
  color: '#859CA6',
  fontWeight: 600,
  margin: 0,
}
const kickerAccent: React.CSSProperties = { ...kicker, color: '#30434f', marginBottom: '8px' }
const h1: React.CSSProperties = {
  fontFamily: 'Georgia, "Times New Roman", serif',
  fontSize: '26px',
  lineHeight: 1.2,
  color: '#30434f',
  margin: '12px 0 6px',
  fontWeight: 600,
}
const h2: React.CSSProperties = {
  fontFamily: 'Georgia, "Times New Roman", serif',
  fontSize: '22px',
  color: '#30434f',
  margin: '4px 0 10px',
  fontWeight: 600,
}
const lead: React.CSSProperties = { fontSize: '14px', color: '#575659', margin: 0, lineHeight: 1.55 }

const scoreCard: React.CSSProperties = {
  margin: '20px 32px 8px',
  backgroundColor: '#e4e3e2',
  borderRadius: '12px',
  borderLeft: '4px solid #859CA6',
  padding: '20px 22px',
}
const scoreNumber: React.CSSProperties = {
  fontFamily: 'Georgia, "Times New Roman", serif',
  fontSize: '42px',
  color: '#30434f',
  lineHeight: 1,
  fontWeight: 600,
  margin: 0,
}
const scoreDenominator: React.CSSProperties = { fontSize: '20px', color: '#687a82', fontWeight: 400 }
const scoreLabel: React.CSSProperties = { fontSize: '14px', color: '#575659', marginTop: '6px', marginBottom: 0 }

const section: React.CSSProperties = { padding: '20px 32px 4px' }
const sectionLabel: React.CSSProperties = {
  fontSize: '11px',
  letterSpacing: '0.12em',
  textTransform: 'uppercase',
  color: '#687a82',
  fontWeight: 600,
  margin: '0 0 8px',
}
const pillarRow: React.CSSProperties = { borderBottom: '1px solid #e4e3e2' }
const pillarName: React.CSSProperties = {
  padding: '10px 0',
  fontSize: '13px',
  color: '#575659',
  fontWeight: 400,
}
const pillarPriority: React.CSSProperties = { color: '#30434f', fontWeight: 600 }
const pillarScore: React.CSSProperties = {
  padding: '10px 0',
  fontSize: '13px',
  color: '#687a82',
  fontWeight: 500,
}

const paragraph: React.CSSProperties = {
  fontSize: '14px',
  lineHeight: 1.6,
  color: '#30434f',
  margin: '0 0 8px',
}

const winCard: React.CSSProperties = {
  backgroundColor: '#e4e3e2',
  borderRadius: '10px',
  borderLeft: '3px solid #859CA6',
  padding: '12px 14px',
  margin: '0 0 10px',
}
const winText: React.CSSProperties = {
  fontSize: '13px',
  color: '#30434f',
  margin: 0,
  lineHeight: 1.55,
}
const winBadge: React.CSSProperties = {
  display: 'inline-block',
  backgroundColor: '#30434f',
  color: '#ffffff',
  fontWeight: 600,
  fontSize: '10px',
  padding: '2px 8px',
  borderRadius: '6px',
  marginRight: '8px',
  letterSpacing: '0.04em',
  textTransform: 'uppercase',
}

const ctaCard: React.CSSProperties = {
  margin: '20px 32px 28px',
  backgroundColor: '#30434f',
  borderRadius: '14px',
  padding: '24px 26px',
}
const ctaKicker: React.CSSProperties = {
  fontSize: '11px',
  letterSpacing: '0.18em',
  textTransform: 'uppercase',
  color: '#859CA6',
  fontWeight: 600,
  margin: 0,
}
const ctaTitle: React.CSSProperties = {
  fontFamily: 'Georgia, "Times New Roman", serif',
  fontSize: '20px',
  color: '#ffffff',
  margin: '6px 0 10px',
  fontWeight: 600,
}
const ctaParagraph: React.CSSProperties = {
  fontSize: '14px',
  lineHeight: 1.6,
  color: '#e4e3e2',
  margin: '0 0 16px',
}
const ctaButton: React.CSSProperties = {
  display: 'inline-block',
  backgroundColor: '#859CA6',
  color: '#ffffff',
  textDecoration: 'none',
  fontWeight: 600,
  fontSize: '14px',
  padding: '12px 20px',
  borderRadius: '10px',
}
const ctaFooter: React.CSSProperties = {
  fontSize: '12px',
  color: '#e4e3e2',
  marginTop: '12px',
  marginBottom: 0,
  opacity: 0.85,
}

const hr: React.CSSProperties = { borderColor: '#e4e3e2', margin: '0 32px' }
const footer: React.CSSProperties = {
  padding: '18px 32px 28px',
  fontSize: '12px',
  color: '#687a82',
  margin: 0,
  lineHeight: 1.6,
}
