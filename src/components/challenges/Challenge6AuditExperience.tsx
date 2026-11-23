import { useState } from "react";
import { CheckCircle2, FileSearch, XCircle } from "lucide-react";
import { CHALLENGE_6_DATA } from "../../data/structuredChallenges";
import {
  ChallengeActivityResult,
  ChallengeDefinition,
  ChallengeProgress,
} from "../../types/lab";
import {
  ChallengeEvaluationOutcome,
  evaluateChallenge6,
} from "../../utils/challengeEvaluators";
import { ChallengeActivityShell } from "./ChallengeActivityShell";

interface Challenge6AuditExperienceProps {
  challenge: ChallengeDefinition;
  progress: ChallengeProgress;
  onSaveDraftState: (activityState: Record<string, unknown>) => void;
  onAttemptEvaluated: (
    activityState: Record<string, unknown>,
    result: ChallengeActivityResult
  ) => void;
  onResetActivity: () => void;
}

function readSavedCriteriaAnswers(
  raw?: unknown
): Record<string, "si" | "no" | ""> {
  const initial: Record<string, "si" | "no" | ""> = {};
  const obj =
    raw && typeof raw === "object" ? (raw as Record<string, unknown>) : {};
  for (const q of CHALLENGE_6_DATA.auditQuestions) {
    const val = obj[q.id];
    initial[q.id] = val === "si" || val === "no" ? val : "";
  }
  return initial;
}

export function Challenge6AuditExperience({
  challenge,
  progress,
  onSaveDraftState,
  onAttemptEvaluated,
  onResetActivity,
}: Challenge6AuditExperienceProps) {
  const [criteriaAnswers, setCriteriaAnswers] = useState<
    Record<string, "si" | "no" | "">
  >(() => readSavedCriteriaAnswers(progress.activityState?.criteriaAnswers));
  const [selectedProblem, setSelectedProblem] = useState<string>(() =>
    typeof progress.activityState?.selectedProblem === "string"
      ? progress.activityState.selectedProblem
      : ""
  );
  const [selectedImprovement, setSelectedImprovement] = useState<string>(() =>
    typeof progress.activityState?.selectedImprovement === "string"
      ? progress.activityState.selectedImprovement
      : ""
  );
  const [outcome, setOutcome] = useState<ChallengeEvaluationOutcome | null>(
    null
  );
  const [validationError, setValidationError] = useState<string | null>(null);

  const allCriteriaAnswered = CHALLENGE_6_DATA.auditQuestions.every(
    (q) => criteriaAnswers[q.id] !== ""
  );
  const canSubmit =
    allCriteriaAnswered && selectedProblem !== "" && selectedImprovement !== "";

  const persist = (
    nextCriteria: Record<string, "si" | "no" | "">,
    nextProb: string,
    nextImp: string
  ) => {
    onSaveDraftState({
      criteriaAnswers: nextCriteria,
      selectedProblem: nextProb,
      selectedImprovement: nextImp,
    });
  };

  const handleAnswerCriterion = (qId: string, ans: "si" | "no") => {
    const next = { ...criteriaAnswers, [qId]: ans };
    setCriteriaAnswers(next);
    setOutcome(null);
    setValidationError(null);
    persist(next, selectedProblem, selectedImprovement);
  };

  const handleSelectProblem = (probId: string) => {
    setSelectedProblem(probId);
    setOutcome(null);
    setValidationError(null);
    persist(criteriaAnswers, probId, selectedImprovement);
  };

  const handleSelectImprovement = (impId: string) => {
    setSelectedImprovement(impId);
    setOutcome(null);
    setValidationError(null);
    persist(criteriaAnswers, selectedProblem, impId);
  };

  const handleSubmit = () => {
    if (!allCriteriaAnswered) {
      setValidationError(
        "Responde los 6 criterios de auditoría antes de emitir tu informe."
      );
      return;
    }
    if (!selectedProblem || !selectedImprovement) {
      setValidationError(
        "Identifica el problema principal y selecciona una mejora coherente antes de finalizar."
      );
      return;
    }
    setValidationError(null);
    const evaluated = evaluateChallenge6(
      criteriaAnswers,
      selectedProblem,
      selectedImprovement
    );
    setOutcome(evaluated);
    onAttemptEvaluated(
      {
        criteriaAnswers,
        selectedProblem,
        selectedImprovement,
      },
      evaluated.result
    );
  };

  const handleRetry = () => {
    const emptyCriteria: Record<string, "si" | "no" | ""> = {};
    for (const q of CHALLENGE_6_DATA.auditQuestions) {
      emptyCriteria[q.id] = "";
    }
    setCriteriaAnswers(emptyCriteria);
    setSelectedProblem("");
    setSelectedImprovement("");
    setOutcome(null);
    setValidationError(null);
    onResetActivity();
  };

  const criteriaCorrectCount = outcome
    ? CHALLENGE_6_DATA.auditQuestions.filter(
        (q) => outcome.itemFeedback.find((f) => f.id === q.id)?.correct
      ).length
    : 0;
  const probFeedback = outcome?.itemFeedback.find(
    (f) => f.id === "main-problem"
  );
  const impFeedback = outcome?.itemFeedback.find(
    (f) => f.id === "coherent-improvement"
  );

  return (
    <ChallengeActivityShell
      challenge={challenge}
      instructions="Revisa el expediente didáctico simulado, responde los 6 criterios de auditoría (Sí / No), identifica el problema principal y selecciona una mejora coherente. Se aprueba resolviendo al menos 5 de 6 criterios correctamente y eligiendo una mejora coherente."
      sequenceSteps={
        challenge.secuencia ?? [
          "Reconstruir",
          "Verificar",
          "Detectar fallos",
          "Evaluar",
          "Proponer mejoras",
        ]
      }
      previouslyCompleted={progress.completed}
      previousResult={progress.activityResult}
      currentOutcome={outcome?.result ?? null}
      validationError={validationError}
      canSubmit={canSubmit}
      submitLabel="Emitir informe de auditoría"
      onSubmit={handleSubmit}
      onRetry={handleRetry}
    >
      {/* Expediente simulado */}
      <section className="bg-white dark:bg-[#1E293B] border border-[#CBD5E1] dark:border-[#334155] border-t-4 border-t-[#1E3A5F] dark:border-t-[#60A5FA] rounded-xl p-5 sm:p-6 space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <FileSearch
              className="w-4 h-4 text-[#1E3A5F] dark:text-[#60A5FA]"
              aria-hidden="true"
            />
            <h2 className="text-base sm:text-lg font-bold text-[#1E3A5F] dark:text-[#F1F5F9]">
              Expediente de la experiencia con IA
            </h2>
          </div>
          <span className="px-2 py-0.5 rounded bg-[#F5F7FA] dark:bg-[#0F172A] border border-[#CBD5E1] dark:border-[#334155] text-[11px] font-semibold text-[#8B1E24] dark:text-[#F87171]">
            Expediente didáctico simulado
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs sm:text-sm">
          <div className="bg-[#F5F7FA] dark:bg-[#0F172A] border border-[#E2E8F0] dark:border-[#334155] rounded-lg p-4 space-y-1">
            <p className="text-xs font-bold text-[#1E3A5F] dark:text-[#60A5FA]">
              1. Necesidad inicial del docente
            </p>
            <p className="text-[#1E293B] dark:text-[#CBD5E1] leading-relaxed">
              {CHALLENGE_6_DATA.dossier.teacherNeed}
            </p>
          </div>

          <div className="bg-[#F5F7FA] dark:bg-[#0F172A] border border-[#E2E8F0] dark:border-[#334155] rounded-lg p-4 space-y-1">
            <p className="text-xs font-bold text-[#1E3A5F] dark:text-[#60A5FA]">
              2. Instrucción utilizada
            </p>
            <p className="font-mono text-xs sm:text-sm text-[#1E3A5F] dark:text-[#93C5FD] leading-relaxed">
              “{CHALLENGE_6_DATA.dossier.usedPrompt}”
            </p>
          </div>

          <div className="bg-[#F5F7FA] dark:bg-[#0F172A] border border-[#E2E8F0] dark:border-[#334155] rounded-lg p-4 space-y-1">
            <p className="text-xs font-bold text-[#8B1E24] dark:text-[#F87171]">
              3. Respuesta generada por IA (simulada)
            </p>
            <p className="text-[#1E293B] dark:text-[#CBD5E1] leading-relaxed">
              {CHALLENGE_6_DATA.dossier.simulatedResponse}
            </p>
          </div>

          <div className="bg-[#F5F7FA] dark:bg-[#0F172A] border border-[#E2E8F0] dark:border-[#334155] rounded-lg p-4 space-y-1">
            <p className="text-xs font-bold text-[#8B1E24] dark:text-[#F87171]">
              4. Problemas identificados al intentar usarla
            </p>
            <p className="text-[#1E293B] dark:text-[#CBD5E1] leading-relaxed">
              {CHALLENGE_6_DATA.dossier.identifiedProblems}
            </p>
          </div>
        </div>
      </section>

      {/* Auditoría de 6 criterios */}
      <section className="bg-white dark:bg-[#1E293B] border border-[#CBD5E1] dark:border-[#334155] rounded-xl p-5 sm:p-6 space-y-4">
        <h2 className="text-base sm:text-lg font-bold text-[#1E3A5F] dark:text-[#F1F5F9]">
          1. Evalúa los seis criterios de auditoría
        </h2>

        <div className="space-y-3">
          {CHALLENGE_6_DATA.auditQuestions.map((q) => {
            const ans = criteriaAnswers[q.id];
            const fb = outcome?.itemFeedback.find((f) => f.id === q.id);

            return (
              <div
                key={q.id}
                className={`rounded-lg border p-4 space-y-2.5 transition-colors ${
                  fb
                    ? fb.correct
                      ? "bg-emerald-50/40 dark:bg-emerald-950/20 border-emerald-300 dark:border-emerald-700"
                      : "bg-amber-50/40 dark:bg-amber-950/20 border-amber-300 dark:border-amber-700"
                    : "bg-[#F5F7FA] dark:bg-[#0F172A] border-[#E2E8F0] dark:border-[#334155]"
                }`}
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <p className="text-sm font-semibold text-[#0F172A] dark:text-[#F1F5F9]">
                    <span className="font-mono text-xs text-[#8B1E24] dark:text-[#F87171] mr-2">
                      0{q.number}.
                    </span>
                    {q.question}
                  </p>

                  <div
                    role="radiogroup"
                    aria-label={q.question}
                    className="flex items-center gap-2 shrink-0"
                  >
                    {(["si", "no"] as const).map((val) => {
                      const active = ans === val;
                      return (
                        <button
                          key={val}
                          type="button"
                          role="radio"
                          aria-checked={active}
                          onClick={() => handleAnswerCriterion(q.id, val)}
                          className={`px-4 py-1.5 text-xs font-semibold rounded-lg border transition-colors ${
                            active
                              ? "bg-[#1E3A5F] dark:bg-[#2B4F7E] border-[#1E3A5F] dark:border-[#60A5FA] text-white"
                              : "bg-white dark:bg-[#1E293B] border-[#CBD5E1] dark:border-[#334155] text-[#1E293B] dark:text-[#CBD5E1] hover:border-[#8B1E24] dark:hover:border-[#60A5FA]"
                          }`}
                        >
                          {val === "si" ? "Sí" : "No"}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {fb && (
                  <div
                    className={`flex items-start gap-2 text-xs p-2.5 rounded-md ${
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

      {/* Principal problema y mejora coherente */}
      <section className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="bg-white dark:bg-[#1E293B] border border-[#CBD5E1] dark:border-[#334155] rounded-xl p-5 space-y-3">
          <h2 className="text-sm sm:text-base font-bold text-[#1E3A5F] dark:text-[#F1F5F9]">
            2. Identifica el principal problema
          </h2>
          <div
            role="radiogroup"
            aria-label="Principal problema del expediente"
            className="space-y-2"
          >
            {CHALLENGE_6_DATA.mainProblems.map((prob) => {
              const active = selectedProblem === prob.id;
              return (
                <button
                  key={prob.id}
                  type="button"
                  role="radio"
                  aria-checked={active}
                  onClick={() => handleSelectProblem(prob.id)}
                  className={`w-full text-left p-3.5 rounded-lg border text-xs sm:text-sm leading-relaxed transition-colors ${
                    active
                      ? "bg-[#1E3A5F] dark:bg-[#2B4F7E] border-[#1E3A5F] dark:border-[#60A5FA] text-white"
                      : "bg-[#F5F7FA] dark:bg-[#0F172A] border-[#CBD5E1] dark:border-[#334155] text-[#1E293B] dark:text-[#CBD5E1] hover:border-[#8B1E24] dark:hover:border-[#60A5FA]"
                  }`}
                >
                  {prob.label}
                </button>
              );
            })}
          </div>
          {probFeedback && (
            <p
              className={`text-xs p-3 rounded-lg ${
                probFeedback.correct
                  ? "bg-emerald-50 dark:bg-emerald-950/40 text-emerald-900 dark:text-emerald-200"
                  : "bg-amber-50 dark:bg-amber-950/40 text-amber-900 dark:text-amber-200"
              }`}
            >
              {probFeedback.message}
            </p>
          )}
        </div>

        <div className="bg-white dark:bg-[#1E293B] border border-[#CBD5E1] dark:border-[#334155] rounded-xl p-5 space-y-3">
          <h2 className="text-sm sm:text-base font-bold text-[#1E3A5F] dark:text-[#F1F5F9]">
            3. Selecciona una mejora coherente
          </h2>
          <div
            role="radiogroup"
            aria-label="Mejora coherente"
            className="space-y-2"
          >
            {CHALLENGE_6_DATA.improvements.map((imp) => {
              const active = selectedImprovement === imp.id;
              return (
                <button
                  key={imp.id}
                  type="button"
                  role="radio"
                  aria-checked={active}
                  onClick={() => handleSelectImprovement(imp.id)}
                  className={`w-full text-left p-3.5 rounded-lg border text-xs sm:text-sm leading-relaxed transition-colors ${
                    active
                      ? "bg-[#1E3A5F] dark:bg-[#2B4F7E] border-[#1E3A5F] dark:border-[#60A5FA] text-white"
                      : "bg-[#F5F7FA] dark:bg-[#0F172A] border-[#CBD5E1] dark:border-[#334155] text-[#1E293B] dark:text-[#CBD5E1] hover:border-[#8B1E24] dark:hover:border-[#60A5FA]"
                  }`}
                >
                  {imp.label}
                </button>
              );
            })}
          </div>
          {impFeedback && (
            <p
              className={`text-xs p-3 rounded-lg ${
                impFeedback.correct
                  ? "bg-emerald-50 dark:bg-emerald-950/40 text-emerald-900 dark:text-emerald-200"
                  : "bg-amber-50 dark:bg-amber-950/40 text-amber-900 dark:text-amber-200"
              }`}
            >
              {impFeedback.message}
            </p>
          )}
        </div>
      </section>

      {/* Informe breve final tras comprobar */}
      {outcome && (
        <section className="bg-white dark:bg-[#1E293B] border border-[#CBD5E1] dark:border-[#334155] border-l-4 border-l-[#1E3A5F] dark:border-l-[#60A5FA] rounded-xl p-5 sm:p-6 space-y-3">
          <h3 className="text-base font-bold text-[#1E3A5F] dark:text-[#F1F5F9]">
            Informe breve de auditoría
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
            <div className="p-3 rounded-lg bg-[#F5F7FA] dark:bg-[#0F172A] border border-[#E2E8F0] dark:border-[#334155]">
              <span className="block text-slate-500 dark:text-slate-400">
                Criterios acertados
              </span>
              <strong className="text-base font-bold text-[#1E3A5F] dark:text-[#60A5FA] tabular-nums">
                {criteriaCorrectCount} de 6
              </strong>
            </div>
            <div className="p-3 rounded-lg bg-[#F5F7FA] dark:bg-[#0F172A] border border-[#E2E8F0] dark:border-[#334155]">
              <span className="block text-slate-500 dark:text-slate-400">
                Criterios con error
              </span>
              <strong className="text-base font-bold text-[#8B1E24] dark:text-[#F87171] tabular-nums">
                {6 - criteriaCorrectCount} de 6
              </strong>
            </div>
            <div className="p-3 rounded-lg bg-[#F5F7FA] dark:bg-[#0F172A] border border-[#E2E8F0] dark:border-[#334155]">
              <span className="block text-slate-500 dark:text-slate-400">
                Coherencia de mejora
              </span>
              <strong className="text-sm font-bold text-[#0F172A] dark:text-[#F1F5F9]">
                {probFeedback?.correct && impFeedback?.correct
                  ? "Diagnóstico y mejora alineados"
                  : "Requiere ajuste"}
              </strong>
            </div>
          </div>
          <p className="text-xs sm:text-sm text-[#1E293B] dark:text-[#CBD5E1] leading-relaxed">
            <strong>Mejora seleccionada:</strong>{" "}
            {String(outcome.extraDetails?.selectedImprovementLabel || "Ninguna")}
          </p>
        </section>
      )}
    </ChallengeActivityShell>
  );
}
