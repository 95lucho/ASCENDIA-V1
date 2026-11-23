import {
  AlertCircle,
  CheckCircle2,
  FileCheck2,
  RotateCcw,
  Save,
} from "lucide-react";
import {
  ChallengeDefinition,
  ComplianceRating,
  CriticalEvaluation,
  FitRating,
  HallucinationRating,
} from "../../types/lab";

interface CriticalEvaluationPanelProps {
  challenge: ChallengeDefinition;
  evaluation: CriticalEvaluation;
  currentVersionNumber: number;
  completed: boolean;
  validationError: string | null;
  actionSuccess: string | null;
  onUpdateField: <K extends keyof CriticalEvaluation>(
    field: K,
    value: CriticalEvaluation[K]
  ) => void;
  onToggleCriterion: (index: number) => void;
  onSaveIteration: () => void;
  onMarkComplete: () => void;
  onReopenChallenge: () => void;
  onGoToPortfolio: () => void;
}

export function CriticalEvaluationPanel({
  challenge,
  evaluation,
  currentVersionNumber,
  completed,
  validationError,
  actionSuccess,
  onUpdateField,
  onToggleCriterion,
  onSaveIteration,
  onMarkComplete,
  onReopenChallenge,
  onGoToPortfolio,
}: CriticalEvaluationPanelProps) {
  return (
    <div className="pt-5 border-t border-[#E2E8F0] dark:border-[#334155] space-y-5">
      <div>
        <h2 className="text-lg font-bold text-[#1E3A5F] dark:text-[#F1F5F9]">
          Evaluación Crítica y Bitácora (Obligatorio)
        </h2>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
          Audita la salida antes de crear la siguiente versión o cerrar el reto.
        </p>
      </div>

      {/* Pregunta 1 */}
      <div className="space-y-2">
        <p className="text-xs font-semibold text-[#0F172A] dark:text-[#F1F5F9]">
          1. ¿Cumplió con las restricciones y el rol asignado?
        </p>
        <div className="flex flex-wrap gap-2">
          {(
            [
              { value: "si", label: "Sí, totalmente" },
              { value: "parcial", label: "Parcialmente" },
              { value: "no", label: "No cumplió" },
            ] as { value: ComplianceRating; label: string }[]
          ).map((opt) => {
            const active = evaluation.cumplioRestricciones === opt.value;
            return (
              <button
                key={opt.value}
                type="button"
                onClick={() => onUpdateField("cumplioRestricciones", opt.value)}
                className={`px-3 py-1.5 text-xs font-medium rounded-md border transition-colors ${
                  active
                    ? "bg-[#1E3A5F] dark:bg-[#2B4F7E] border-[#1E3A5F] dark:border-[#60A5FA] text-white"
                    : "bg-white dark:bg-[#0F172A] border-[#CBD5E1] dark:border-[#334155] text-[#1E293B] dark:text-[#CBD5E1] hover:border-[#8B1E24] dark:hover:border-[#60A5FA]"
                }`}
              >
                {opt.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Pregunta 2 */}
      <div className="space-y-2">
        <p className="text-xs font-semibold text-[#0F172A] dark:text-[#F1F5F9]">
          2. ¿Detectaste alucinaciones, citas inventadas, sesgos o errores
          conceptuales?
        </p>
        <div className="flex flex-wrap gap-2">
          {(
            [
              { value: "ninguno", label: "Sin errores detectados" },
              { value: "menores", label: "Imprecisiones menores" },
              { value: "graves", label: "Alucinaciones / sesgos graves" },
            ] as { value: HallucinationRating; label: string }[]
          ).map((opt) => {
            const active = evaluation.alucinacionesOSesgos === opt.value;
            return (
              <button
                key={opt.value}
                type="button"
                onClick={() => onUpdateField("alucinacionesOSesgos", opt.value)}
                className={`px-3 py-1.5 text-xs font-medium rounded-md border transition-colors ${
                  active
                    ? "bg-[#1E3A5F] dark:bg-[#2B4F7E] border-[#1E3A5F] dark:border-[#60A5FA] text-white"
                    : "bg-white dark:bg-[#0F172A] border-[#CBD5E1] dark:border-[#334155] text-[#1E293B] dark:text-[#CBD5E1] hover:border-[#8B1E24] dark:hover:border-[#60A5FA]"
                }`}
              >
                {opt.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Pregunta 3 */}
      <div className="space-y-2">
        <p className="text-xs font-semibold text-[#0F172A] dark:text-[#F1F5F9]">
          3. ¿El nivel académico y formato de salida son adecuados para tu
          propósito?
        </p>
        <div className="flex flex-wrap gap-2">
          {(
            [
              { value: "adecuado", label: "Adecuado al propósito" },
              { value: "ajustar", label: "Requiere ajuste" },
            ] as { value: FitRating; label: string }[]
          ).map((opt) => {
            const active = evaluation.nivelYFormatoAdecuados === opt.value;
            return (
              <button
                key={opt.value}
                type="button"
                onClick={() =>
                  onUpdateField("nivelYFormatoAdecuados", opt.value)
                }
                className={`px-3 py-1.5 text-xs font-medium rounded-md border transition-colors ${
                  active
                    ? "bg-[#1E3A5F] dark:bg-[#2B4F7E] border-[#1E3A5F] dark:border-[#60A5FA] text-white"
                    : "bg-white dark:bg-[#0F172A] border-[#CBD5E1] dark:border-[#334155] text-[#1E293B] dark:text-[#CBD5E1] hover:border-[#8B1E24] dark:hover:border-[#60A5FA]"
                }`}
              >
                {opt.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Lista de cotejo de verificación crítica */}
      <div className="space-y-2">
        <p className="text-xs font-semibold text-[#0F172A] dark:text-[#F1F5F9]">
          Criterios de verificación del reto
        </p>
        <div className="space-y-2">
          {challenge.criterios.map((crit, idx) => {
            const checked = Boolean(evaluation.criteriosVerificados[idx]);
            return (
              <label
                key={idx}
                className="flex items-start gap-2.5 p-2.5 rounded-lg border border-[#E2E8F0] dark:border-[#334155] bg-[#F5F7FA] dark:bg-[#0F172A] hover:bg-white dark:hover:bg-[#334155]/40 cursor-pointer transition-colors"
              >
                <input
                  type="checkbox"
                  checked={checked}
                  onChange={() => onToggleCriterion(idx)}
                  className="mt-0.5 h-4 w-4 rounded border-slate-300 dark:border-slate-600 text-[#8B1E24] focus:ring-[#1E3A5F]"
                />
                <span className="text-xs text-[#0F172A] dark:text-[#CBD5E1] leading-snug">
                  {crit}
                </span>
              </label>
            );
          })}
        </div>
      </div>

      {/* Notas de bitácora */}
      <div>
        <label
          htmlFor="reflection-notes"
          className="block text-xs font-semibold text-[#0F172A] dark:text-[#F1F5F9] mb-1.5"
        >
          Bitácora de hallazgos y plan de refinamiento
        </label>
        <textarea
          id="reflection-notes"
          rows={3}
          value={evaluation.notasReflexion}
          onChange={(e) => onUpdateField("notasReflexion", e.target.value)}
          placeholder="¿Qué falló o quedó superficial? ¿Qué contrastaste con tus apuntes/fuentes reales y qué ajustarás en la siguiente versión?"
          className="w-full px-3.5 py-2.5 text-sm text-[#0F172A] dark:text-[#F1F5F9] bg-[#F5F7FA] dark:bg-[#0F172A] border border-[#CBD5E1] dark:border-[#334155] rounded-lg placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:bg-white dark:focus:bg-[#0F172A] focus:border-[#1E3A5F] dark:focus:border-[#60A5FA] focus:outline-none transition-colors resize-y"
        />
      </div>

      {validationError && (
        <div
          role="alert"
          className="flex items-start gap-2 p-3 rounded-lg bg-red-50 dark:bg-red-950/50 border border-red-200 dark:border-red-800 text-red-900 dark:text-red-100 text-xs"
        >
          <AlertCircle
            className="w-4 h-4 text-red-700 dark:text-red-400 shrink-0 mt-0.5"
            aria-hidden="true"
          />
          <span>{validationError}</span>
        </div>
      )}

      {actionSuccess && (
        <div
          role="status"
          className="flex flex-wrap items-center justify-between gap-2 p-3 rounded-lg bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-800 text-emerald-900 dark:text-emerald-100 text-xs"
        >
          <div className="flex items-center gap-2">
            <CheckCircle2
              className="w-4 h-4 text-emerald-700 dark:text-emerald-400 shrink-0"
              aria-hidden="true"
            />
            <span>{actionSuccess}</span>
          </div>
          <button
            type="button"
            onClick={onGoToPortfolio}
            className="font-semibold text-[#1E3A5F] dark:text-[#60A5FA] underline whitespace-nowrap"
          >
            Ver en Bitácora
          </button>
        </div>
      )}

      {/* Botones de iteración y cierre */}
      <div className="flex flex-col sm:flex-row gap-3 pt-1">
        <button
          type="button"
          onClick={onSaveIteration}
          className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-white dark:bg-[#0F172A] hover:bg-[#F5F7FA] dark:hover:bg-[#334155]/60 border border-[#1E3A5F] dark:border-[#60A5FA] text-[#1E3A5F] dark:text-[#60A5FA] text-xs sm:text-sm font-semibold rounded-lg transition-colors whitespace-nowrap"
        >
          <Save className="w-4 h-4 shrink-0" aria-hidden="true" />
          <span className="tabular-nums">
            Guardar v{currentVersionNumber} y refinar (v
            {currentVersionNumber + 1})
          </span>
        </button>

        {completed ? (
          <button
            type="button"
            onClick={onReopenChallenge}
            className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-slate-100 dark:bg-[#0F172A] hover:bg-slate-200 dark:hover:bg-[#334155]/60 border border-transparent dark:border-[#334155] text-[#1E3A5F] dark:text-[#F1F5F9] text-xs sm:text-sm font-semibold rounded-lg transition-colors whitespace-nowrap"
          >
            <RotateCcw className="w-4 h-4 shrink-0" aria-hidden="true" />
            <span>Reabrir reto</span>
          </button>
        ) : (
          <button
            type="button"
            onClick={onMarkComplete}
            className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-[#1E3A5F] dark:bg-[#2B4F7E] hover:bg-[#152B47] dark:hover:bg-[#356199] text-white text-xs sm:text-sm font-semibold rounded-lg transition-colors whitespace-nowrap"
          >
            <FileCheck2 className="w-4 h-4 shrink-0" aria-hidden="true" />
            <span>Marcar como Completado</span>
          </button>
        )}
      </div>
    </div>
  );
}
