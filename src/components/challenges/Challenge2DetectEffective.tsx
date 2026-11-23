import { useState } from "react";
import { CheckCircle2, XCircle } from "lucide-react";
import { CHALLENGE_2_DATA } from "../../data/structuredChallenges";
import {
  ChallengeActivityResult,
  ChallengeDefinition,
  ChallengeProgress,
} from "../../types/lab";
import {
  ChallengeEvaluationOutcome,
  evaluateChallenge2,
} from "../../utils/challengeEvaluators";
import { ChallengeActivityShell } from "./ChallengeActivityShell";

interface Challenge2DetectEffectiveProps {
  challenge: ChallengeDefinition;
  progress: ChallengeProgress;
  onSaveDraftState: (activityState: Record<string, unknown>) => void;
  onAttemptEvaluated: (
    activityState: Record<string, unknown>,
    result: ChallengeActivityResult
  ) => void;
  onResetActivity: () => void;
}

export function Challenge2DetectEffective({
  challenge,
  progress,
  onSaveDraftState,
  onAttemptEvaluated,
  onResetActivity,
}: Challenge2DetectEffectiveProps) {
  const [selectedOption, setSelectedOption] = useState<"A" | "B" | "C" | "">(
    () => {
      const saved = progress.activityState?.selectedOption;
      return saved === "A" || saved === "B" || saved === "C" ? saved : "";
    }
  );
  const [selectedCriteria, setSelectedCriteria] = useState<string[]>(() => {
    const saved = progress.activityState?.selectedCriteria;
    return Array.isArray(saved)
      ? saved.filter((id): id is string => typeof id === "string")
      : [];
  });
  const [outcome, setOutcome] = useState<ChallengeEvaluationOutcome | null>(
    null
  );
  const [validationError, setValidationError] = useState<string | null>(null);

  const canSubmit = selectedOption !== "" && selectedCriteria.length > 0;

  const handleSelectOption = (optionId: "A" | "B" | "C") => {
    setSelectedOption(optionId);
    setOutcome(null);
    setValidationError(null);
    onSaveDraftState({ selectedOption: optionId, selectedCriteria });
  };

  const handleToggleCriterion = (criterionId: string) => {
    const exists = selectedCriteria.includes(criterionId);
    const next = exists
      ? selectedCriteria.filter((id) => id !== criterionId)
      : [...selectedCriteria, criterionId];
    setSelectedCriteria(next);
    setOutcome(null);
    setValidationError(null);
    onSaveDraftState({ selectedOption, selectedCriteria: next });
  };

  const handleSubmit = () => {
    if (!selectedOption) {
      setValidationError(
        "Primero selecciona cuál de las tres instrucciones es la más efectiva."
      );
      return;
    }
    if (selectedCriteria.length === 0) {
      setValidationError(
        "Marca los criterios que justifican por qué esa instrucción es efectiva."
      );
      return;
    }
    setValidationError(null);
    const evaluated = evaluateChallenge2(selectedOption, selectedCriteria);
    setOutcome(evaluated);
    onAttemptEvaluated(
      { selectedOption, selectedCriteria },
      evaluated.result
    );
  };

  const handleRetry = () => {
    setSelectedOption("");
    setSelectedCriteria([]);
    setOutcome(null);
    setValidationError(null);
    onResetActivity();
  };

  const optionFeedback = outcome?.itemFeedback.find(
    (f) => f.id === "option-selection"
  );

  return (
    <ChallengeActivityShell
      challenge={challenge}
      instructions="Lee la situación educativa, compara las tres instrucciones propuestas, elige la más efectiva y marca los criterios que justifican tu selección. Para aprobar necesitas acertar la instrucción y seleccionar al menos 3 criterios válidos sin marcar criterios incompatibles."
      sequenceSteps={
        challenge.secuencia ?? ["Leer", "Comparar", "Seleccionar", "Justificar"]
      }
      previouslyCompleted={progress.completed}
      previousResult={progress.activityResult}
      currentOutcome={outcome?.result ?? null}
      validationError={validationError}
      canSubmit={canSubmit}
      submitLabel="Comprobar selección y criterios"
      onSubmit={handleSubmit}
      onRetry={handleRetry}
    >
      {/* Situación educativa */}
      <section className="bg-white dark:bg-[#1E293B] border border-[#CBD5E1] dark:border-[#334155] border-t-4 border-t-[#1E3A5F] dark:border-t-[#60A5FA] rounded-xl p-5 sm:p-6 space-y-2">
        <p className="text-xs font-bold uppercase tracking-wider text-[#8B1E24] dark:text-[#F87171]">
          Situación educativa
        </p>
        <p className="text-sm sm:text-base text-[#0F172A] dark:text-[#F1F5F9] leading-relaxed">
          {CHALLENGE_2_DATA.situation}
        </p>
      </section>

      {/* Paso 1: Comparar y elegir la instrucción */}
      <section className="space-y-3">
        <h2 className="text-base sm:text-lg font-bold text-[#1E3A5F] dark:text-[#F1F5F9]">
          1. Compara y selecciona la instrucción más efectiva
        </h2>

        <div
          role="radiogroup"
          aria-label="Opciones de instrucción"
          className="grid grid-cols-1 lg:grid-cols-3 gap-4"
        >
          {CHALLENGE_2_DATA.options.map((opt) => {
            const active = selectedOption === opt.id;
            return (
              <button
                key={opt.id}
                type="button"
                role="radio"
                aria-checked={active}
                onClick={() => handleSelectOption(opt.id)}
                className={`text-left rounded-xl p-5 border-2 transition-colors flex flex-col justify-between gap-3 ${
                  active
                    ? "bg-[#1E3A5F]/5 dark:bg-[#2B4F7E]/25 border-[#1E3A5F] dark:border-[#60A5FA]"
                    : "bg-white dark:bg-[#1E293B] border-[#CBD5E1] dark:border-[#334155] hover:border-[#8B1E24] dark:hover:border-[#60A5FA]"
                }`}
              >
                <div className="space-y-2.5">
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-mono text-xs font-bold text-[#8B1E24] dark:text-[#F87171]">
                      {opt.title}
                    </span>
                    {active && (
                      <CheckCircle2
                        className="w-4 h-4 text-[#1E3A5F] dark:text-[#60A5FA]"
                        aria-hidden="true"
                      />
                    )}
                  </div>
                  <p className="text-sm text-[#0F172A] dark:text-[#F1F5F9] leading-relaxed">
                    “{opt.promptText}”
                  </p>
                </div>

                {outcome && active && optionFeedback && (
                  <p
                    className={`text-xs leading-relaxed p-3 rounded-lg ${
                      optionFeedback.correct
                        ? "bg-emerald-50 dark:bg-emerald-950/40 text-emerald-900 dark:text-emerald-200"
                        : "bg-amber-50 dark:bg-amber-950/40 text-amber-900 dark:text-amber-200"
                    }`}
                  >
                    {optionFeedback.message}
                  </p>
                )}
              </button>
            );
          })}
        </div>
      </section>

      {/* Paso 2: Justificar criterios */}
      <section className="bg-white dark:bg-[#1E293B] border border-[#CBD5E1] dark:border-[#334155] rounded-xl p-5 sm:p-6 space-y-4">
        <div>
          <h2 className="text-base sm:text-lg font-bold text-[#1E3A5F] dark:text-[#F1F5F9]">
            2. Selecciona los criterios que justifican la instrucción efectiva
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 dark:text-[#CBD5E1] mt-0.5">
            Marca únicamente los criterios presentes en una instrucción clara,
            contextualizada y precisa.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {CHALLENGE_2_DATA.criteria.map((crit) => {
            const checked = selectedCriteria.includes(crit.id);
            const fb = outcome?.itemFeedback.find((f) => f.id === crit.id);

            return (
              <div
                key={crit.id}
                className={`rounded-lg border p-3.5 transition-colors ${
                  checked
                    ? "bg-[#1E3A5F]/5 dark:bg-[#2B4F7E]/25 border-[#1E3A5F] dark:border-[#60A5FA]"
                    : "bg-[#F5F7FA] dark:bg-[#0F172A] border-[#E2E8F0] dark:border-[#334155]"
                }`}
              >
                <label className="flex items-start gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={checked}
                    onChange={() => handleToggleCriterion(crit.id)}
                    className="mt-0.5 h-4 w-4 rounded border-slate-300 dark:border-slate-600 text-[#8B1E24] focus:ring-[#1E3A5F]"
                  />
                  <span className="text-sm font-medium text-[#0F172A] dark:text-[#F1F5F9]">
                    {crit.label}
                  </span>
                </label>

                {fb && (
                  <div
                    className={`mt-2.5 flex items-start gap-2 text-xs p-2.5 rounded-md ${
                      fb.correct
                        ? "bg-emerald-50 dark:bg-emerald-950/40 text-emerald-900 dark:text-emerald-200"
                        : "bg-amber-50 dark:bg-amber-950/40 text-amber-900 dark:text-amber-200"
                    }`}
                  >
                    {fb.correct ? (
                      <CheckCircle2
                        className="w-3.5 h-3.5 shrink-0 mt-0.5"
                        aria-hidden="true"
                      />
                    ) : (
                      <XCircle
                        className="w-3.5 h-3.5 shrink-0 mt-0.5"
                        aria-hidden="true"
                      />
                    )}
                    <span>{fb.message}</span>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </section>
    </ChallengeActivityShell>
  );
}
