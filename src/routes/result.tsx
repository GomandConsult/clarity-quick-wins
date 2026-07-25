import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { BrandHeader } from "@/components/Brand";
import { SiteFooter } from "@/components/SiteFooter";
import { BOOKING_URL, PILLARS, type DiagnosticResult } from "@/lib/diagnostic";

export const Route = createFileRoute("/result")({
  head: () => ({
    meta: [
      { title: "Votre résultat · Marketing Clarity" },
      { name: "description", content: "Votre score, votre priorité #1 et 3 quick wins." },
    ],
  }),
  component: Result,
});

function Result() {
  const [result, setResult] = useState<DiagnosticResult | null>(null);
  const [sentTo, setSentTo] = useState<string | null>(null);
  const [emailFailed, setEmailFailed] = useState(false);
  const [attemptedEmail, setAttemptedEmail] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const r = sessionStorage.getItem("mc_result");
    if (r) setResult(JSON.parse(r));
    const e = sessionStorage.getItem("mc_email_sent_to");
    if (e) setSentTo(e);
    const f = sessionStorage.getItem("mc_email_failed");
    if (f === "1") setEmailFailed(true);
    const a = sessionStorage.getItem("mc_email_attempt");
    if (a) setAttemptedEmail(a);
  }, []);

  const buildReportText = (r: DiagnosticResult): string => {
    const priority = PILLARS[r.priority];
    const lines: string[] = [];
    lines.push(`Marketing Clarity — Mini-rapport`);
    lines.push(`Score : ${r.total}/30 — ${r.label}`);
    lines.push(``);
    lines.push(`Scores par pilier :`);
    (Object.keys(r.pillarScores) as Array<keyof typeof r.pillarScores>).forEach((k) => {
      lines.push(`- ${PILLARS[k].name} : ${r.pillarScores[k]}/6`);
    });
    lines.push(``);
    lines.push(`Point de départ : ${priority.name}`);
    priority.explanation.forEach((l) => lines.push(l));
    lines.push(``);
    lines.push(`3 quick wins :`);
    priority.quickWins.forEach((qw, i) => {
      lines.push(`${i + 1}. [${qw.time}] ${qw.text}`);
    });
    return lines.join("\n");
  };

  const copyReport = async () => {
    if (!result) return;
    try {
      await navigator.clipboard.writeText(buildReportText(result));
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {
      setCopied(false);
    }
  };

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

  const priority = PILLARS[result.priority];

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <BrandHeader />
      <main className="flex-1">
        <div className="mx-auto max-w-3xl px-5 py-10 sm:py-14">
          {sentTo && !emailFailed && (
            <div className="mb-6 rounded-2xl border border-success/30 bg-success/10 p-4 text-sm text-success">
              ✓ Email envoyé à <strong>{sentTo}</strong>.
            </div>
          )}
          {emailFailed && (
            <div className="mb-6 rounded-2xl border border-destructive/30 bg-destructive/10 p-4 text-sm text-destructive">
              <p>
                Nous n'avons pas pu envoyer votre mini-rapport
                {attemptedEmail ? <> à <strong>{attemptedEmail}</strong></> : null}. Vous pouvez le consulter ci-dessous ou le copier.
              </p>
              <div className="mt-3 flex flex-wrap gap-2">
                <Link
                  to="/email"
                  className="inline-flex items-center gap-2 rounded-md bg-destructive px-3 py-2 text-xs font-medium text-destructive-foreground hover:bg-destructive/90"
                >
                  Renvoyer l'email
                </Link>
                <button
                  type="button"
                  onClick={copyReport}
                  className="inline-flex items-center gap-2 rounded-md border border-destructive/40 bg-background px-3 py-2 text-xs font-medium text-destructive hover:bg-destructive/5"
                >
                  {copied ? "Copié ✓" : "Copier mon mini-rapport"}
                </button>
              </div>
            </div>
          )}
          {/* Score block */}
          <div className="rounded-3xl border border-border bg-card p-7 shadow-[var(--shadow-soft)] sm:p-10">
            <div className="text-xs font-medium uppercase tracking-[0.18em] text-primary/70">
              Votre mini-rapport
            </div>
            <div className="mt-4 flex flex-wrap items-end gap-x-6 gap-y-2">
              <div className="font-display text-6xl font-semibold leading-none text-primary sm:text-7xl">
                {result.total}
                <span className="text-3xl text-muted-foreground/60">/30</span>
              </div>
              <div className="pb-2">
                <div className="text-xs uppercase tracking-wider text-muted-foreground">Niveau</div>
                <div className="text-2xl font-semibold">{result.label}</div>
              </div>
            </div>

            {/* Pillar bars */}
            <div className="mt-8 space-y-3">
              {(Object.keys(result.pillarScores) as Array<keyof typeof result.pillarScores>).map((k) => {
                const pct = (result.pillarScores[k] / 6) * 100;
                const isPriority = k === result.priority;
                return (
                  <div key={k}>
                    <div className="flex items-center justify-between text-sm">
                      <span className={isPriority ? "font-semibold text-primary" : "text-foreground/80"}>
                        {PILLARS[k].name}
                        {isPriority && <span className="ml-2 text-xs uppercase tracking-wider">· point de départ</span>}
                      </span>
                      <span className="tabular-nums text-muted-foreground">{result.pillarScores[k]}/6</span>
                    </div>
                    <div className="mt-1.5 h-2 w-full overflow-hidden rounded-full bg-secondary">
                      <div
                        className="h-full bg-primary"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
            {(() => {
              const scores = Object.values(result.pillarScores);
              const min = Math.min(...scores);
              const tied = scores.filter((s) => s === min).length > 1;
              return tied ? (
                <p className="mt-4 text-xs text-muted-foreground">
                  Scores très proches : nous avons choisi un point de départ pour vous aider à avancer.
                </p>
              ) : null;
            })()}
          </div>

          {/* Priority */}
          <div className="mt-6 rounded-3xl border border-primary/20 bg-primary-soft/50 p-7 sm:p-9">
            <div className="text-xs font-medium uppercase tracking-[0.18em] text-primary">
              Point de départ
            </div>
            <h2 className="mt-2 font-display text-3xl font-semibold leading-tight sm:text-4xl">
              {priority.name}
            </h2>
            <div className="mt-4 space-y-2 text-foreground/85">
              {priority.explanation.map((line, i) => (
                <p key={i}>{line}</p>
              ))}
            </div>

            <div className="mt-7">
              <div className="text-sm font-semibold uppercase tracking-wider text-primary/80">
                3 quick wins
              </div>
              <ol className="mt-3 space-y-3">
                {priority.quickWins.map((qw, i) => (
                  <li
                    key={i}
                    className="flex gap-4 rounded-xl border border-border bg-card p-4"
                  >
                    <span className="flex h-7 shrink-0 items-center rounded-md border border-muted-foreground/40 bg-secondary text-xs font-semibold text-primary border-l-4 border-l-accent px-[8px] border-none">
                      {qw.time}
                    </span>
                    <span className="text-sm leading-relaxed">{qw.text}</span>
                  </li>
                ))}
              </ol>
            </div>
          </div>

          {/* Booking CTA continues below */}
          {/* Booking CTA */}
          <div className="mt-6 overflow-hidden rounded-3xl border border-primary bg-primary p-7 text-primary-foreground shadow-[var(--shadow-elevated)] sm:p-10">
            <div className="text-xs font-medium uppercase tracking-[0.18em] opacity-70">
              Prochaine étape
            </div>
            <h3 className="mt-2 font-display text-3xl font-semibold leading-tight sm:text-4xl">
              Un avis extérieur et un plan clair ?
            </h3>
            <p className="mt-4 max-w-2xl text-base leading-relaxed opacity-90">
              45 min gratuites pour relire votre rapport, confirmer votre point de départ et choisir
              2–3 actions concrètes pour les 30 prochains jours. Sans engagement.
            </p>
            <div className="mt-6">
              <a
                href={BOOKING_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 rounded-lg bg-accent px-6 py-3.5 text-base font-semibold text-accent-foreground shadow-[var(--shadow-elevated)] transition-all hover:translate-y-[-1px] hover:bg-accent/90 focus:outline-none focus-visible:ring-2 focus-visible:ring-background focus-visible:ring-offset-2 focus-visible:ring-offset-primary"
              >
                Réserver mon follow-up gratuit (45 min)
                <span>→</span>
              </a>
              <p className="mt-3 text-sm opacity-80">
                En visio · 45 min · Plan simple et priorisé
              </p>
            </div>
          </div>

          <div className="mt-8 text-center">
            <Link
              to="/diagnostic"
              className="text-sm text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
            >
              Refaire le diagnostic
            </Link>
          </div>
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
