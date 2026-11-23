import { useState } from "react";
import { CheckCircle2, XCircle } from "lucide-react";
import {
  CHALLENGE_1_DATA,
  PROMPT_PART_CATEGORIES,
  PromptPartCategory,
} from "../../data/structuredChallenges";
import {
  ChallengeActivityResult,
  ChallengeDefinition,
  ChallengeProgress,
} from "../../types/lab";
import {
  ChallengeEvaluationOutcome,
  evaluateChallenge1,
} from "../../utils/challengeEvaluators";
import { ChallengeActivityShell } from "./ChallengeActivityShell";

interface Challenge1IdentifyPartsProps {
  challenge: ChallengeDefinition;
  progress: ChallengeProgress;
  onSaveDraftState: (activityState: Record<string, unknown>) => void;
  onAttemptEvaluated: (
    activityState: Record<string, unknown>,
    result: ChallengeActivityResult
  ) => void;
  onResetActivity: () => void;
}

function readSavedAssignments(
  raw?: Record<string, unknown>
): Record<string, PromptPartCategory | ""> {
  const initial: Record<string, PromptPartCategory | ""> = {};
  for (const frag of CHALLENGE_1_DATA.fragments) {
    const val = raw?.[frag.id];
    initial[frag.id] =
      val === "proposito" ||
      val === "contexto" ||
      val === "tarea" ||
      val === "formato"
        ? val
        : "";
  }
  return initial;
}

export function Challenge1IdentifyParts({
  challenge,
  progress,
  onSaveDraftState,
  onAttemptEvaluated,
  onResetActivity,
}: Challenge1IdentifyPartsProps) {
  const [assignments, setAssignments] = useState<
    Record<string, PromptPartCategory | "">
  >(() => readSavedAssignments(progress.activityState));
  const [outcome, setOutcome] = useState<ChallengeEvaluationOutcome | null>(
    null
  );
  const [validationError, setValidationError] = useState<string | null>(null);

  const allAnswered = CHALLENGE_1_DATA.fragments.every(
    (frag) => assignments[frag.id] !== ""
  );

  const handleAssign = (fragId: string, category: PromptPartCategory) => {
    const next = { ...assignments, [fragId]: category };
    setAssignments(next);
    setValidationError(null);
    setOutcome(null);
    onSaveDraftState(next);
  };

  const handleSubmit = () => {
    if (!allAnswered) {
      setValidationError(
        "Asocia los 4 fragmentos con una categoría antes de comprobar tus respuestas."
      );
      return;
    }
    setValidationError(null);
    const evaluated = evaluateChallenge1(assignments);
    setOutcome(evaluated);
    onAttemptEvaluated(assignments, evaluated.result);
  };

  const handleRetry = () => {
    const empty: Record<string, PromptPartCategory | ""> = {};
    for (const frag of CHALLENGE_1_DATA.fragments) {
      empty[frag.id] = "";
    }
    setAssignments(empty);
    setOutcome(null);
    setValidationError(null);
    onResetActivity();
  };

  return (
    <ChallengeActivityShell
      challenge={challenge}
      instructions="Observa la instrucción educativa completa y luego clasifica cada uno de sus 4 fragmentos según el componente que representa (Propósito, Contexto, Tarea o Formato). Se aprueba con al menos 3 de 4 asociaciones correctas."
      sequenceSteps={
        challenge.secuencia ?? [
          "Observar",
          "Identificar",
          "Clasificar",
          "Comprobar",
        ]
      }
      previouslyCompleted={progress.completed}
      previousResult={progress.activityResult}
      currentOutcome={outcome?.result ?? null}
      validationError={validationError}
      canSubmit={allAnswered}
      submitLabel="Comprobar asociaciones"
      onSubmit={handleSubmit}
      onRetry={handleRetry}
    >
      {/* Paso 1: Observar la instrucción completa */}
      <section className="bg-white dark:bg-[#1E293B] border border-[#CBD5E1] dark:border-[#334155] border-t-4 border-t-[#1E3A5F] dark:border-t-[#60A5FA] rounded-xl p-5 sm:p-6 space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h2 className="text-base sm:text-lg font-bold text-[#1E3A5F] dark:text-[#F1F5F9]">
            1. Observa la instrucción educativa
          </h2>
          <span className="text-xs font-medium text-slate-500 dark:text-slate-400">
            Ejemplo didáctico de referencia
          </span>
        </div>
        <blockquote className="p-4 rounded-lg bg-[#F5F7FA] dark:bg-[#0F172A] border border-[#E2E8F0] dark:border-[#334155] text-sm text-[#0F172A] dark:text-[#F1F5F9] leading-relaxed">
          “{CHALLENGE_1_DATA.fullInstruction}”
        </blockquote>

        {/* Leyenda rápida de las 4 categorías */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5 pt-1">
          {PROMPT_PART_CATEGORIES.map((cat) => (
            <div
              key={cat.id}
              className="px-3 py-2 rounded-lg bg-[#F5F7FA] dark:bg-[#0F172A] border border-[#E2E8F0] dark:border-[#334155]"
            >
              <p className="text-xs font-bold text-[#1E3A5F] dark:text-[#60A5FA]">
                {cat.label}
              </p>
              <p className="text-[11px] text-slate-600 dark:text-slate-400">
                {cat.hint}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Paso 2: Clasificar cada fragmento */}
      <section className="space-y-4">
        <h2 className="text-base sm:text-lg font-bold text-[#1E3A5F] dark:text-[#F1F5F9]">
          2. Relaciona cada fragmento con su componente
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {CHALLENGE_1_DATA.fragments.map((frag) => {
            const selected = assignments[frag.id];
            const feedbackItem = outcome?.itemFeedback.find(
              (f) => f.id === frag.id
            );

            return (
              <div
                key={frag.id}
                className={`bg-white dark:bg-[#1E293B] border rounded-xl p-5 space-y-4 transition-colors ${
                  feedbackItem
                    ? feedbackItem.correct
                      ? "border-emerald-400 dark:border-emerald-700"
                      : "border-amber-400 dark:border-amber-700"
                    : "border-[#CBD5E1] dark:border-[#334155]"
                }`}
              >
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-mono text-xs font-bold text-[#8B1E24] dark:text-[#F87171]">
                      {frag.label}
                    </span>
                    {feedbackItem &&
                      (feedbackItem.correct ? (
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
                  <p className="text-sm font-medium text-[#0F172A] dark:text-[#F1F5F9] leading-relaxed bg-[#F5F7FA] dark:bg-[#0F172A] border border-[#E2E8F0] dark:border-[#334155] rounded-lg p-3">
                    “{frag.text}”
                  </p>
                </div>

                <div
                  role="radiogroup"
                  aria-label={`Componente para ${frag.label}`}
                  className="grid grid-cols-2 gap-2"
                >
                  {PROMPT_PART_CATEGORIES.map((cat) => {
                    const active = selected === cat.id;
                    return (
                      <button
                        key={cat.id}
                        type="button"
                        role="radio"
                        aria-checked={active}
                        onClick={() => handleAssign(frag.id, cat.id)}
                        className={`px-3 py-2 text-xs font-semibold rounded-lg border transition-colors ${
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

                {feedbackItem && (
                  <p
                    className={`text-xs leading-relaxed p-3 rounded-lg ${
                      feedbackItem.correct
                        ? "bg-emerald-50 dark:bg-emerald-950/40 text-emerald-900 dark:text-emerald-200"
                        : "bg-amber-50 dark:bg-amber-950/40 text-amber-900 dark:text-amber-200"
                    }`}
                  >
                    {feedbackItem.message}
                  </p>
                )}
              </div>
            );
          })}
        </div>
      </section>
    </ChallengeActivityShell>
  );
}
