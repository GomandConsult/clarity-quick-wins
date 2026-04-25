import { createFileRoute, Link } from '@tanstack/react-router'
import { useEffect, useState } from 'react'
import { BrandHeader } from '@/components/Brand'
import { SiteFooter } from '@/components/SiteFooter'

export const Route = createFileRoute('/unsubscribe')({
  head: () => ({
    meta: [
      { title: 'Désinscription · Marketing Clarity' },
      { name: 'robots', content: 'noindex' },
    ],
  }),
  component: UnsubscribePage,
})

type Status =
  | 'checking'
  | 'valid'
  | 'already'
  | 'invalid'
  | 'submitting'
  | 'success'
  | 'error'

function UnsubscribePage() {
  const [status, setStatus] = useState<Status>('checking')
  const [token, setToken] = useState<string | null>(null)

  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const t = params.get('token')
    if (!t) {
      setStatus('invalid')
      return
    }
    setToken(t)
    fetch(`/email/unsubscribe?token=${encodeURIComponent(t)}`)
      .then(async (r) => {
        const data = await r.json().catch(() => ({}))
        if (!r.ok) return setStatus('invalid')
        if (data.valid) return setStatus('valid')
        if (data.reason === 'already_unsubscribed') return setStatus('already')
        setStatus('invalid')
      })
      .catch(() => setStatus('invalid'))
  }, [])

  const confirm = async () => {
    if (!token) return
    setStatus('submitting')
    try {
      const r = await fetch('/email/unsubscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token }),
      })
      const data = await r.json().catch(() => ({}))
      if (data.success) return setStatus('success')
      if (data.reason === 'already_unsubscribed') return setStatus('already')
      setStatus('error')
    } catch {
      setStatus('error')
    }
  }

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <BrandHeader />
      <main className="flex-1">
        <div className="mx-auto max-w-xl px-5 py-16 sm:py-24">
          <div className="rounded-3xl border border-border bg-card p-8 shadow-[var(--shadow-soft)]">
            <h1 className="font-display text-2xl font-semibold text-foreground">
              Désinscription
            </h1>

            {status === 'checking' && (
              <p className="mt-4 text-sm text-muted-foreground">Vérification du lien…</p>
            )}

            {status === 'valid' && (
              <>
                <p className="mt-3 text-sm text-muted-foreground">
                  Vous ne recevrez plus d'emails de Gomand Consult à l'adresse associée à ce lien.
                </p>
                <button
                  onClick={confirm}
                  className="mt-6 inline-flex items-center justify-center rounded-lg bg-primary px-5 py-3 text-sm font-medium text-primary-foreground hover:bg-primary/90 focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2"
                >
                  Confirmer la désinscription
                </button>
              </>
            )}

            {status === 'submitting' && (
              <p className="mt-4 text-sm text-muted-foreground">Traitement en cours…</p>
            )}

            {status === 'success' && (
              <p className="mt-4 text-sm text-foreground">
                ✓ C'est fait. Vous ne recevrez plus d'emails de notre part.
              </p>
            )}

            {status === 'already' && (
              <p className="mt-4 text-sm text-foreground">
                Vous êtes déjà désinscrit·e.
              </p>
            )}

            {status === 'invalid' && (
              <p className="mt-4 text-sm text-destructive">
                Ce lien de désinscription est invalide ou a expiré.
              </p>
            )}

            {status === 'error' && (
              <p className="mt-4 text-sm text-destructive">
                Une erreur s'est produite. Merci de réessayer.
              </p>
            )}

            <div className="mt-8 border-t border-border pt-5">
              <Link
                to="/"
                className="text-sm text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
              >
                ← Retour à l'accueil
              </Link>
            </div>
          </div>
        </div>
      </main>
      <SiteFooter />
    </div>
  )
}
