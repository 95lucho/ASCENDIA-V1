import {
  AlertCircle,
  BookOpenCheck,
  CheckCircle2,
  FileCheck2,
  RotateCcw,
  Save,
} from "lucide-react";
import {
  CriticalEvaluation,
  SimpleEvaluationRating,
} from "../../types/lab";

interface CriticalEvaluationPanelProps {
  evaluation: CriticalEvaluation;
  currentVersionNumber: number;
  completed: boolean;
  validationError: string | null;
  actionSuccess: string | null;
  onUpdateField: <K extends keyof CriticalEvaluation>(
    field: K,
    value: CriticalEvaluation[K]
  ) => void;
  onSaveIteration: () => void;
  onMarkComplete: () => void;
  onReopenChallenge: () => void;
  onGoToPortfolio: () => void;
}

const SIMPLE_OPTIONS: { value: SimpleEvaluationRating; label: string }[] = [
  { value: "si", label: "Sí." },
  { value: "parcial", label: "Parcialmente." },
  { value: "no", label: "No." },
];

export function CriticalEvaluationPanel({
  evaluation,
  currentVersionNumber,
  completed,
  validationError,
  actionSuccess,
  onUpdateField,
  onSaveIteration,
  onMarkComplete,
  onReopenChallenge,
  onGoToPortfolio,
}: CriticalEvaluationPanelProps) {
  return (
    <div className="pt-5 border-t border-[#E2E8F0] dark:border-[#334155] space-y-6">
      {/* Paso 3: Evalúo el resultado */}
      <div className="space-y-4">
        <div>
          <h2 className="text-lg font-bold text-[#1E3A5F] dark:text-[#F1F5F9]">
            <span className="font-mono text-sm text-[#8B1E24] dark:text-[#F87171] mr-1.5">
              3.
            </span>
            Evalúo el resultado
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Responde estas tres preguntas sencillas sobre la respuesta que
            recibiste.
          </p>
        </div>

        {/* Pregunta 1 */}
        <div className="space-y-2">
          <p className="text-sm font-semibold text-[#0F172A] dark:text-[#F1F5F9]">
            1. ¿La IA respondió lo que le pediste?
          </p>
          <div className="flex flex-wrap gap-2">
            {SIMPLE_OPTIONS.map((opt) => {
              const active = evaluation.cumplioRestricciones === opt.value;
              return (
                <button
                  key={opt.value}
                  type="button"
                  aria-pressed={active}
                  onClick={() =>
                    onUpdateField("cumplioRestricciones", opt.value)
                  }
                  className={`px-3.5 py-1.5 text-xs sm:text-sm font-medium rounded-lg border transition-colors ${
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
          <p className="text-sm font-semibold text-[#0F172A] dark:text-[#F1F5F9]">
            2. ¿La respuesta fue clara y fácil de entender?
          </p>
          <div className="flex flex-wrap gap-2">
            {SIMPLE_OPTIONS.map((opt) => {
              const active = evaluation.alucinacionesOSesgos === opt.value;
              return (
                <button
                  key={opt.value}
                  type="button"
                  aria-pressed={active}
                  onClick={() =>
                    onUpdateField("alucinacionesOSesgos", opt.value)
                  }
                  className={`px-3.5 py-1.5 text-xs sm:text-sm font-medium rounded-lg border transition-colors ${
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
          <p className="text-sm font-semibold text-[#0F172A] dark:text-[#F1F5F9]">
            3. ¿La respuesta incluyó lo que necesitabas?
          </p>
          <div className="flex flex-wrap gap-2">
            {SIMPLE_OPTIONS.map((opt) => {
              const active = evaluation.nivelYFormatoAdecuados === opt.value;
              return (
                <button
                  key={opt.value}
                  type="button"
                  aria-pressed={active}
                  onClick={() =>
                    onUpdateField("nivelYFormatoAdecuados", opt.value)
                  }
                  className={`px-3.5 py-1.5 text-xs sm:text-sm font-medium rounded-lg border transition-colors ${
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
      </div>

      {/* Paso 4: Escribo qué cambiaría */}
      <div className="pt-4 border-t border-[#E2E8F0] dark:border-[#334155] space-y-2">
        <h3 className="text-base font-bold text-[#1E3A5F] dark:text-[#F1F5F9]">
          <span className="font-mono text-xs text-[#8B1E24] dark:text-[#F87171] mr-1.5">
            4.
          </span>
          Escribo qué cambiaría
        </h3>
        <label
          htmlFor="prompt-improvement-input"
          className="block text-sm font-medium text-[#0F172A] dark:text-[#F1F5F9]"
        >
          ¿Qué cambiarías en tu instrucción para obtener una mejor respuesta?
        </label>
        <textarea
          id="prompt-improvement-input"
          rows={2}
          value={evaluation.cambiosInstruccion ?? ""}
          onChange={(e) => onUpdateField("cambiosInstruccion", e.target.value)}
          placeholder="Ej. Pedir ejemplos más concretos, especificar el nivel de los estudiantes o indicar cómo quiero la lista..."
          className="w-full px-3.5 py-2.5 text-sm text-[#0F172A] dark:text-[#F1F5F9] bg-[#F5F7FA] dark:bg-[#0F172A] border border-[#CBD5E1] dark:border-[#334155] rounded-lg placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:bg-white dark:focus:bg-[#0F172A] focus:border-[#1E3A5F] dark:focus:border-[#60A5FA] focus:outline-none transition-colors resize-y"
        />
      </div>

      {/* Paso 5: Registro lo que aprendí (Bitácora) */}
      <div className="pt-4 border-t border-[#E2E8F0] dark:border-[#334155] space-y-2">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h3 className="text-base font-bold text-[#1E3A5F] dark:text-[#F1F5F9]">
            <span className="font-mono text-xs text-[#8B1E24] dark:text-[#F87171] mr-1.5">
              5.
            </span>
            Registro lo que aprendí
          </h3>
          <span className="inline-flex items-center gap-1 text-[11px] font-medium text-slate-500 dark:text-slate-400">
            <BookOpenCheck className="w-3.5 h-3.5 text-[#1E3A5F] dark:text-[#60A5FA]" aria-hidden="true" />
            <span>Se guarda en tu bitácora</span>
          </span>
        </div>

        <label
          htmlFor="learning-reflection-input"
          className="block text-sm font-medium text-[#0F172A] dark:text-[#F1F5F9]"
        >
          ¿Qué aprendiste de esta prueba?
        </label>
        <textarea
          id="learning-reflection-input"
          rows={2}
          value={evaluation.notasReflexion}
          onChange={(e) => onUpdateField("notasReflexion", e.target.value)}
          placeholder="Ej. Aprendí que cuando doy más contexto y digo qué formato quiero, la IA responde con mayor claridad..."
          className="w-full px-3.5 py-2.5 text-sm text-[#0F172A] dark:text-[#F1F5F9] bg-[#F5F7FA] dark:bg-[#0F172A] border border-[#CBD5E1] dark:border-[#334155] rounded-lg placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:bg-white dark:focus:bg-[#0F172A] focus:border-[#1E3A5F] dark:focus:border-[#60A5FA] focus:outline-none transition-colors resize-y"
        />
        <p className="text-xs text-slate-500 dark:text-slate-400">
          Al guardar, ASCENDIA registra automáticamente la fecha, tu
          instrucción, la respuesta de la IA, el sistema utilizado y tu
          evaluación en la Bitácora.
        </p>
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

      {/* Botones para guardar en bitácora y completar el reto */}
      <div className="flex flex-col sm:flex-row gap-3 pt-1">
        <button
          type="button"
          onClick={onSaveIteration}
          className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-white dark:bg-[#0F172A] hover:bg-[#F5F7FA] dark:hover:bg-[#334155]/60 border border-[#1E3A5F] dark:border-[#60A5FA] text-[#1E3A5F] dark:text-[#60A5FA] text-xs sm:text-sm font-semibold rounded-lg transition-colors whitespace-nowrap"
        >
          <Save className="w-4 h-4 shrink-0" aria-hidden="true" />
          <span className="tabular-nums">
            Guardar en bitácora y mejorar (v{currentVersionNumber + 1})
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
            <span>Guardar y completar reto</span>
          </button>
        )}
      </div>
    </div>
  );
}
