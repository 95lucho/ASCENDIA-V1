import { useState } from "react";
import { CheckCircle2, Columns2, XCircle } from "lucide-react";
import {
  CHALLENGE_4_DATA,
  RESPONSE_AUDIT_CATEGORIES,
  ResponseAuditCategory,
} from "../../data/structuredChallenges";
import {
  ChallengeActivityResult,
  ChallengeDefinition,
  ChallengeProgress,
} from "../../types/lab";
import {
  ChallengeEvaluationOutcome,
  evaluateChallenge4,
} from "../../utils/challengeEvaluators";
import { ChallengeActivityShell } from "./ChallengeActivityShell";

interface Challenge4AnalyzeResponseProps {
  challenge: ChallengeDefinition;
  progress: ChallengeProgress;
  onSaveDraftState: (activityState: Record<string, unknown>) => void;
  onAttemptEvaluated: (
    activityState: Record<string, unknown>,
    result: ChallengeActivityResult
  ) => void;
  onResetActivity: () => void;
}

function readSavedClassifications(
  raw?: Record<string, unknown>
): Record<string, ResponseAuditCategory | ""> {
  const initial: Record<string, ResponseAuditCategory | ""> = {};
  for (const item of CHALLENGE_4_DATA.criteriaItems) {
    const val = raw?.[item.id];
    initial[item.id] =
      val === "cumplido" ||
      val === "omitido" ||
      val === "no_correspondiente" ||
      val === "necesita_verificacion"
        ? val
        : "";
  }
  return initial;
}

export function Challenge4AnalyzeResponse({
  challenge,
  progress,
  onSaveDraftState,
  onAttemptEvaluated,
  onResetActivity,
}: Challenge4AnalyzeResponseProps) {
  const [classifications, setClassifications] = useState<
    Record<string, ResponseAuditCategory | "">
  >(() => readSavedClassifications(progress.activityState));
  const [outcome, setOutcome] = useState<ChallengeEvaluationOutcome | null>(
    null
  );
  const [validationError, setValidationError] = useState<string | null>(null);

  const allAnswered = CHALLENGE_4_DATA.criteriaItems.every(
    (item) => classifications[item.id] !== ""
  );

  const handleSelect = (itemId: string, category: ResponseAuditCategory) => {
    const next = { ...classifications, [itemId]: category };
    setClassifications(next);
    setOutcome(null);
    setValidationError(null);
    onSaveDraftState(next);
  };

  const handleSubmit = () => {
    if (!allAnswered) {
      setValidationError(
        "Clasifica los 4 aspectos de análisis antes de comprobar tu valoración."
      );
      return;
    }
    setValidationError(null);
    const evaluated = evaluateChallenge4(classifications);
    setOutcome(evaluated);
    onAttemptEvaluated(classifications, evaluated.result);
  };

  const handleRetry = () => {
    const empty: Record<string, ResponseAuditCategory | ""> = {};
    for (const item of CHALLENGE_4_DATA.criteriaItems) {
      empty[item.id] = "";
    }
    setClassifications(empty);
    setOutcome(null);
    setValidationError(null);
    onResetActivity();
  };

  return (
    <ChallengeActivityShell
      challenge={challenge}
      instructions="Observa la instrucción enviada y contrástala con la respuesta simulada. Clasifica cada uno de los 4 elementos según si fue cumplido, omitido/incompleto, no correspondiente o si necesita verificación. Se aprueba con al menos 3 de 4 análisis correctos."
      sequenceSteps={
        challenge.secuencia ?? [
          "Observar",
          "Contrastar",
          "Identificar omisiones",
          "Valorar",
        ]
      }
      previouslyCompleted={progress.completed}
      previousResult={progress.activityResult}
      currentOutcome={outcome?.result ?? null}
      validationError={validationError}
      canSubmit={allAnswered}
      submitLabel="Comprobar análisis de correspondencia"
      onSubmit={handleSubmit}
      onRetry={handleRetry}
    >
      {/* Comparación visual lado a lado: Lo solicitado vs. Lo entregado */}
      <section className="grid grid-cols-1 lg:grid-cols-2 gap-4 items-stretch">
        <div className="bg-white dark:bg-[#1E293B] border border-[#CBD5E1] dark:border-[#334155] border-t-4 border-t-[#1E3A5F] dark:border-t-[#60A5FA] rounded-xl p-5 space-y-3">
          <div className="flex items-center justify-between gap-2">
            <h2 className="text-sm sm:text-base font-bold text-[#1E3A5F] dark:text-[#F1F5F9]">
              Lo solicitado en la instrucción
            </h2>
            <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400">
              Caso de referencia
            </span>
          </div>
          <blockquote className="p-4 rounded-lg bg-[#F5F7FA] dark:bg-[#0F172A] border border-[#E2E8F0] dark:border-[#334155] font-mono text-xs sm:text-sm text-[#1E3A5F] dark:text-[#93C5FD] leading-relaxed">
            “{CHALLENGE_4_DATA.instruction}”
          </blockquote>
          <ul className="text-xs text-slate-600 dark:text-[#CBD5E1] space-y-1 pt-1">
            <li>• Público: Quinto de primaria (comprensión lectora)</li>
            <li>• Duración solicitada: 30 minutos</li>
            <li>• Componentes: Objetivo + Materiales + 3 pasos de desarrollo</li>
          </ul>
        </div>

        <div className="bg-white dark:bg-[#1E293B] border border-[#CBD5E1] dark:border-[#334155] border-t-4 border-t-[#8B1E24] dark:border-t-[#F87171] rounded-xl p-5 space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h2 className="text-sm sm:text-base font-bold text-[#1E3A5F] dark:text-[#F1F5F9]">
              Lo entregado por la IA
            </h2>
            <span className="px-2 py-0.5 rounded bg-[#F5F7FA] dark:bg-[#0F172A] border border-[#CBD5E1] dark:border-[#334155] text-[11px] font-semibold text-[#8B1E24] dark:text-[#F87171]">
              Ejemplo didáctico simulado
            </span>
          </div>
          <div className="space-y-2.5 bg-[#F5F7FA] dark:bg-[#0F172A] border border-[#E2E8F0] dark:border-[#334155] rounded-lg p-4 text-xs sm:text-sm text-[#1E293B] dark:text-[#CBD5E1]">
            {CHALLENGE_4_DATA.simulatedResponseSections.map((sec) => (
              <div key={sec.heading}>
                <p className="font-bold text-[#1E3A5F] dark:text-[#93C5FD]">
                  {sec.heading}
                </p>
                <p className="leading-relaxed">{sec.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Matriz de contraste y clasificación de los 4 criterios */}
      <section className="bg-white dark:bg-[#1E293B] border border-[#CBD5E1] dark:border-[#334155] rounded-xl p-5 sm:p-6 space-y-4">
        <div className="flex items-center gap-2">
          <Columns2
            className="w-4 h-4 text-[#1E3A5F] dark:text-[#60A5FA]"
            aria-hidden="true"
          />
          <h2 className="text-base sm:text-lg font-bold text-[#1E3A5F] dark:text-[#F1F5F9]">
            Contrasta cada elemento entre lo solicitado y lo entregado
          </h2>
        </div>

        <div className="space-y-4">
          {CHALLENGE_4_DATA.criteriaItems.map((item) => {
            const chosen = classifications[item.id];
            const fb = outcome?.itemFeedback.find((f) => f.id === item.id);

            return (
              <article
                key={item.id}
                className={`rounded-xl border p-4 sm:p-5 space-y-3 transition-colors ${
                  fb
                    ? fb.correct
                      ? "bg-emerald-50/40 dark:bg-emerald-950/20 border-emerald-300 dark:border-emerald-700"
                      : "bg-amber-50/40 dark:bg-amber-950/20 border-amber-300 dark:border-amber-700"
                    : "bg-[#F5F7FA] dark:bg-[#0F172A] border-[#E2E8F0] dark:border-[#334155]"
                }`}
              >
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <h3 className="text-sm font-bold text-[#1E3A5F] dark:text-[#F1F5F9]">
                    {item.aspect}
                  </h3>
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

                {/* Comparación visual directa */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                  <div className="bg-white dark:bg-[#1E293B] border border-[#E2E8F0] dark:border-[#334155] rounded-lg p-3">
                    <span className="block font-semibold text-[#1E3A5F] dark:text-[#60A5FA] mb-1">
                      Solicitado:
                    </span>
                    <span className="text-slate-700 dark:text-[#CBD5E1]">
                      {item.requestedSnippet}
                    </span>
                  </div>
                  <div className="bg-white dark:bg-[#1E293B] border border-[#E2E8F0] dark:border-[#334155] rounded-lg p-3">
                    <span className="block font-semibold text-[#8B1E24] dark:text-[#F87171] mb-1">
                      Entregado en la respuesta:
                    </span>
                    <span className="text-slate-700 dark:text-[#CBD5E1]">
                      {item.deliveredSnippet}
                    </span>
                  </div>
                </div>

                {/* Selector de valoración */}
                <div
                  role="radiogroup"
                  aria-label={`Valoración para ${item.aspect}`}
                  className="grid grid-cols-2 lg:grid-cols-4 gap-2 pt-1"
                >
                  {RESPONSE_AUDIT_CATEGORIES.map((cat) => {
                    const active = chosen === cat.id;
                    return (
                      <button
                        key={cat.id}
                        type="button"
                        role="radio"
                        aria-checked={active}
                        onClick={() => handleSelect(item.id, cat.id)}
                        className={`px-3 py-2 text-xs font-semibold rounded-lg border transition-colors ${
                          active
                            ? "bg-[#1E3A5F] dark:bg-[#2B4F7E] border-[#1E3A5F] dark:border-[#60A5FA] text-white"
                            : "bg-white dark:bg-[#1E293B] border-[#CBD5E1] dark:border-[#334155] text-[#1E293B] dark:text-[#CBD5E1] hover:border-[#8B1E24] dark:hover:border-[#60A5FA]"
                        }`}
                      >
                        {cat.label}
                      </button>
                    );
                  })}
                </div>

                {fb && (
                  <p
                    className={`text-xs leading-relaxed p-3 rounded-lg ${
                      fb.correct
                        ? "bg-emerald-50 dark:bg-emerald-950/40 text-emerald-900 dark:text-emerald-200"
                        : "bg-amber-50 dark:bg-amber-950/40 text-amber-900 dark:text-amber-200"
                    }`}
                  >
                    {fb.message}
                  </p>
                )}
              </article>
            );
          })}
        </div>
      </section>
    </ChallengeActivityShell>
  );
}
