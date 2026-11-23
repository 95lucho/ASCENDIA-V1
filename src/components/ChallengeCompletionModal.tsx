import { useEffect } from "react";
import {
  ArrowRight,
  Award,
  CheckCircle2,
  Compass,
  RotateCcw,
  X,
} from "lucide-react";
import { CHALLENGES } from "../data/challenges";
import { ChallengeActivityResult, ChallengeProgress } from "../types/lab";
import {
  getNextChallengeAfterCompletion,
  isFormativeSequenceCompleted,
} from "../utils/progression";
import { SaoAvatar } from "./SaoAvatar";

interface ChallengeCompletionModalProps {
  completedChallengeId: string | null;
  latestResult: ChallengeActivityResult | null;
  challengesProgress: Record<string, ChallengeProgress>;
  onContinueNext: (nextChallengeId: string) => void;
  onRetry: (challengeId: string) => void;
  onGoToBank: () => void;
  onClose: () => void;
}

export function ChallengeCompletionModal({
  completedChallengeId,
  latestResult,
  challengesProgress,
  onContinueNext,
  onRetry,
  onGoToBank,
  onClose,
}: ChallengeCompletionModalProps) {
  useEffect(() => {
    if (!completedChallengeId) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [completedChallengeId, onClose]);

  if (!completedChallengeId) return null;

  const completedChallenge = CHALLENGES.find(
    (c) => c.id === completedChallengeId
  );
  if (!completedChallenge || completedChallenge.esLibre) return null;

  const storedResult = challengesProgress[completedChallengeId]?.activityResult;
  const effectiveResult = latestResult ?? storedResult ?? null;

  // Regla de seguridad pedagógica: nunca mostrar aprobación si no cumple criterios
  if (effectiveResult && !effectiveResult.approved) return null;

  const resolution = getNextChallengeAfterCompletion(
    completedChallengeId,
    challengesProgress
  );

  const nextChallenge = resolution.nextChallengeId
    ? CHALLENGES.find((c) => c.id === resolution.nextChallengeId) ?? null
    : null;

  const allSixCompleted = isFormativeSequenceCompleted(challengesProgress);

  const recognitionMessage =
    effectiveResult?.saoMessage ||
    "Has aprobado este reto. Cada actividad fortalece tu criterio para formular y evaluar instrucciones dirigidas a la inteligencia artificial.";

  const resultLabel =
    effectiveResult?.resultLabel || "Criterios de aprobación cumplidos";

  const competenceLabel =
    effectiveResult?.competence ||
    completedChallenge.competencia ||
    completedChallenge.objetivo;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="challenge-completion-title"
      className="fixed inset-0 z-50 bg-[#0F172A]/60 dark:bg-black/75 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div
        className="bg-white dark:bg-[#1E293B] border border-[#CBD5E1] dark:border-[#334155] border-t-4 border-t-[#1E3A5F] dark:border-t-[#60A5FA] rounded-2xl max-w-xl w-full overflow-hidden shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Cabecera */}
        <div className="flex items-center justify-between gap-4 px-6 py-3.5 bg-[#F5F7FA] dark:bg-[#0F172A] border-b border-[#E2E8F0] dark:border-[#334155]">
          <div className="flex items-center gap-2 text-xs font-semibold text-[#1E3A5F] dark:text-[#93C5FD]">
            <CheckCircle2
              className="w-4 h-4 text-emerald-700 dark:text-emerald-400 shrink-0"
              aria-hidden="true"
            />
            <span>
              {completedChallenge.orderLabel} · {completedChallenge.level}
            </span>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Cerrar ventana"
            className="p-1.5 text-slate-500 dark:text-[#CBD5E1] hover:text-[#1E3A5F] dark:hover:text-[#F1F5F9] rounded-lg hover:bg-slate-200/60 dark:hover:bg-[#1E293B] transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Cuerpo con SAÓ */}
        <div className="p-6 sm:p-7 space-y-5">
          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-5">
            <div className="shrink-0 flex flex-col items-center">
              <div className="bg-[#F5F7FA] dark:bg-[#0F172A] border border-[#E2E8F0] dark:border-[#334155] rounded-xl p-3">
                <SaoAvatar className="w-28 sm:w-32" />
              </div>
              <span className="mt-2 font-mono text-[11px] font-semibold text-[#1E3A5F] dark:text-[#60A5FA]">
                SAÓ · ASCENDIA
              </span>
            </div>

            <div className="flex-1 text-center sm:text-left space-y-2.5">
              <span className="inline-block text-xs font-bold uppercase tracking-wider text-[#8B1E24] dark:text-[#FCA5A5]">
                ¡Reto aprobado!
              </span>
              <h2
                id="challenge-completion-title"
                className="text-2xl font-bold text-[#1E3A5F] dark:text-[#F1F5F9]"
              >
                ¡Excelente trabajo!
              </h2>
              <p className="text-sm text-[#1E293B] dark:text-[#CBD5E1] leading-relaxed">
                {recognitionMessage}
              </p>
            </div>
          </div>

          {/* Resultado obtenido y Competencia desarrollada */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            <div className="p-3.5 rounded-xl bg-[#F5F7FA] dark:bg-[#0F172A] border border-[#E2E8F0] dark:border-[#334155]">
              <span className="block font-semibold text-slate-500 dark:text-slate-400">
                Resultado obtenido
              </span>
              <strong className="mt-1 block text-sm font-bold text-[#1E3A5F] dark:text-[#60A5FA] tabular-nums">
                {resultLabel}
              </strong>
            </div>

            <div className="p-3.5 rounded-xl bg-[#F5F7FA] dark:bg-[#0F172A] border border-[#E2E8F0] dark:border-[#334155]">
              <span className="block font-semibold text-slate-500 dark:text-slate-400">
                Competencia desarrollada
              </span>
              <strong className="mt-1 block text-xs sm:text-sm font-semibold text-[#0F172A] dark:text-[#F1F5F9] leading-snug">
                {competenceLabel}
              </strong>
            </div>
          </div>

          {/* Aviso de desbloqueo de nuevo nivel */}
          {resolution.unlockedNewLevel && (
            <div className="flex items-start gap-2.5 p-3.5 rounded-xl bg-[#1E3A5F]/5 dark:bg-[#2B4F7E]/25 border border-[#1E3A5F]/20 dark:border-[#60A5FA]/30 text-xs sm:text-sm text-[#1E3A5F] dark:text-[#E2E8F0]">
              <Award
                className="w-4 h-4 text-[#8B1E24] dark:text-[#F87171] shrink-0 mt-0.5"
                aria-hidden="true"
              />
              <span>
                ¡Desbloqueaste el{" "}
                <strong>Nivel {resolution.unlockedNewLevel}</strong>! Ya puedes
                acceder a los siguientes retos de este nivel.
              </span>
            </div>
          )}

          {/* Mensaje especial al completar la secuencia formativa */}
          {(resolution.isFinalStructuredChallenge || allSixCompleted) && (
            <div className="p-4 rounded-xl bg-[#F5F7FA] dark:bg-[#0F172A] border border-[#CBD5E1] dark:border-[#334155] border-l-4 border-l-[#8B1E24] dark:border-l-[#F87171] space-y-1.5">
              <div className="flex items-center gap-2 text-sm font-bold text-[#1E3A5F] dark:text-[#F1F5F9]">
                <Award
                  className="w-4 h-4 text-[#8B1E24] dark:text-[#F87171] shrink-0"
                  aria-hidden="true"
                />
                <span>
                  {allSixCompleted
                    ? "¡Completaste la secuencia formativa de ASCENDIA!"
                    : "¡Completaste el sexto reto de ASCENDIA!"}
                </span>
              </div>
              <p className="text-xs sm:text-sm text-slate-600 dark:text-[#CBD5E1] leading-relaxed">
                {allSixCompleted
                  ? "Recorriste con éxito los niveles Básico, Intermedio y Avanzado. Puedes volver al Banco de Retos para explorar el Reto Libre o repasar cualquier actividad."
                  : "Has finalizado el último reto del nivel Avanzado. Vuelve al Banco de Retos para completar los retos pendientes o usar el Reto Libre."}
              </p>
            </div>
          )}

          {/* Dos acciones principales */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
            {resolution.isFinalStructuredChallenge || !nextChallenge ? (
              <button
                type="button"
                onClick={onGoToBank}
                className="text-left rounded-xl p-4 bg-[#1E3A5F] dark:bg-[#2B4F7E] hover:bg-[#152B47] dark:hover:bg-[#356199] text-white transition-colors flex flex-col justify-between gap-2 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#8B1E24]"
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="text-sm font-bold">
                    Continuar al siguiente reto
                  </span>
                  <Compass className="w-4 h-4 shrink-0" aria-hidden="true" />
                </div>
                <span className="text-xs text-slate-100/90 leading-snug">
                  Ir al Banco de Retos y explorar el Reto Libre
                </span>
              </button>
            ) : (
              <button
                type="button"
                onClick={() => onContinueNext(nextChallenge.id)}
                className="text-left rounded-xl p-4 bg-[#1E3A5F] dark:bg-[#2B4F7E] hover:bg-[#152B47] dark:hover:bg-[#356199] text-white transition-colors flex flex-col justify-between gap-2 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#8B1E24]"
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="text-sm font-bold">
                    Continuar al siguiente reto
                  </span>
                  <ArrowRight className="w-4 h-4 shrink-0" aria-hidden="true" />
                </div>
                <div className="space-y-0.5">
                  <span className="block text-xs text-slate-100/90 leading-snug">
                    Avanza al siguiente reto disponible
                  </span>
                  <span className="block text-[11px] font-semibold text-amber-200">
                    {nextChallenge.orderLabel} · {nextChallenge.level}
                  </span>
                </div>
              </button>
            )}

            <button
              type="button"
              onClick={() => onRetry(completedChallenge.id)}
              className="text-left rounded-xl p-4 bg-white dark:bg-[#0F172A] hover:bg-[#F5F7FA] dark:hover:bg-[#334155]/60 border-2 border-[#CBD5E1] dark:border-[#334155] hover:border-[#8B1E24] dark:hover:border-[#F87171] text-[#1E3A5F] dark:text-[#F1F5F9] transition-colors flex flex-col justify-between gap-2 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#1E3A5F]"
            >
              <div className="flex items-center justify-between gap-2">
                <span className="text-sm font-bold">Reintentar el reto</span>
                <RotateCcw
                  className="w-4 h-4 text-[#8B1E24] dark:text-[#F87171] shrink-0"
                  aria-hidden="true"
                />
              </div>
              <span className="text-xs text-slate-600 dark:text-[#CBD5E1] leading-snug">
                Repite la actividad sin borrar tu progreso guardado
              </span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
