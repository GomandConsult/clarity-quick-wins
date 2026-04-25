import * as React from 'react'
import {
  Body,
  Button,
  Container,
  Head,
  Heading,
  Html,
  Preview,
  Text,
} from '@react-email/components'
import { main, container, kicker, h1, text, button, footer, SITE_KICKER } from './_auth-styles'

interface RecoveryEmailProps {
  siteName: string
  confirmationUrl: string
}

export const RecoveryEmail = ({ siteName, confirmationUrl }: RecoveryEmailProps) => (
  <Html lang="fr" dir="ltr">
    <Head />
    <Preview>Réinitialisez votre mot de passe pour {siteName}</Preview>
    <Body style={main}>
      <Container style={container}>
        <Text style={kicker}>{SITE_KICKER}</Text>
        <Heading style={h1}>Réinitialisez votre mot de passe</Heading>
        <Text style={text}>
          Nous avons reçu une demande de réinitialisation pour {siteName}. Cliquez sur le bouton ci-dessous pour choisir un nouveau mot de passe.
        </Text>
        <Button style={button} href={confirmationUrl}>Réinitialiser le mot de passe</Button>
        <Text style={footer}>
          Si vous n'êtes pas à l'origine de cette demande, vous pouvez ignorer cet email — votre mot de passe restera inchangé.
        </Text>
      </Container>
    </Body>
  </Html>
)

export default RecoveryEmail
