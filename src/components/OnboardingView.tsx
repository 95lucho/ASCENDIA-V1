import { useState } from "react";
import {
  AlertTriangle,
  ArrowRight,
  CheckCircle2,
  Compass,
  RotateCcw,
} from "lucide-react";
import {
  DIAGNOSTIC_CHALLENGE,
  ITERATIVE_CYCLE_STEPS,
} from "../data/challenges";
import { DiagnosticState } from "../types/lab";
import { SaoAvatar } from "./SaoAvatar";

interface OnboardingViewProps {
  diagnostic: DiagnosticState;
  studentName: string;
  onUpdateDiagnostic: (
    selectedIds: string[],
    validated: boolean,
    isPerfect: boolean
  ) => void;
  onGoToChallenges: () => void;
  onOpenGuide: () => void;
}

export function OnboardingView({
  diagnostic,
  studentName,
  onUpdateDiagnostic,
  onGoToChallenges,
  onOpenGuide,
}: OnboardingViewProps) {
  const [activeStep, setActiveStep] = useState<number>(1);

  const selectedSet = new Set(diagnostic.selectedIds);
  const currentStepData =
    ITERATIVE_CYCLE_STEPS.find((s) => s.number === activeStep) ??
    ITERATIVE_CYCLE_STEPS[0];

  const toggleOption = (id: string) => {
    const next = new Set(selectedSet);
    if (next.has(id)) {
      next.delete(id);
    } else {
      next.add(id);
    }
    onUpdateDiagnostic(Array.from(next), false, false);
  };

  const handleValidate = () => {
    const allIds = DIAGNOSTIC_CHALLENGE.options.map((o) => o.id);
    const isPerfect = allIds.every((id) => selectedSet.has(id));
    onUpdateDiagnostic(Array.from(selectedSet), true, isPerfect);
  };

  const handleResetDiagnostic = () => {
    onUpdateDiagnostic([], false, false);
  };

  const missingOptions = DIAGNOSTIC_CHALLENGE.options.filter(
    (o) => !selectedSet.has(o.id)
  );

  const greetingName = studentName.trim();

  return (
    <div className="space-y-10">
      {/* Encabezado introductorio con Emblema SAÓ */}
      <section className="bg-white dark:bg-[#1E293B] border border-[#CBD5E1] dark:border-[#334155] border-t-4 border-t-[#1E3A5F] dark:border-t-[#60A5FA] rounded-xl p-6 sm:p-8 lg:p-10 transition-colors">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
          <div className="flex flex-col sm:flex-row sm:items-center gap-6 max-w-3xl">
            <button
              type="button"
              onClick={onOpenGuide}
              title="Abrir Guía de SAÓ"
              className="shrink-0 self-start sm:self-center bg-[#F5F7FA] dark:bg-[#0F172A] hover:bg-slate-100 dark:hover:bg-[#334155]/60 border border-[#E2E8F0] dark:border-[#334155] rounded-xl p-3 transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#1E3A5F] dark:focus-visible:outline-[#60A5FA]"
            >
              <SaoAvatar floating className="w-28 sm:w-32" />
            </button>
            <div className="space-y-3">
              <p className="text-xs font-semibold text-[#8B1E24] dark:text-[#F87171]">
                ASCENDIA · UAGRM · Indagación y metacognición en Ciencias de la Educación
              </p>
              <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-[#1E3A5F] dark:text-[#F1F5F9]">
                {greetingName
                  ? `Bienvenido a ASCENDIA, ${greetingName}: formula, audita y refina prompts con rigor universitario`
                  : "Bienvenido a ASCENDIA: formula, audita y refina prompts con rigor universitario"}
              </h1>
              <p className="text-sm sm:text-base text-[#1E293B] dark:text-[#CBD5E1] leading-relaxed">
                Una buena interacción con inteligencia artificial no depende de
                pedir respuestas rápidas, sino de diseñar instrucciones
                estructuradas, verificar afirmaciones frente a fuentes reales y
                documentar cada iteración.
              </p>
            </div>
          </div>
          <div className="flex flex-wrap lg:flex-col items-stretch sm:items-center lg:items-end gap-3 shrink-0">
            <button
              type="button"
              onClick={onGoToChallenges}
              className="inline-flex items-center justify-center gap-2 px-5 py-3 bg-[#1E3A5F] dark:bg-[#2B4F7E] hover:bg-[#152B47] dark:hover:bg-[#356199] text-white text-sm font-semibold rounded-lg transition-colors whitespace-nowrap shrink-0 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#8B1E24]"
            >
              <span>Ir al Banco de Retos</span>
              <ArrowRight className="w-4 h-4" aria-hidden="true" />
            </button>
            <button
              type="button"
              onClick={onOpenGuide}
              className="inline-flex items-center justify-center gap-2 px-4 py-2 bg-white dark:bg-[#0F172A] hover:bg-[#F5F7FA] dark:hover:bg-[#334155]/60 border border-[#CBD5E1] dark:border-[#334155] text-[#1E3A5F] dark:text-[#F1F5F9] text-xs sm:text-sm font-semibold rounded-lg transition-colors whitespace-nowrap shrink-0"
            >
              <Compass
                className="w-4 h-4 text-[#8B1E24] dark:text-[#F87171]"
                aria-hidden="true"
              />
              <span>Guía de SAÓ</span>
            </button>
          </div>
        </div>

        {/* Ciclo iterativo conectado de 5 pasos */}
        <div className="mt-8 pt-8 border-t border-[#E2E8F0] dark:border-[#334155]">
          <div className="flex flex-wrap items-center justify-between gap-2 mb-4">
            <h2 className="text-sm font-semibold text-[#1E3A5F] dark:text-[#60A5FA]">
              Ciclo iterativo del laboratorio (haz clic en cada fase para explorar)
            </h2>
            <span className="text-xs text-slate-500 dark:text-slate-400 tabular-nums">
              Fase {currentStepData.number} de 5
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
            {ITERATIVE_CYCLE_STEPS.map((step, index) => {
              const isSelected = step.number === activeStep;
              return (
                <div key={step.number} className="flex items-stretch gap-2">
                  <button
                    type="button"
                    onClick={() => setActiveStep(step.number)}
                    className={`flex-1 text-left p-4 rounded-lg border transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#1E3A5F] dark:focus-visible:outline-[#60A5FA] ${
                      isSelected
                        ? "bg-[#1E3A5F] dark:bg-[#2B4F7E] border-[#1E3A5F] dark:border-[#60A5FA] text-white"
                        : "bg-[#F5F7FA] dark:bg-[#0F172A] border-[#E2E8F0] dark:border-[#334155] text-[#0F172A] dark:text-[#F1F5F9] hover:border-[#8B1E24] dark:hover:border-[#60A5FA] hover:bg-white dark:hover:bg-[#1E293B]"
                    }`}
                  >
                    <div className="flex items-baseline justify-between gap-2">
                      <span
                        className={`font-mono text-xs font-semibold tabular-nums ${
                          isSelected
                            ? "text-[#FCA5A5]"
                            : "text-[#8B1E24] dark:text-[#F87171]"
                        }`}
                      >
                        0{step.number}
                      </span>
                    </div>
                    <p className="mt-1.5 font-display text-sm font-semibold">
                      {step.title}
                    </p>
                    <p
                      className={`mt-1 text-xs leading-snug ${
                        isSelected
                          ? "text-slate-200"
                          : "text-slate-600 dark:text-[#CBD5E1]"
                      }`}
                    >
                      {step.shortDesc}
                    </p>
                  </button>
                  {index < ITERATIVE_CYCLE_STEPS.length - 1 && (
                    <div
                      aria-hidden="true"
                      className="hidden lg:flex items-center text-slate-300 dark:text-slate-600 shrink-0"
                    >
                      <ArrowRight className="w-4 h-4" />
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          <div className="mt-4 px-4 py-3 bg-[#F5F7FA] dark:bg-[#0F172A] border border-[#E2E8F0] dark:border-[#334155] rounded-lg">
            <p className="text-sm text-[#0F172A] dark:text-[#F1F5F9]">
              <span className="font-semibold text-[#1E3A5F] dark:text-[#60A5FA]">
                {currentStepData.number}. {currentStepData.title}:
              </span>{" "}
              {currentStepData.detail}
            </p>
          </div>
        </div>
      </section>

      {/* Mini-Reto Diagnóstico (2 min) */}
      <section className="bg-white dark:bg-[#1E293B] border border-[#CBD5E1] dark:border-[#334155] rounded-xl p-6 sm:p-8 transition-colors">
        <div className="flex flex-wrap items-baseline justify-between gap-2 pb-5 border-b border-[#E2E8F0] dark:border-[#334155]">
          <div>
            <h2 className="text-xl font-bold text-[#1E3A5F] dark:text-[#F1F5F9]">
              Mini-Reto Diagnóstico (2 min)
            </h2>
            <p className="mt-1 text-sm text-slate-600 dark:text-[#CBD5E1]">
              Observa el siguiente prompt deficiente y la respuesta genérica que
              generó. Identifica qué elementos estructurales faltan.
            </p>
          </div>
          {diagnostic.validated && (
            <span
              className={`inline-flex items-center gap-1.5 text-xs font-semibold ${
                diagnostic.isPerfect
                  ? "text-emerald-700 dark:text-emerald-400"
                  : "text-amber-700 dark:text-amber-400"
              }`}
            >
              {diagnostic.isPerfect ? (
                <>
                  <CheckCircle2 className="w-4 h-4" aria-hidden="true" />
                  <span>Diagnóstico completado</span>
                </>
              ) : (
                <>
                  <AlertTriangle className="w-4 h-4" aria-hidden="true" />
                  <span>Revisión parcial</span>
                </>
              )}
            </span>
          )}
        </div>

        {/* Prompt deficiente vs Respuesta genérica */}
        <div className="mt-6 grid grid-cols-1 lg:grid-cols-2 gap-6 items-stretch">
          <div className="bg-[#F5F7FA] dark:bg-[#0F172A] border border-[#E2E8F0] dark:border-[#334155] rounded-lg p-5 flex flex-col justify-between">
            <div>
              <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                Prompt original enviado a la IA
              </p>
              <p className="mt-3 font-mono text-sm text-[#1E3A5F] dark:text-[#93C5FD] bg-white dark:bg-[#1E293B] border border-[#E2E8F0] dark:border-[#334155] rounded-md p-4">
                “{DIAGNOSTIC_CHALLENGE.badPrompt}”
              </p>
            </div>
            <p className="mt-3 text-xs text-slate-500 dark:text-slate-400">
              Instrucción vaga de 7 palabras sin audiencia, finalidad ni
              criterios de rigor.
            </p>
          </div>

          <div className="bg-[#F5F7FA] dark:bg-[#0F172A] border border-[#E2E8F0] dark:border-[#334155] rounded-lg p-5">
            <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">
              Respuesta genérica obtenida
            </p>
            <p className="mt-3 text-sm text-[#1E293B] dark:text-[#CBD5E1] leading-relaxed bg-white dark:bg-[#1E293B] border border-[#E2E8F0] dark:border-[#334155] rounded-md p-4">
              {DIAGNOSTIC_CHALLENGE.genericResponse}
            </p>
          </div>
        </div>

        {/* Checkboxes de diagnóstico */}
        <div className="mt-6 pt-6 border-t border-[#E2E8F0] dark:border-[#334155]">
          <p className="text-sm font-semibold text-[#1E3A5F] dark:text-[#60A5FA]">
            ¿Qué elementos estructurales faltan en este prompt? (Marca todos los
            que correspondan)
          </p>

          <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-3">
            {DIAGNOSTIC_CHALLENGE.options.map((opt) => {
              const checked = selectedSet.has(opt.id);
              return (
                <label
                  key={opt.id}
                  className={`flex items-start gap-3 p-4 rounded-lg border cursor-pointer transition-colors ${
                    checked
                      ? "bg-[#1E3A5F]/6 dark:bg-[#60A5FA]/15 border-[#1E3A5F] dark:border-[#60A5FA] text-[#1E3A5F] dark:text-[#F1F5F9]"
                      : "bg-white dark:bg-[#0F172A] border-[#E2E8F0] dark:border-[#334155] text-[#0F172A] dark:text-[#CBD5E1] hover:border-[#CBD5E1] dark:hover:border-slate-500"
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={checked}
                    onChange={() => toggleOption(opt.id)}
                    className="mt-0.5 h-4 w-4 rounded border-slate-300 dark:border-slate-600 text-[#8B1E24] focus:ring-[#1E3A5F]"
                  />
                  <span className="text-sm font-medium">{opt.label}</span>
                </label>
              );
            })}
          </div>

          <div className="mt-5 flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={handleValidate}
              className="px-5 py-2.5 bg-[#8B1E24] dark:bg-[#C93B44] hover:bg-[#70161B] dark:hover:bg-[#B02E36] text-white text-sm font-semibold rounded-lg transition-colors whitespace-nowrap shrink-0 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#1E3A5F]"
            >
              Validar diagnóstico
            </button>
            {diagnostic.validated && (
              <button
                type="button"
                onClick={handleResetDiagnostic}
                className="inline-flex items-center gap-1.5 px-4 py-2.5 border border-[#CBD5E1] dark:border-[#334155] bg-white dark:bg-[#0F172A] hover:bg-[#F5F7FA] dark:hover:bg-[#334155]/60 text-[#1E293B] dark:text-[#F1F5F9] text-sm font-medium rounded-lg transition-colors whitespace-nowrap shrink-0"
              >
                <RotateCcw className="w-4 h-4" aria-hidden="true" />
                <span>Reiniciar</span>
              </button>
            )}
          </div>

          {/* Retroalimentación inmediata */}
          {diagnostic.validated && (
            <div
              className={`mt-5 rounded-lg border p-5 ${
                diagnostic.isPerfect
                  ? "bg-emerald-50 dark:bg-emerald-950/50 border-emerald-200 dark:border-emerald-800 text-emerald-950 dark:text-emerald-100"
                  : "bg-amber-50 dark:bg-amber-950/50 border-amber-200 dark:border-amber-800 text-amber-950 dark:text-amber-100"
              }`}
            >
              <div className="flex items-start gap-3">
                {diagnostic.isPerfect ? (
                  <CheckCircle2
                    className="w-5 h-5 text-emerald-700 dark:text-emerald-400 shrink-0 mt-0.5"
                    aria-hidden="true"
                  />
                ) : (
                  <AlertTriangle
                    className="w-5 h-5 text-amber-700 dark:text-amber-400 shrink-0 mt-0.5"
                    aria-hidden="true"
                  />
                )}
                <div className="space-y-3 flex-1">
                  {diagnostic.isPerfect ? (
                    <>
                      <p className="text-sm font-semibold">
                        Excelente análisis: identificaste los 4 elementos
                        faltantes.
                      </p>
                      <p className="text-sm leading-relaxed">
                        Sin contexto académico, propósito, restricciones ni
                        formato, cualquier modelo responde con una síntesis
                        escolar genérica. Observa cómo cambia la instrucción al
                        estructurar esos 4 bloques:
                      </p>
                      <div className="bg-white dark:bg-[#0F172A] border border-emerald-200 dark:border-emerald-800 rounded-md p-4 font-mono text-xs text-[#1E293B] dark:text-[#E2E8F0] leading-relaxed">
                        {DIAGNOSTIC_CHALLENGE.improvedExample}
                      </div>
                      <div className="pt-1">
                        <button
                          type="button"
                          onClick={onGoToChallenges}
                          className="inline-flex items-center gap-2 px-4 py-2 bg-[#1E3A5F] dark:bg-[#2B4F7E] hover:bg-[#152B47] dark:hover:bg-[#356199] text-white text-xs sm:text-sm font-semibold rounded-lg transition-colors"
                        >
                          <span>Comenzar en el Banco de Retos</span>
                          <ArrowRight className="w-4 h-4" aria-hidden="true" />
                        </button>
                      </div>
                    </>
                  ) : (
                    <>
                      <p className="text-sm font-semibold">
                        Identificaste {diagnostic.selectedIds.length} de 4
                        elementos faltantes. Revisa los que quedaron sin marcar:
                      </p>
                      <ul className="space-y-1.5 text-sm">
                        {missingOptions.map((item) => (
                          <li key={item.id}>
                            <span className="font-semibold">{item.label}:</span>{" "}
                            {item.explanation}
                          </li>
                        ))}
                      </ul>
                      <p className="text-xs text-amber-900 dark:text-amber-300">
                        Marca los elementos restantes y vuelve a pulsar “Validar
                        diagnóstico”.
                      </p>
                    </>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
