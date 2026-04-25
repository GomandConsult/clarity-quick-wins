import { createFileRoute, Link } from "@tanstack/react-router";
import { SiteFooter } from "@/components/SiteFooter";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Marketing Clarity · 5 minutes — Gomand Consult" },
      { name: "description", content: "Trouvez votre priorité marketing #1 en 10 questions. Mini-rapport immédiat avec score, priorité et 3 quick wins." },
      { property: "og:title", content: "Diagnostic marketing · 5 minutes" },
      { property: "og:description", content: "10 questions pour prioriser l'essentiel. Gratuit, immédiat." },
    ],
  }),
  component: Landing,
});

function Landing() {
  return (
    <div className="min-h-screen flex flex-col" style={{ background: "var(--gradient-hero)" }}>
      <header className="mx-auto w-full max-w-5xl px-5 py-5">
        <div className="flex items-center gap-2 text-sm font-medium text-foreground text-center">
          <span className="h-2 w-2 rounded-full bg-accent" />
          Marketing Clarity — 5 minutes
        </div>
      </header>
      <main className="flex-1">
        <section className="mx-auto max-w-3xl px-5 pt-12 pb-20 sm:pt-20 sm:pb-28">
          <div className="inline-flex items-center gap-2 rounded-full border border-border bg-card/60 px-3 py-1 text-xs font-medium text-muted-foreground backdrop-blur">
            <span className="h-1.5 w-1.5 rounded-full bg-accent" />
            Diagnostic marketing · 5 minutes
          </div>

          <h1 className="mt-6 text-4xl font-semibold leading-[1.05] sm:text-6xl">
            Trouvez votre priorité marketing&nbsp;<span className="text-primary">#1</span>
            <span className="block text-muted-foreground/90 italic font-normal mt-1">
              (et arrêtez de vous disperser).
            </span>
          </h1>

          <p className="mt-6 max-w-2xl text-lg leading-relaxed text-muted-foreground">
            10 questions rapides pour prioriser l'essentiel. Vous recevez un mini-rapport avec votre score,
            votre priorité #1 et 3 quick wins adaptés à votre situation.
          </p>

          <div className="mt-10 flex flex-col gap-4 sm:flex-row sm:items-center">
            <Link
              to="/diagnostic"
              className="inline-flex items-center justify-center rounded-lg bg-primary px-6 py-3.5 text-base font-medium text-primary-foreground shadow-[var(--shadow-elevated)] transition-all hover:translate-y-[-1px] hover:shadow-[var(--shadow-elevated)]"
            >
              Commencer (5 minutes)
              <span className="ml-2">→</span>
            </Link>
            <p className="text-sm text-muted-foreground">
              Gratuit · Résultat immédiat · Rapport envoyé par email
            </p>
          </div>

          <div className="mt-16 grid gap-6 sm:grid-cols-3">
            {[
              { n: "01", t: "Répondez", d: "10 questions courtes, échelle simple 0–3." },
              { n: "02", t: "Recevez", d: "Score, priorité #1 et 3 actions concrètes." },
              { n: "03", t: "Avancez", d: "Mini-rapport par email + option de follow-up." },
            ].map((s) => (
              <div key={s.n} className="rounded-xl border border-border bg-card p-5 shadow-[var(--shadow-soft)]">
                <div className="font-display text-2xl text-primary">{s.n}</div>
                <div className="mt-2 font-semibold">{s.t}</div>
                <p className="mt-1 text-sm text-muted-foreground">{s.d}</p>
              </div>
            ))}
          </div>
        </section>
      </main>
      <SiteFooter />
    </div>
  );
}
