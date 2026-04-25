import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { BrandHeader } from "@/components/Brand";
import { SiteFooter } from "@/components/SiteFooter";
import { QUESTIONS, SCALE, computeResult } from "@/lib/diagnostic";

export const Route = createFileRoute("/diagnostic")({
  head: () => ({
    meta: [
      { title: "Questionnaire · Marketing Clarity" },
      { name: "description", content: "10 questions pour identifier votre priorité marketing #1." },
    ],
  }),
  component: Diagnostic,
});

const STEPS = [0, 1, 2, 3, 4]; // 5 steps × 2 questions

function Diagnostic() {
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<Record<number, number>>({});

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [step]);

  const stepQuestions = useMemo(() => QUESTIONS.slice(step * 2, step * 2 + 2), [step]);
  const allAnsweredOnStep = stepQuestions.every((q) => answers[q.id] !== undefined);
  const isLast = step === STEPS.length - 1;
  const progress = ((step + (allAnsweredOnStep ? 1 : 0)) / STEPS.length) * 100;

  const handleNext = () => {
    if (!allAnsweredOnStep) return;
    if (isLast) {
      const result = computeResult(answers);
      sessionStorage.setItem("mc_answers", JSON.stringify(answers));
      sessionStorage.setItem("mc_result", JSON.stringify(result));
      navigate({ to: "/result" });
    } else {
      setStep(step + 1);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <BrandHeader />
      <main className="flex-1">
        <div className="mx-auto max-w-2xl px-5 py-8 sm:py-12">
          {/* Progress */}
          <div className="mb-8">
            <div className="flex items-center justify-between text-xs text-muted-foreground mb-2">
              <span>Étape {step + 1} sur {STEPS.length}</span>
              <span>{Math.round(((step + 1) / STEPS.length) * 100)} %</span>
            </div>
            <div className="h-1.5 w-full overflow-hidden rounded-full bg-secondary">
              <div
                className="h-full bg-accent transition-all duration-500 ease-out"
                style={{ width: `${((step + (allAnsweredOnStep ? 1 : 0)) / STEPS.length) * 100}%` }}
              />
            </div>
            <p className="mt-2 text-xs text-muted-foreground">
              10 questions au total (2 par étape)
            </p>
          </div>

          <div className="space-y-8">
            {stepQuestions.map((q, idx) => (
              <div key={q.id} className="rounded-2xl border border-border bg-card p-6 shadow-[var(--shadow-soft)] sm:p-7">
                <div className="text-xs font-medium uppercase tracking-wider text-primary/70">
                  Question {step * 2 + idx + 1} / 10
                </div>
                <h2 className="mt-2 text-xl font-semibold leading-snug sm:text-2xl">
                  {q.text}
                </h2>
                <div className="mt-5 grid gap-2.5 sm:grid-cols-2">
                  {SCALE.map((opt) => {
                    const selected = answers[q.id] === opt.value;
                    return (
                      <button
                        key={opt.value}
                        type="button"
                        onClick={() => setAnswers({ ...answers, [q.id]: opt.value })}
                        aria-pressed={selected}
                        className={[
                          "flex items-center justify-between gap-3 rounded-lg border-2 px-4 py-3 text-left text-sm font-medium transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-accent",
                          selected
                            ? "border-primary bg-secondary text-primary shadow-[var(--shadow-soft)]"
                            : "border-border bg-background hover:border-primary/40 hover:bg-secondary/60",
                        ].join(" ")}
                      >
                        <span className="flex items-center gap-2">
                          {selected && (
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              viewBox="0 0 20 20"
                              fill="currentColor"
                              className="h-4 w-4 text-accent"
                              aria-hidden="true"
                            >
                              <path
                                fillRule="evenodd"
                                d="M16.704 5.29a1 1 0 010 1.42l-7.5 7.5a1 1 0 01-1.42 0l-3.5-3.5a1 1 0 011.42-1.42L8.5 12.08l6.79-6.79a1 1 0 011.414 0z"
                                clipRule="evenodd"
                              />
                            </svg>
                          )}
                          {opt.label}
                        </span>
                        <span className={selected ? "text-accent" : "text-muted-foreground"}>
                          {opt.value}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <button
              type="button"
              onClick={() => setStep(Math.max(0, step - 1))}
              disabled={step === 0}
              className="self-start rounded-lg px-4 py-2.5 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground disabled:opacity-30"
            >
              ← Retour
            </button>
            <div className="flex flex-col items-end gap-1.5">
              <button
                type="button"
                onClick={handleNext}
                disabled={!allAnsweredOnStep}
                className="inline-flex items-center gap-2 rounded-lg bg-primary px-6 py-3 text-sm font-medium text-primary-foreground shadow-[var(--shadow-soft)] transition-all hover:translate-y-[-1px] hover:bg-primary/90 focus:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:translate-y-0"
              >
                {isLast ? "Voir mon résultat" : "Continuer"}
                <span>→</span>
              </button>
              {!allAnsweredOnStep && (
                <p className="text-xs text-muted-foreground">
                  Choisissez une réponse pour continuer.
                </p>
              )}
            </div>
          </div>
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
