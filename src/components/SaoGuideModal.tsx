import { useEffect, useState } from "react";
import { ArrowLeft, ArrowRight, CheckCircle2 } from "lucide-react";
import { SaoAvatar } from "./SaoAvatar";

interface SaoGuideModalProps {
  open: boolean;
  studentName: string;
  onStudentNameChange: (name: string) => void;
  onSkip: () => void;
  onComplete: () => void;
}

export function SaoGuideModal({
  open,
  studentName,
  onStudentNameChange,
  onSkip,
  onComplete,
}: SaoGuideModalProps) {
  const [step, setStep] = useState<1 | 2 | 3>(1);

  useEffect(() => {
    if (open) {
      setStep(1);
    }
  }, [open]);

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

  const displayName = studentName.trim() || "estudiante";

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="sao-guide-title"
      className="fixed inset-0 z-50 bg-[#0F172A]/60 dark:bg-black/75 flex items-center justify-center p-4"
    >
      <div className="bg-white dark:bg-[#1E293B] border border-[#CBD5E1] dark:border-[#334155] rounded-2xl max-w-2xl w-full overflow-hidden shadow-xl">
        {/* Cabecera de paso y botón Saltar guía */}
        <div className="flex items-center justify-between gap-4 px-6 py-3.5 bg-[#F5F7FA] dark:bg-[#0F172A] border-b border-[#E2E8F0] dark:border-[#334155]">
          <div className="flex items-center gap-3 text-xs font-semibold text-[#1E3A5F] dark:text-[#F1F5F9]">
            <span className="font-mono tabular-nums text-[#8B1E24] dark:text-[#F87171]">
              Paso {step} de 3
            </span>
            <span aria-hidden="true" className="text-slate-300 dark:text-slate-600">
              ·
            </span>
            <span>Guía inicial con SAO</span>
          </div>

          <button
            type="button"
            onClick={onSkip}
            className="text-xs font-semibold text-slate-600 dark:text-[#CBD5E1] hover:text-[#8B1E24] dark:hover:text-[#F87171] transition-colors whitespace-nowrap shrink-0 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#1E3A5F] dark:focus-visible:outline-[#60A5FA] rounded"
          >
            Saltar guía
          </button>
        </div>

        {/* Contenido principal con Avatar SAO flotante */}
        <div className="p-6 sm:p-8 space-y-6">
          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
            <div className="shrink-0 flex flex-col items-center">
              <div className="bg-[#F5F7FA] dark:bg-[#0F172A] border border-[#E2E8F0] dark:border-[#334155] rounded-xl p-3">
                <SaoAvatar floating className="w-32 sm:w-36" />
              </div>
              <span className="mt-2 font-mono text-[11px] font-semibold text-[#1E3A5F] dark:text-[#60A5FA]">
                SAO · Guía de ASCENDIA
              </span>
            </div>

            <div className="flex-1 space-y-3 text-center sm:text-left">
              {step === 1 && (
                <>
                  <h2
                    id="sao-guide-title"
                    className="text-xl sm:text-2xl font-bold text-[#1E3A5F] dark:text-[#F1F5F9]"
                  >
                    ¡Hola! Soy SAO, tu guía en ASCENDIA
                  </h2>
                  <p className="text-sm text-[#1E293B] dark:text-[#CBD5E1] leading-relaxed">
                    ¡Bienvenido a ASCENDIA! Soy SAO y voy a acompañarte en este
                    espacio diseñado para que aprendas a comunicarte con
                    criterio y precisión con sistemas de inteligencia artificial.
                    Aquí no buscamos que la IA haga el trabajo por ti, sino que
                    tú tomes el control: aprenderás a diseñar instrucciones
                    claras, probarlas, detectar qué se puede mejorar y verificar
                    críticamente cada resultado. Antes de empezar, dime cómo te
                    llamas para guardar automáticamente tus avances, tus
                    versiones y tu bitácora en este navegador.
                  </p>
                </>
              )}

              {step === 2 && (
                <>
                  <h2
                    id="sao-guide-title"
                    className="text-xl sm:text-2xl font-bold text-[#1E3A5F] dark:text-[#F1F5F9]"
                  >
                    Aprender a pedir mejor es aprender a pensar mejor
                  </h2>
                  <p className="text-sm text-[#1E293B] dark:text-[#CBD5E1] leading-relaxed">
                    ¡Mucho gusto,{" "}
                    <strong className="font-semibold text-[#8B1E24] dark:text-[#F87171]">
                      {displayName}
                    </strong>
                    ! Cuando escribimos pedidos vagos a una IA, obtenemos
                    respuestas genéricas o poco confiables. En ASCENDIA
                    trabajarás con retos educativos reales (desde niveles básicos
                    hasta avanzados) usando un Constructor por Bloques: Rol y
                    Contexto (le dices a la IA desde qué enfoque y nivel
                    universitario debe responder), Tarea y Restricciones (defines
                    qué hacer exactamente y qué límites debe respetar) y Formato
                    de salida (eliges si necesitas una tabla, un esquema,
                    preguntas guía o un análisis crítico). Si la primera
                    respuesta no te convence, ¡perfecto! De eso se trata:
                    ajustas tu instrucción y creas una Versión 2.
                  </p>
                </>
              )}

              {step === 3 && (
                <>
                  <h2
                    id="sao-guide-title"
                    className="text-xl sm:text-2xl font-bold text-[#1E3A5F] dark:text-[#F1F5F9]"
                  >
                    Tu criterio siempre tiene la última palabra
                  </h2>
                  <p className="text-sm text-[#1E293B] dark:text-[#CBD5E1] leading-relaxed">
                    Recuerda una regla de oro en la universidad: la inteligencia
                    artificial puede equivocarse o inventar datos con mucha
                    seguridad. Por eso, antes de dar por terminado un reto en
                    ASCENDIA, pasarás por un breve chequeo de verificación
                    crítica y anotarás qué mejoraste entre una versión y otra.
                    Todo ese recorrido quedará guardado en tu Portafolio de
                    Iteraciones, listo para revisarlo o exportarlo como
                    evidencia de tu aprendizaje. ¡Ya está todo listo,{" "}
                    <strong className="font-semibold text-[#8B1E24] dark:text-[#F87171]">
                      {displayName}
                    </strong>
                    ! Vamos al Banco de Retos para comenzar tu primera práctica.
                  </p>
                </>
              )}
            </div>
          </div>

          {/* Campo de registro de nombre en Ventana 1 */}
          {step === 1 && (
            <div className="bg-[#F5F7FA] dark:bg-[#0F172A] border border-[#CBD5E1] dark:border-[#334155] rounded-xl p-4 sm:p-5 space-y-2">
              <label
                htmlFor="sao-student-name-input"
                className="block text-sm font-semibold text-[#1E3A5F] dark:text-[#60A5FA]"
              >
                Tu nombre completo o código de estudiante:
              </label>
              <input
                id="sao-student-name-input"
                type="text"
                value={studentName}
                onChange={(e) => onStudentNameChange(e.target.value)}
                placeholder="Ej. María Fernanda López"
                maxLength={60}
                autoFocus
                className="w-full px-3.5 py-2.5 text-sm text-[#0F172A] dark:text-[#F1F5F9] bg-white dark:bg-[#1E293B] border border-[#CBD5E1] dark:border-[#334155] rounded-lg placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:border-[#1E3A5F] dark:focus:border-[#60A5FA] focus:outline-none"
              />
              <div className="flex items-center gap-1.5 text-xs text-slate-600 dark:text-[#CBD5E1] pt-0.5">
                <CheckCircle2
                  className="w-3.5 h-3.5 text-emerald-700 dark:text-emerald-400 shrink-0"
                  aria-hidden="true"
                />
                <span>
                  Tu progreso se guarda de forma automática en este dispositivo
                  para que puedas retomarlo cuando quieras.
                </span>
              </div>
            </div>
          )}

          {/* Barra de navegación del recorrido */}
          <div className="pt-4 border-t border-[#E2E8F0] dark:border-[#334155] flex flex-wrap items-center justify-between gap-3">
            {/* Indicador de progreso de 3 pasos */}
            <div className="flex items-center gap-1.5" aria-hidden="true">
              {[1, 2, 3].map((dot) => (
                <span
                  key={dot}
                  className={`h-2 rounded-full transition-all ${
                    dot === step
                      ? "w-6 bg-[#8B1E24] dark:bg-[#C93B44]"
                      : dot < step
                      ? "w-2 bg-[#1E3A5F] dark:bg-[#60A5FA]"
                      : "w-2 bg-slate-300 dark:bg-slate-600"
                  }`}
                />
              ))}
            </div>

            <div className="flex items-center gap-2.5 ml-auto">
              {step > 1 && (
                <button
                  type="button"
                  onClick={() => setStep((s) => (s === 3 ? 2 : 1))}
                  className="inline-flex items-center gap-1.5 px-4 py-2 text-xs sm:text-sm font-semibold text-[#1E3A5F] dark:text-[#F1F5F9] bg-white dark:bg-[#0F172A] hover:bg-[#F5F7FA] dark:hover:bg-[#334155]/60 border border-[#CBD5E1] dark:border-[#334155] rounded-lg transition-colors whitespace-nowrap shrink-0"
                >
                  <ArrowLeft className="w-4 h-4" aria-hidden="true" />
                  <span>Anterior</span>
                </button>
              )}

              {step < 3 ? (
                <button
                  type="button"
                  onClick={() => setStep((s) => (s === 1 ? 2 : 3))}
                  className="inline-flex items-center gap-1.5 px-5 py-2 text-xs sm:text-sm font-semibold text-white bg-[#1E3A5F] dark:bg-[#2B4F7E] hover:bg-[#152B47] dark:hover:bg-[#356199] rounded-lg transition-colors whitespace-nowrap shrink-0 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#8B1E24]"
                >
                  <span>Siguiente</span>
                  <ArrowRight className="w-4 h-4" aria-hidden="true" />
                </button>
              ) : (
                <button
                  type="button"
                  onClick={onComplete}
                  className="inline-flex items-center gap-2 px-5 py-2.5 text-xs sm:text-sm font-semibold text-white bg-[#8B1E24] dark:bg-[#C93B44] hover:bg-[#70161B] dark:hover:bg-[#B02E36] rounded-lg transition-colors whitespace-nowrap shrink-0 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#1E3A5F]"
                >
                  <span>¡Comenzar en ASCENDIA!</span>
                  <ArrowRight className="w-4 h-4" aria-hidden="true" />
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
