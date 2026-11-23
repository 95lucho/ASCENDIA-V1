import { useEffect, useRef, useState } from "react";
import { ArrowLeft, ArrowRight, Layers, LockOpen } from "lucide-react";
import { SaoAvatar } from "./SaoAvatar";

interface SaoGuideModalProps {
  open: boolean;
  studentName?: string;
  onStudentNameChange?: (name: string) => void;
  onSkip: () => void;
  onComplete: () => void;
}

export function SaoGuideModal({
  open,
  studentName = "",
  onSkip,
  onComplete,
}: SaoGuideModalProps) {
  const [step, setStep] = useState<1 | 2>(1);
  const bodyScrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (open) {
      setStep(1);
    }
  }, [open]);

  useEffect(() => {
    if (bodyScrollRef.current) {
      bodyScrollRef.current.scrollTop = 0;
    }
  }, [step, open]);

  useEffect(() => {
    if (!open) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onSkip();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [open, onSkip]);

  if (!open) return null;

  const trimmedName = studentName.trim();

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="sao-guide-title"
      className="fixed inset-0 z-50 bg-[#0F172A]/60 dark:bg-black/75 flex items-center justify-center pt-[max(0.75rem,env(safe-area-inset-top))] pb-[max(0.75rem,env(safe-area-inset-bottom))] pl-[max(0.75rem,env(safe-area-inset-left))] pr-[max(0.75rem,env(safe-area-inset-right))] sm:pt-[max(1.5rem,env(safe-area-inset-top))] sm:pb-[max(1.5rem,env(safe-area-inset-bottom))] sm:pl-[max(1.5rem,env(safe-area-inset-left))] sm:pr-[max(1.5rem,env(safe-area-inset-right))]"
    >
      {/* Contenedor flex-col limitado al alto disponible: cabecera fija, cuerpo desplazable único y pie siempre visible */}
      <div className="bg-white dark:bg-[#1E293B] border border-[#CBD5E1] dark:border-[#334155] border-t-4 border-t-[#1E3A5F] dark:border-t-[#60A5FA] rounded-2xl max-w-xl w-full max-h-full flex flex-col overflow-hidden shadow-xl">
        {/* Cabecera fija */}
        <div className="shrink-0 flex items-center justify-between gap-4 px-5 sm:px-6 py-3 bg-[#F5F7FA] dark:bg-[#0F172A] border-b border-[#E2E8F0] dark:border-[#334155]">
          <div className="flex items-center gap-2.5 text-xs font-semibold text-[#1E3A5F] dark:text-[#F1F5F9]">
            <span className="font-mono tabular-nums text-[#8B1E24] dark:text-[#F87171]">
              Paso {step} de 2
            </span>
            <span
              aria-hidden="true"
              className="text-slate-300 dark:text-slate-600"
            >
              ·
            </span>
            <span>Guía inicial con SAÓ</span>
          </div>

          <button
            type="button"
            onClick={onSkip}
            className="text-xs font-semibold text-slate-600 dark:text-[#CBD5E1] hover:text-[#8B1E24] dark:hover:text-[#F87171] transition-colors whitespace-nowrap shrink-0 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#1E3A5F] dark:focus-visible:outline-[#60A5FA] rounded"
          >
            Saltar guía
          </button>
        </div>

        {/* Cuerpo desplazable (único scroll vertical en pantallas bajas o móviles) */}
        <div
          ref={bodyScrollRef}
          className="flex-1 min-h-0 overflow-y-auto overscroll-contain px-5 py-5 sm:px-7 sm:py-6"
        >
          {step === 1 ? (
            <div className="flex flex-col sm:flex-row items-center sm:items-start gap-5">
              <div className="shrink-0 flex flex-col items-center">
                <div className="bg-[#F5F7FA] dark:bg-[#0F172A] border border-[#E2E8F0] dark:border-[#334155] rounded-xl p-2.5 sm:p-3">
                  <SaoAvatar floating className="w-24 sm:w-28" />
                </div>
                <span className="mt-2 font-mono text-[11px] font-semibold text-[#1E3A5F] dark:text-[#60A5FA]">
                  SAÓ · Acompañante
                </span>
              </div>

              <div className="flex-1 space-y-3 text-center sm:text-left">
                <h2
                  id="sao-guide-title"
                  className="text-xl sm:text-2xl font-bold text-[#1E3A5F] dark:text-[#F1F5F9]"
                >
                  {trimmedName
                    ? `¡Hola, ${trimmedName}! Soy SAÓ`
                    : "¡Hola! Soy SAÓ, tu guía de aprendizaje"}
                </h2>
                <p className="text-sm sm:text-base text-[#1E293B] dark:text-[#CBD5E1] leading-relaxed">
                  Te doy la bienvenida. Soy <strong>SAÓ</strong> y te acompañaré
                  durante tu recorrido en la plataforma, orientándote en cada
                  actividad y ofreciéndote retroalimentación formativa para
                  fortalecer tu criterio al interactuar con sistemas de
                  inteligencia artificial.
                </p>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center gap-3.5">
                <div className="shrink-0 bg-[#F5F7FA] dark:bg-[#0F172A] border border-[#E2E8F0] dark:border-[#334155] rounded-xl p-2">
                  <SaoAvatar className="w-14 sm:w-16" />
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-bold uppercase tracking-wider text-[#8B1E24] dark:text-[#F87171]">
                    Presentación de la plataforma
                  </p>
                  <h2
                    id="sao-guide-title"
                    className="text-xl sm:text-2xl font-bold text-[#1E3A5F] dark:text-[#F1F5F9]"
                  >
                    ¿Qué aprenderás en ASCENDIA?
                  </h2>
                </div>
              </div>

              <p className="text-sm sm:text-base text-[#1E293B] dark:text-[#CBD5E1] leading-relaxed">
                <strong>ASCENDIA</strong> es una plataforma educativa diseñada
                para que desarrolles la competencia de{" "}
                <strong>
                  formular, analizar y evaluar instrucciones dirigidas a
                  sistemas de inteligencia artificial
                </strong>
                .
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="bg-[#F5F7FA] dark:bg-[#0F172A] border border-[#E2E8F0] dark:border-[#334155] rounded-xl p-3.5 space-y-1">
                  <div className="flex items-center gap-2 text-xs font-bold text-[#1E3A5F] dark:text-[#60A5FA]">
                    <Layers className="w-4 h-4 shrink-0" aria-hidden="true" />
                    <span>Tres niveles formativos</span>
                  </div>
                  <p className="text-xs sm:text-sm text-[#1E293B] dark:text-[#CBD5E1] leading-snug">
                    El aprendizaje se organiza en nivel <strong>Básico</strong>,{" "}
                    <strong>Intermedio</strong> y <strong>Avanzado</strong>.
                  </p>
                </div>

                <div className="bg-[#F5F7FA] dark:bg-[#0F172A] border border-[#E2E8F0] dark:border-[#334155] rounded-xl p-3.5 space-y-1">
                  <div className="flex items-center gap-2 text-xs font-bold text-[#8B1E24] dark:text-[#F87171]">
                    <LockOpen className="w-4 h-4 shrink-0" aria-hidden="true" />
                    <span>Desbloqueo progresivo</span>
                  </div>
                  <p className="text-xs sm:text-sm text-[#1E293B] dark:text-[#CBD5E1] leading-snug">
                    Los retos se desbloquean de forma progresiva conforme
                    completas las actividades de cada nivel.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Pie fijo siempre accesible */}
        <div className="shrink-0 px-5 sm:px-6 py-3.5 bg-white dark:bg-[#1E293B] border-t border-[#E2E8F0] dark:border-[#334155] flex flex-wrap items-center justify-between gap-3">
          {/* Indicador de progreso de 2 pasos */}
          <div className="flex items-center gap-1.5" aria-hidden="true">
            {[1, 2].map((dot) => (
              <span
                key={dot}
                className={`h-2 rounded-full transition-all ${
                  dot === step
                    ? "w-6 bg-[#8B1E24] dark:bg-[#C93B44]"
                    : "w-2 bg-[#1E3A5F] dark:bg-[#60A5FA]"
                }`}
              />
            ))}
          </div>

          <div className="flex items-center gap-2.5 ml-auto">
            {step === 2 && (
              <button
                type="button"
                onClick={() => setStep(1)}
                className="inline-flex items-center gap-1.5 px-4 py-2 text-xs sm:text-sm font-semibold text-[#1E3A5F] dark:text-[#F1F5F9] bg-white dark:bg-[#0F172A] hover:bg-[#F5F7FA] dark:hover:bg-[#334155]/60 border border-[#CBD5E1] dark:border-[#334155] rounded-lg transition-colors whitespace-nowrap shrink-0 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#1E3A5F] dark:focus-visible:outline-[#60A5FA]"
              >
                <ArrowLeft className="w-4 h-4" aria-hidden="true" />
                <span>Anterior</span>
              </button>
            )}

            {step === 1 ? (
              <button
                type="button"
                onClick={() => setStep(2)}
                className="inline-flex items-center gap-1.5 px-5 py-2.5 text-xs sm:text-sm font-semibold text-white bg-[#1E3A5F] dark:bg-[#2B4F7E] hover:bg-[#152B47] dark:hover:bg-[#356199] rounded-lg transition-colors whitespace-nowrap shrink-0 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#8B1E24]"
              >
                <span>Comenzar</span>
                <ArrowRight className="w-4 h-4" aria-hidden="true" />
              </button>
            ) : (
              <button
                type="button"
                onClick={onComplete}
                className="inline-flex items-center gap-2 px-5 py-2.5 text-xs sm:text-sm font-semibold text-white bg-[#8B1E24] dark:bg-[#C93B44] hover:bg-[#70161B] dark:hover:bg-[#B02E36] rounded-lg transition-colors whitespace-nowrap shrink-0 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#1E3A5F]"
              >
                <span>Empezar a aprender</span>
                <ArrowRight className="w-4 h-4" aria-hidden="true" />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
