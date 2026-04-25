import * as React from 'react'
import {
  Body,
  Button,
  Container,
  Head,
  Heading,
  Html,
  Link,
  Preview,
  Text,
} from '@react-email/components'
import { main, container, kicker, h1, text, link, button, footer, SITE_KICKER } from './_auth-styles'

interface EmailChangeEmailProps {
  siteName: string
  email: string
  newEmail: string
  confirmationUrl: string
}

export const EmailChangeEmail = ({ siteName, email, newEmail, confirmationUrl }: EmailChangeEmailProps) => (
  <Html lang="fr" dir="ltr">
    <Head />
    <Preview>Confirmez le changement d'adresse email pour {siteName}</Preview>
    <Body style={main}>
      <Container style={container}>
        <Text style={kicker}>{SITE_KICKER}</Text>
        <Heading style={h1}>Confirmez le changement d'email</Heading>
        <Text style={text}>
          Vous avez demandé à modifier votre adresse email pour {siteName}, de{' '}
          <Link href={`mailto:${email}`} style={link}>{email}</Link> vers{' '}
          <Link href={`mailto:${newEmail}`} style={link}>{newEmail}</Link>.
        </Text>
        <Text style={text}>Cliquez sur le bouton ci-dessous pour confirmer ce changement :</Text>
        <Button style={button} href={confirmationUrl}>Confirmer le changement</Button>
        <Text style={footer}>
          Si vous n'êtes pas à l'origine de cette demande, sécurisez votre compte immédiatement.
        </Text>
      </Container>
    </Body>
  </Html>
)

export default EmailChangeEmail
