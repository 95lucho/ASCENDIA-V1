import { useState } from "react";
import { AlertTriangle, CheckCircle2, XCircle } from "lucide-react";
import {
  CHALLENGE_3_DATA,
  ERROR_CATEGORIES,
  ErrorCategoryId,
} from "../../data/structuredChallenges";
import {
  ChallengeActivityResult,
  ChallengeDefinition,
  ChallengeProgress,
} from "../../types/lab";
import {
  ChallengeEvaluationOutcome,
  evaluateChallenge3,
} from "../../utils/challengeEvaluators";
import { ChallengeActivityShell } from "./ChallengeActivityShell";

interface Challenge3FindErrorsProps {
  challenge: ChallengeDefinition;
  progress: ChallengeProgress;
  onSaveDraftState: (activityState: Record<string, unknown>) => void;
  onAttemptEvaluated: (
    activityState: Record<string, unknown>,
    result: ChallengeActivityResult
  ) => void;
  onResetActivity: () => void;
}

function readSavedErrors(
  raw?: Record<string, unknown>
): Record<string, ErrorCategoryId | ""> {
  const initial: Record<string, ErrorCategoryId | ""> = {};
  for (const item of CHALLENGE_3_DATA.items) {
    const val = raw?.[item.id];
    initial[item.id] =
      val === "falta_contexto" ||
      val === "tarea_ambigua" ||
      val === "ausencia_restricciones" ||
      val === "falta_formato"
        ? val
        : "";
  }
  return initial;
}

export function Challenge3FindErrors({
  challenge,
  progress,
  onSaveDraftState,
  onAttemptEvaluated,
  onResetActivity,
}: Challenge3FindErrorsProps) {
  const [selections, setSelections] = useState<
    Record<string, ErrorCategoryId | "">
  >(() => readSavedErrors(progress.activityState));
  const [outcome, setOutcome] = useState<ChallengeEvaluationOutcome | null>(
    null
  );
  const [validationError, setValidationError] = useState<string | null>(null);

  const allAnswered = CHALLENGE_3_DATA.items.every(
    (item) => selections[item.id] !== ""
  );

  const handleSelect = (itemId: string, catId: ErrorCategoryId) => {
    const next = { ...selections, [itemId]: catId };
    setSelections(next);
    setOutcome(null);
    setValidationError(null);
    onSaveDraftState(next);
  };

  const handleSubmit = () => {
    if (!allAnswered) {
      setValidationError(
        "Diagnostica el problema de las 4 instrucciones antes de comprobar."
      );
      return;
    }
    setValidationError(null);
    const evaluated = evaluateChallenge3(selections);
    setOutcome(evaluated);
    onAttemptEvaluated(selections, evaluated.result);
  };

  const handleRetry = () => {
    const empty: Record<string, ErrorCategoryId | ""> = {};
    for (const item of CHALLENGE_3_DATA.items) {
      empty[item.id] = "";
    }
    setSelections(empty);
    setOutcome(null);
    setValidationError(null);
    onResetActivity();
  };

  return (
    <ChallengeActivityShell
      challenge={challenge}
      instructions="Examina cada una de las cuatro instrucciones dirigidas a una IA y clasifica cuál es el fallo principal que limita su eficacia. Al comprobar, verás por qué cada error afecta la respuesta y cómo corregirlo. Se aprueba con al menos 3 de 4 diagnósticos correctos."
      sequenceSteps={
        challenge.secuencia ?? [
          "Examinar",
          "Detectar",
          "Clasificar",
          "Comprender cómo corregir",
        ]
      }
      previouslyCompleted={progress.completed}
      previousResult={progress.activityResult}
      currentOutcome={outcome?.result ?? null}
      validationError={validationError}
      canSubmit={allAnswered}
      submitLabel="Comprobar diagnósticos"
      onSubmit={handleSubmit}
      onRetry={handleRetry}
    >
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {CHALLENGE_3_DATA.items.map((item) => {
          const chosen = selections[item.id];
          const fb = outcome?.itemFeedback.find((f) => f.id === item.id);

          return (
            <section
              key={item.id}
              className={`bg-white dark:bg-[#1E293B] border rounded-xl p-5 space-y-4 transition-colors ${
                fb
                  ? fb.correct
                    ? "border-emerald-400 dark:border-emerald-700"
                    : "border-amber-400 dark:border-amber-700"
                  : "border-[#CBD5E1] dark:border-[#334155]"
              }`}
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between gap-2">
                  <span className="inline-flex items-center gap-1.5 font-mono text-xs font-bold text-[#8B1E24] dark:text-[#F87171]">
                    <AlertTriangle className="w-3.5 h-3.5" aria-hidden="true" />
                    <span>{item.label}</span>
                  </span>
                  {fb &&
                    (fb.correct ? (
                      <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-700 dark:text-emerald-400">
                        <CheckCircle2 className="w-3.5 h-3.5" aria-hidden="true" />
                        <span>Correcto</span>
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-xs font-semibold text-amber-700 dark:text-amber-400">
                        <XCircle className="w-3.5 h-3.5" aria-hidden="true" />
                        <span>Revisar</span>
                      </span>
                    ))}
                </div>

                <blockquote className="p-3.5 rounded-lg bg-[#F5F7FA] dark:bg-[#0F172A] border border-[#E2E8F0] dark:border-[#334155] font-mono text-xs sm:text-sm text-[#1E3A5F] dark:text-[#93C5FD] leading-relaxed">
                  “{item.promptText}”
                </blockquote>
              </div>

              <div className="space-y-1.5">
                <p className="text-xs font-semibold text-slate-600 dark:text-slate-400">
                  ¿Cuál es el problema principal?
                </p>
                <div
                  role="radiogroup"
                  aria-label={`Categoría de error para ${item.label}`}
                  className="space-y-1.5"
                >
                  {ERROR_CATEGORIES.map((cat) => {
                    const active = chosen === cat.id;
                    return (
                      <button
                        key={cat.id}
                        type="button"
                        role="radio"
                        aria-checked={active}
                        onClick={() => handleSelect(item.id, cat.id)}
                        className={`w-full text-left px-3 py-2 text-xs font-medium rounded-lg border transition-colors ${
                          active
                            ? "bg-[#1E3A5F] dark:bg-[#2B4F7E] border-[#1E3A5F] dark:border-[#60A5FA] text-white"
                            : "bg-white dark:bg-[#0F172A] border-[#CBD5E1] dark:border-[#334155] text-[#1E293B] dark:text-[#CBD5E1] hover:border-[#8B1E24] dark:hover:border-[#60A5FA]"
                        }`}
                      >
                        {cat.label}
                      </button>
                    );
                  })}
                </div>
              </div>

              {fb && (
                <div
                  className={`p-3 rounded-lg text-xs leading-relaxed ${
                    fb.correct
                      ? "bg-emerald-50 dark:bg-emerald-950/40 text-emerald-900 dark:text-emerald-200"
                      : "bg-amber-50 dark:bg-amber-950/40 text-amber-900 dark:text-amber-200"
                  }`}
                >
                  {fb.message}
                </div>
              )}
            </section>
          );
        })}
      </div>
    </ChallengeActivityShell>
  );
}
