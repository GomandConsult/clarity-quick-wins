import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { BrandHeader } from "@/components/Brand";
import { SiteFooter } from "@/components/SiteFooter";
import type { DiagnosticResult } from "@/lib/diagnostic";

export const Route = createFileRoute("/email")({
  head: () => ({
    meta: [
      { title: "Recevoir mon mini-rapport · Marketing Clarity" },
      { name: "description", content: "Indiquez votre email pour recevoir votre mini-rapport personnalisé." },
    ],
  }),
  component: EmailGate,
});

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function EmailGate() {
  const navigate = useNavigate();
  const [result, setResult] = useState<DiagnosticResult | null>(null);
  const [answers, setAnswers] = useState<Record<number, number> | null>(null);
  const [email, setEmail] = useState("");
  const [transactionalConsent, setTransactionalConsent] = useState(false);
  const [marketingConsent, setMarketingConsent] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const r = sessionStorage.getItem("mc_result");
    const a = sessionStorage.getItem("mc_answers");
    if (r) setResult(JSON.parse(r));
    if (a) setAnswers(JSON.parse(a));
  }, []);

  if (!result) {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <BrandHeader />
        <main className="flex-1 mx-auto max-w-xl px-5 py-20 text-center">
          <h1 className="text-2xl font-semibold">Aucun résultat trouvé</h1>
          <p className="mt-3 text-muted-foreground">
            Commencez par répondre au mini-diagnostic en 10 questions.
          </p>
          <Link
            to="/diagnostic"
            className="mt-6 inline-flex rounded-lg bg-primary px-5 py-3 text-sm font-medium text-primary-foreground"
          >
            Commencer le diagnostic
          </Link>
        </main>
        <SiteFooter />
      </div>
    );
  }

  const emailValid = EMAIL_RE.test(email.trim());
  const canSubmit = emailValid && transactionalConsent && !submitting;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canSubmit) return;
    setError(null);
    setSubmitting(true);
    const cleanEmail = email.trim();
    try {
      await fetch("/api/send-report", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: cleanEmail,
          result,
          answers,
          marketingConsent,
        }),
      });
    } catch {
      // Soft-fail: still proceed to result, the report is visible on screen.
    } finally {
      sessionStorage.setItem("mc_email_sent_to", cleanEmail);
      navigate({ to: "/result" });
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <BrandHeader />
      <main className="flex-1">
        <div className="mx-auto max-w-2xl px-5 py-10 sm:py-14">
          <div className="rounded-3xl border border-border bg-card p-7 shadow-[var(--shadow-soft)] sm:p-10">
            <div className="text-xs font-medium uppercase tracking-[0.18em] text-primary/70">
              Dernière étape
            </div>
            <h1 className="mt-3 font-display text-3xl font-semibold leading-tight sm:text-4xl">
              Recevoir mon mini-rapport
            </h1>
            <p className="mt-3 text-base text-muted-foreground">
              Score, priorité #1 et 3 quick wins, envoyés à votre adresse — utile à relire et partager.
            </p>
            <p className="mt-2 text-sm text-muted-foreground">
              Votre mini-rapport s'affiche juste après l'envoi.
            </p>

            <form onSubmit={handleSubmit} className="mt-7 space-y-5" noValidate>
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-foreground">
                  Votre email professionnel
                </label>
                <input
                  id="email"
                  type="email"
                  required
                  autoFocus
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="vous@entreprise.com"
                  className="mt-1.5 w-full rounded-lg border border-input bg-background px-4 py-3 text-sm outline-none transition-colors focus:border-primary focus:ring-2 focus:ring-primary/20"
                />
              </div>

              <label className="flex items-start gap-3 text-sm text-foreground/85">
                <input
                  type="checkbox"
                  checked={transactionalConsent}
                  onChange={(e) => setTransactionalConsent(e.target.checked)}
                  className="mt-0.5 h-4 w-4 rounded border-input accent-primary"
                />
                <span>
                  J'accepte de recevoir mon mini-rapport par email.{" "}
                  <span className="text-muted-foreground">(obligatoire)</span>
                </span>
              </label>

              <label className="flex items-start gap-3 text-sm text-foreground/85">
                <input
                  type="checkbox"
                  checked={marketingConsent}
                  onChange={(e) => setMarketingConsent(e.target.checked)}
                  className="mt-0.5 h-4 w-4 rounded border-input accent-primary"
                />
                <span>
                  Je souhaite aussi recevoir des conseils marketing de Gomand Consult (1–2 emails/mois).
                  <span className="block text-xs text-muted-foreground mt-0.5">
                    Désinscription à tout moment.
                  </span>
                </span>
              </label>

              {error && <p className="text-sm text-destructive">{error}</p>}

              <div className="flex flex-col gap-2">
                <button
                  type="submit"
                  disabled={!canSubmit}
                  className="inline-flex w-full sm:w-auto items-center justify-center gap-2 rounded-lg bg-primary px-6 py-3.5 text-sm font-medium text-primary-foreground shadow-[var(--shadow-soft)] transition-all hover:translate-y-[-1px] hover:bg-primary/90 focus:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:translate-y-0"
                >
                  {submitting ? "Envoi…" : "Voir mon mini-rapport"}
                  <span>→</span>
                </button>
                {!canSubmit && !submitting && (
                  <p className="text-xs text-muted-foreground">
                    {emailValid
                      ? "Cochez la case obligatoire pour continuer."
                      : "Indiquez un email valide pour continuer."}
                  </p>
                )}
              </div>
            </form>
          </div>

          <div className="mt-6 text-center">
            <Link
              to="/diagnostic"
              className="text-sm text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
            >
              ← Revenir au questionnaire
            </Link>
          </div>
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
