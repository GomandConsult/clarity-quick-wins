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

const C = {
  primary: '#30434f',
  accent: '#859CA6',
  surface: '#e4e3e2',
  text: '#30434f',
  text2: '#575659',
  muted: '#687a82',
  white: '#ffffff',
  border: '#e4e3e2',
}

const PILLAR_NAMES: Record<string, string> = {
  offer: 'Offre & différenciation',
  audience: 'Cible & message',
  conversion: 'Présence & conversion',
  acquisition: 'Acquisition & contenu',
  measurement: 'Mesure & système',
}

const FIRST_QUICK_WIN: Record<string, string> = {
  offer: "Écrivez votre phrase d'offre : Pour [cible], j'aide à [résultat] grâce à [méthode], en [livrable].",
  audience: 'Choisissez 1 segment prioritaire pour 30 jours + notez « pas pour qui ».',
  conversion: 'Ajoutez 1 CTA unique partout (profil, site, signature).',
  acquisition: 'Choisissez 1 canal principal pour 30 jours.',
  measurement: 'Créez un tableau « Leads » (date, source, besoin, next step).',
}

interface DiagnosticFollowupProps {
  priority?: keyof typeof PILLAR_NAMES
}

const DiagnosticFollowupEmail = ({ priority = 'offer' }: DiagnosticFollowupProps) => {
  const priorityName = PILLAR_NAMES[priority] ?? PILLAR_NAMES.offer
  const firstWin = FIRST_QUICK_WIN[priority] ?? FIRST_QUICK_WIN.offer

  return (
    <Html lang="fr" dir="ltr">
      <Head />
      <Preview>Avez-vous commencé votre premier quick win ?</Preview>
      <Body style={main}>
        <Container style={container}>
          <Section style={card}>
            <Text style={kicker}>Petit rappel</Text>
            <Heading as="h2" style={title}>
              Où en êtes-vous sur « {priorityName} » ?
            </Heading>
            <Text style={paragraph}>
              Il y a deux jours, votre mini-diagnostic marketing pointait vers un point de départ
              clair. La plupart des gens qui avancent vite commencent par une seule action, pas
              par dix.
            </Text>
            <Text style={paragraph}>
              Si ce n'est pas encore fait, voici celle par laquelle commencer :
            </Text>
            <Section style={winCard}>
              <Text style={winText}>{firstWin}</Text>
            </Section>
          </Section>

          <Section style={ctaCard}>
            <Text style={ctaKicker}>Un coup de main ?</Text>
            <Heading as="h3" style={ctaTitle}>
              45 min pour transformer ça en plan concret
            </Heading>
            <Text style={ctaParagraph}>
              Un regard extérieur, gratuit et sans engagement, pour confirmer votre priorité et
              caler 2–3 actions pour les 30 prochains jours.
            </Text>
            <Button href={BOOKING_URL} style={ctaButton}>
              Réserver mon suivi gratuit (45 min) →
            </Button>
          </Section>

          <Text style={footer}>
            Vous recevez cet email car vous avez complété le mini-diagnostic Marketing Clarity.
            <br />
            <strong style={{ color: C.primary }}>{SITE_NAME}</strong>
          </Text>
        </Container>
      </Body>
    </Html>
  )
}

export const template = {
  component: DiagnosticFollowupEmail,
  subject: 'On avance sur votre priorité marketing ?',
  displayName: 'Diagnostic follow-up',
  previewData: {
    priority: 'offer',
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
  maxWidth: '600px',
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

const title: React.CSSProperties = {
  fontFamily: 'Georgia, "Times New Roman", serif',
  fontSize: '26px',
  lineHeight: 1.25,
  color: C.primary,
  margin: '8px 0 14px',
  fontWeight: 600,
}

const paragraph: React.CSSProperties = {
  fontSize: '15px',
  lineHeight: 1.6,
  color: C.text2,
  margin: '0 0 12px',
}

const winCard: React.CSSProperties = {
  backgroundColor: C.surface,
  borderRadius: '12px',
  borderLeft: `3px solid ${C.accent}`,
  padding: '14px 16px',
  marginTop: '4px',
}

const winText: React.CSSProperties = {
  fontSize: '14px',
  lineHeight: 1.55,
  color: C.text,
  margin: 0,
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
  fontSize: '24px',
  lineHeight: 1.25,
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

const footer: React.CSSProperties = {
  fontSize: '12px',
  color: C.muted,
  textAlign: 'center',
  margin: '8px 12px 0',
  lineHeight: 1.6,
}
