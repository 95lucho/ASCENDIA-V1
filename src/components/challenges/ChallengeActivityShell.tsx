import { ReactNode } from "react";
import {
  AlertCircle,
  ArrowRight,
  CheckCircle2,
  RotateCcw,
} from "lucide-react";
import { ChallengeActivityResult, ChallengeDefinition } from "../../types/lab";
import { SaoAvatar } from "../SaoAvatar";

interface ChallengeActivityShellProps {
  challenge: ChallengeDefinition;
  instructions: string;
  sequenceSteps: string[];
  previouslyCompleted: boolean;
  previousResult?: ChallengeActivityResult;
  currentOutcome: ChallengeActivityResult | null;
  validationError: string | null;
  canSubmit: boolean;
  submitLabel: string;
  onSubmit: () => void;
  onRetry: () => void;
  children: ReactNode;
}

export function ChallengeActivityShell({
  challenge,
  instructions,
  sequenceSteps,
  previouslyCompleted,
  previousResult,
  currentOutcome,
  validationError,
  canSubmit,
  submitLabel,
  onSubmit,
  onRetry,
  children,
}: ChallengeActivityShellProps) {
  return (
    <div className="space-y-6">
      {/* Banda de secuencia procedimental e instrucciones */}
      <section className="bg-white dark:bg-[#1E293B] border border-[#CBD5E1] dark:border-[#334155] rounded-xl p-5 sm:p-6 space-y-4 transition-colors">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pb-4 border-b border-[#E2E8F0] dark:border-[#334155]">
          <div className="space-y-1">
            <p className="text-xs font-bold uppercase tracking-wider text-[#8B1E24] dark:text-[#F87171]">
              Secuencia de la actividad · {challenge.level}
            </p>
            <div className="flex flex-wrap items-center gap-1.5 text-xs sm:text-sm font-semibold text-[#1E3A5F] dark:text-[#F1F5F9]">
              {sequenceSteps.map((step, idx) => (
                <span key={step} className="inline-flex items-center gap-1.5">
                  <span className="px-2.5 py-1 rounded-md bg-[#F5F7FA] dark:bg-[#0F172A] border border-[#CBD5E1] dark:border-[#334155]">
                    {step}
                  </span>
                  {idx < sequenceSteps.length - 1 && (
                    <ArrowRight
                      className="w-3.5 h-3.5 text-slate-400 shrink-0"
                      aria-hidden="true"
                    />
                  )}
                </span>
              ))}
            </div>
          </div>

          {previouslyCompleted && (
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-800 text-xs font-semibold text-emerald-800 dark:text-emerald-200 shrink-0">
              <CheckCircle2 className="w-4 h-4 shrink-0" aria-hidden="true" />
              <span>
                Aprobado previamente
                {previousResult ? ` (${previousResult.resultLabel})` : ""}
              </span>
            </div>
          )}
        </div>

        <p className="text-sm text-[#1E293B] dark:text-[#CBD5E1] leading-relaxed">
          <span className="font-semibold text-[#1E3A5F] dark:text-[#60A5FA]">
            Instrucciones:
          </span>{" "}
          {instructions}
        </p>
      </section>

      {/* Contenido interactivo específico de cada reto */}
      {children}

      {/* Mensaje de validación si falta completar pasos */}
      {validationError && (
        <div
          role="alert"
          className="flex items-start gap-2.5 p-3.5 rounded-xl bg-red-50 dark:bg-red-950/50 border border-red-200 dark:border-red-800 text-red-900 dark:text-red-100 text-xs sm:text-sm"
        >
          <AlertCircle
            className="w-4 h-4 text-red-700 dark:text-red-400 shrink-0 mt-0.5"
            aria-hidden="true"
          />
          <span>{validationError}</span>
        </div>
      )}

      {/* Retroalimentación formativa tras responder */}
      {currentOutcome && (
        <section
          aria-live="polite"
          className={`rounded-xl border p-5 sm:p-6 transition-colors ${
            currentOutcome.approved
              ? "bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-800 text-emerald-950 dark:text-emerald-100"
              : "bg-amber-50 dark:bg-amber-950/40 border-amber-200 dark:border-amber-800 text-amber-950 dark:text-amber-100"
          }`}
        >
          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4">
            <div className="shrink-0 bg-white dark:bg-[#0F172A] border border-[#CBD5E1] dark:border-[#334155] rounded-xl p-2">
              <SaoAvatar className="w-16 sm:w-20" />
            </div>

            <div className="flex-1 space-y-2 text-center sm:text-left">
              <div className="flex flex-wrap items-center justify-center sm:justify-between gap-2">
                <span className="text-xs font-bold uppercase tracking-wider">
                  {currentOutcome.approved
                    ? "Reto aprobado · SAÓ"
                    : "Retroalimentación formativa · SAÓ"}
                </span>
                <span className="font-mono text-xs font-bold px-2.5 py-1 rounded-md bg-white/80 dark:bg-[#0F172A]/80 border border-current/20 tabular-nums">
                  Resultado: {currentOutcome.resultLabel}
                </span>
              </div>

              <p className="text-sm font-medium leading-relaxed">
                {currentOutcome.saoMessage}
              </p>

              <p className="text-xs opacity-90">
                <strong>Competencia:</strong> {currentOutcome.competence}
              </p>
            </div>
          </div>
        </section>
      )}

      {/* Barra de comprobación / reintento */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <button
          type="button"
          onClick={onRetry}
          className="inline-flex items-center gap-2 px-4 py-2.5 text-xs sm:text-sm font-semibold text-[#1E3A5F] dark:text-[#F1F5F9] bg-white dark:bg-[#1E293B] hover:bg-[#F5F7FA] dark:hover:bg-[#334155]/60 border border-[#CBD5E1] dark:border-[#334155] rounded-lg transition-colors"
        >
          <RotateCcw className="w-4 h-4" aria-hidden="true" />
          <span>
            {currentOutcome ? "Volver a intentar" : "Reiniciar respuestas"}
          </span>
        </button>

        <button
          type="button"
          onClick={onSubmit}
          disabled={!canSubmit && Boolean(currentOutcome)}
          className="inline-flex items-center gap-2 px-5 py-2.5 text-xs sm:text-sm font-semibold text-white bg-[#1E3A5F] dark:bg-[#2B4F7E] hover:bg-[#152B47] dark:hover:bg-[#356199] disabled:opacity-50 rounded-lg transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#8B1E24]"
        >
          <CheckCircle2 className="w-4 h-4" aria-hidden="true" />
          <span>{submitLabel}</span>
        </button>
      </div>
    </div>
  );
}
