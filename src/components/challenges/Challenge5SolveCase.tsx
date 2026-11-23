import { useState } from "react";
import { CheckCircle2, ClipboardList, XCircle } from "lucide-react";
import { CHALLENGE_5_DATA } from "../../data/structuredChallenges";
import {
  ChallengeActivityResult,
  ChallengeDefinition,
  ChallengeProgress,
} from "../../types/lab";
import {
  ChallengeEvaluationOutcome,
  evaluateChallenge5,
} from "../../utils/challengeEvaluators";
import { ChallengeActivityShell } from "./ChallengeActivityShell";

interface Challenge5SolveCaseProps {
  challenge: ChallengeDefinition;
  progress: ChallengeProgress;
  onSaveDraftState: (activityState: Record<string, unknown>) => void;
  onAttemptEvaluated: (
    activityState: Record<string, unknown>,
    result: ChallengeActivityResult
  ) => void;
  onResetActivity: () => void;
}

export function Challenge5SolveCase({
  challenge,
  progress,
  onSaveDraftState,
  onAttemptEvaluated,
  onResetActivity,
}: Challenge5SolveCaseProps) {
  const [selectedAlternative, setSelectedAlternative] = useState<
    "A" | "B" | "C" | ""
  >(() => {
    const saved = progress.activityState?.selectedAlternative;
    return saved === "A" || saved === "B" || saved === "C" ? saved : "";
  });

  const [selectedJustifications, setSelectedJustifications] = useState<
    string[]
  >(() => {
    const saved = progress.activityState?.selectedJustifications;
    return Array.isArray(saved)
      ? saved.filter((id): id is string => typeof id === "string")
      : [];
  });

  const [outcome, setOutcome] = useState<ChallengeEvaluationOutcome | null>(
    null
  );
  const [validationError, setValidationError] = useState<string | null>(null);

  const canSubmit =
    selectedAlternative !== "" && selectedJustifications.length > 0;

  const handleSelectAlt = (altId: "A" | "B" | "C") => {
    setSelectedAlternative(altId);
    setOutcome(null);
    setValidationError(null);
    onSaveDraftState({
      selectedAlternative: altId,
      selectedJustifications,
    });
  };

  const handleToggleJustification = (id: string) => {
    const exists = selectedJustifications.includes(id);
    const next = exists
      ? selectedJustifications.filter((item) => item !== id)
      : [...selectedJustifications, id];
    setSelectedJustifications(next);
    setOutcome(null);
    setValidationError(null);
    onSaveDraftState({
      selectedAlternative,
      selectedJustifications: next,
    });
  };

  const handleSubmit = () => {
    if (!selectedAlternative) {
      setValidationError(
        "Selecciona cuál de las tres propuestas simuladas responde mejor al caso."
      );
      return;
    }
    if (selectedJustifications.length === 0) {
      setValidationError(
        "Marca al menos tres dimensiones que justifiquen tu decisión pedagógica."
      );
      return;
    }
    setValidationError(null);
    const evaluated = evaluateChallenge5(
      selectedAlternative,
      selectedJustifications
    );
    setOutcome(evaluated);
    onAttemptEvaluated(
      { selectedAlternative, selectedJustifications },
      evaluated.result
    );
  };

  const handleRetry = () => {
    setSelectedAlternative("");
    setSelectedJustifications([]);
    setOutcome(null);
    setValidationError(null);
    onResetActivity();
  };

  const altFeedback = outcome?.itemFeedback.find((f) => f.id === "alt-choice");

  return (
    <ChallengeActivityShell
      challenge={challenge}
      instructions="Comprende las necesidades reales del caso, analiza las tres propuestas simuladas de IA, elige la más coherente y justifica tu decisión seleccionando al menos tres dimensiones válidas (pertinencia pedagógica, viabilidad, adecuación al tiempo y comprobación del aprendizaje)."
      sequenceSteps={
        challenge.secuencia ?? [
          "Comprender el caso",
          "Establecer necesidades",
          "Analizar alternativas",
          "Justificar decisiones",
        ]
      }
      previouslyCompleted={progress.completed}
      previousResult={progress.activityResult}
      currentOutcome={outcome?.result ?? null}
      validationError={validationError}
      canSubmit={canSubmit}
      submitLabel="Comprobar resolución del caso"
      onSubmit={handleSubmit}
      onRetry={handleRetry}
    >
      {/* Paso 1: Caso y necesidades */}
      <section className="bg-white dark:bg-[#1E293B] border border-[#CBD5E1] dark:border-[#334155] border-t-4 border-t-[#1E3A5F] dark:border-t-[#60A5FA] rounded-xl p-5 sm:p-6 space-y-4">
        <div className="space-y-1.5">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#8B1E24] dark:text-[#F87171]">
            <ClipboardList className="w-4 h-4" aria-hidden="true" />
            <span>Caso educativo contextualizado</span>
          </div>
          <p className="text-sm sm:text-base text-[#0F172A] dark:text-[#F1F5F9] leading-relaxed">
            {CHALLENGE_5_DATA.caseDescription}
          </p>
        </div>

        <div className="bg-[#F5F7FA] dark:bg-[#0F172A] border border-[#E2E8F0] dark:border-[#334155] rounded-lg p-4">
          <p className="text-xs font-bold text-[#1E3A5F] dark:text-[#60A5FA] mb-2">
            Necesidades y condiciones clave del aula:
          </p>
          <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 text-xs text-[#1E293B] dark:text-[#CBD5E1]">
            {CHALLENGE_5_DATA.needs.map((need) => (
              <li
                key={need}
                className="flex items-center gap-2 bg-white dark:bg-[#1E293B] border border-[#E2E8F0] dark:border-[#334155] rounded-md px-3 py-2"
              >
                <span
                  className="w-1.5 h-1.5 rounded-full bg-[#8B1E24] dark:bg-[#F87171] shrink-0"
                  aria-hidden="true"
                />
                <span>{need}</span>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* Paso 2: Analizar tres respuestas simuladas */}
      <section className="space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h2 className="text-base sm:text-lg font-bold text-[#1E3A5F] dark:text-[#F1F5F9]">
            1. Analiza las tres propuestas y selecciona la más adecuada
          </h2>
          <span className="px-2 py-0.5 rounded bg-white dark:bg-[#1E293B] border border-[#CBD5E1] dark:border-[#334155] text-[11px] font-semibold text-[#8B1E24] dark:text-[#F87171]">
            Ejemplos didácticos simulados
          </span>
        </div>

        <div
          role="radiogroup"
          aria-label="Alternativas simuladas de IA"
          className="grid grid-cols-1 lg:grid-cols-3 gap-4"
        >
          {CHALLENGE_5_DATA.alternatives.map((alt) => {
            const active = selectedAlternative === alt.id;
            return (
              <button
                key={alt.id}
                type="button"
                role="radio"
                aria-checked={active}
                onClick={() => handleSelectAlt(alt.id)}
                className={`text-left rounded-xl p-5 border-2 transition-colors flex flex-col justify-between gap-3 ${
                  active
                    ? "bg-[#1E3A5F]/5 dark:bg-[#2B4F7E]/25 border-[#1E3A5F] dark:border-[#60A5FA]"
                    : "bg-white dark:bg-[#1E293B] border-[#CBD5E1] dark:border-[#334155] hover:border-[#8B1E24] dark:hover:border-[#60A5FA]"
                }`}
              >
                <div className="space-y-2.5">
                  <div className="flex items-start justify-between gap-2">
                    <span className="text-xs font-bold text-[#8B1E24] dark:text-[#F87171]">
                      {alt.title}
                    </span>
                    {active && (
                      <CheckCircle2
                        className="w-4 h-4 text-[#1E3A5F] dark:text-[#60A5FA] shrink-0"
                        aria-hidden="true"
                      />
                    )}
                  </div>
                  <p className="text-sm text-[#1E293B] dark:text-[#CBD5E1] leading-relaxed">
                    {alt.summary}
                  </p>
                </div>

                {outcome && active && altFeedback && (
                  <p
                    className={`text-xs leading-relaxed p-3 rounded-lg ${
                      altFeedback.correct
                        ? "bg-emerald-50 dark:bg-emerald-950/40 text-emerald-900 dark:text-emerald-200"
                        : "bg-amber-50 dark:bg-amber-950/40 text-amber-900 dark:text-amber-200"
                    }`}
                  >
                    {altFeedback.message}
                  </p>
                )}
              </button>
            );
          })}
        </div>
      </section>

      {/* Paso 3: Justificar dimensiones */}
      <section className="bg-white dark:bg-[#1E293B] border border-[#CBD5E1] dark:border-[#334155] rounded-xl p-5 sm:p-6 space-y-4">
        <div>
          <h2 className="text-base sm:text-lg font-bold text-[#1E3A5F] dark:text-[#F1F5F9]">
            2. Justifica tu decisión según las dimensiones del caso
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 dark:text-[#CBD5E1] mt-0.5">
            Selecciona al menos tres dimensiones que expliquen por qué esa
            alternativa resuelve la situación (evita criterios incompatibles).
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {CHALLENGE_5_DATA.justifications.map((just) => {
            const checked = selectedJustifications.includes(just.id);
            const fb = outcome?.itemFeedback.find((f) => f.id === just.id);

            return (
              <div
                key={just.id}
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
                    onChange={() => handleToggleJustification(just.id)}
                    className="mt-0.5 h-4 w-4 rounded border-slate-300 dark:border-slate-600 text-[#8B1E24] focus:ring-[#1E3A5F]"
                  />
                  <span className="text-xs sm:text-sm text-[#0F172A] dark:text-[#F1F5F9] leading-relaxed">
                    {just.label}
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
