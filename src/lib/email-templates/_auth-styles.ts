// Shared Gomand brand styles for auth emails
// Palette: Primary #30434f · Accent #859CA6 · Light bg #e4e3e2 · Text 2nd #575659 · Muted #687a82
import type * as React from 'react'

export const main: React.CSSProperties = {
  backgroundColor: '#ffffff',
  fontFamily: 'Inter, Arial, Helvetica, sans-serif',
  color: '#30434f',
  margin: 0,
  padding: '32px 16px',
}

export const container: React.CSSProperties = {
  maxWidth: '600px',
  margin: '0 auto',
  backgroundColor: '#ffffff',
  borderRadius: '16px',
  border: '1px solid #e4e3e2',
  overflow: 'hidden',
  padding: '32px',
}

export const kicker: React.CSSProperties = {
  fontSize: '11px',
  letterSpacing: '0.18em',
  textTransform: 'uppercase',
  color: '#859CA6',
  fontWeight: 600,
  margin: 0,
}

export const h1: React.CSSProperties = {
  fontFamily: 'Georgia, "Times New Roman", serif',
  fontSize: '26px',
  lineHeight: 1.2,
  color: '#30434f',
  margin: '12px 0 16px',
  fontWeight: 600,
}

export const text: React.CSSProperties = {
  fontSize: '14px',
  color: '#575659',
  lineHeight: 1.6,
  margin: '0 0 16px',
}

export const link: React.CSSProperties = {
  color: '#30434f',
  textDecoration: 'underline',
}

export const button: React.CSSProperties = {
  display: 'inline-block',
  backgroundColor: '#30434f',
  color: '#ffffff',
  fontSize: '14px',
  fontWeight: 600,
  borderRadius: '10px',
  padding: '12px 22px',
  textDecoration: 'none',
  margin: '8px 0 16px',
}

export const code: React.CSSProperties = {
  fontFamily: 'Georgia, "Times New Roman", serif',
  fontSize: '32px',
  fontWeight: 600,
  color: '#30434f',
  letterSpacing: '0.18em',
  backgroundColor: '#e4e3e2',
  borderLeft: '4px solid #859CA6',
  borderRadius: '10px',
  padding: '16px 20px',
  margin: '0 0 24px',
  textAlign: 'center' as const,
}

export const footer: React.CSSProperties = {
  fontSize: '12px',
  color: '#687a82',
  margin: '24px 0 0',
  lineHeight: 1.6,
}

export const SITE_KICKER = 'Gomand Consult'
