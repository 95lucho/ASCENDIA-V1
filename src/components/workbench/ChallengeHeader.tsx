import { useState } from "react";
import {
  ArrowLeft,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Columns2,
} from "lucide-react";
import { CHALLENGES } from "../../data/challenges";
import {
  ChallengeDefinition,
  ChallengeProgress,
  ChallengeStatus,
  CustomChallengeMeta,
} from "../../types/lab";
import { isChallengeUnlocked } from "../../utils/progression";

interface ChallengeHeaderProps {
  challenge: ChallengeDefinition;
  progress: ChallengeProgress;
  allChallengesProgress: Record<string, ChallengeProgress>;
  status: ChallengeStatus;
  displayTitle: string;
  displayObjetivo: string;
  verifiedCriteriaCount: number;
  onSelectChallenge: (id: string) => void;
  onBackToBank: () => void;
  onUpdateCustomMeta: (meta: CustomChallengeMeta) => void;
  onOpenComparator: () => void;
}

export function ChallengeHeader({
  challenge,
  progress,
  allChallengesProgress,
  status,
  displayTitle,
  displayObjetivo,
  verifiedCriteriaCount,
  onSelectChallenge,
  onBackToBank,
  onUpdateCustomMeta,
  onOpenComparator,
}: ChallengeHeaderProps) {
  const [showCriteria, setShowCriteria] = useState(false);

  const canCompare =
    progress.versions.length >= 2 ||
    (progress.versions.length >= 1 && progress.draftResponse.trim().length > 0);

  return (
    <section className="bg-white dark:bg-[#1E293B] border border-[#CBD5E1] dark:border-[#334155] border-t-4 border-t-[#1E3A5F] dark:border-t-[#60A5FA] rounded-xl p-5 sm:p-6 transition-colors">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={onBackToBank}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 dark:text-[#CBD5E1] hover:text-[#1E3A5F] dark:hover:text-[#60A5FA] whitespace-nowrap shrink-0"
          >
            <ArrowLeft className="w-3.5 h-3.5" aria-hidden="true" />
            <span>Banco de Retos</span>
          </button>
          <span aria-hidden="true" className="text-slate-300 dark:text-slate-600">
            /
          </span>
          <label htmlFor="challenge-quick-switch" className="sr-only">
            Cambiar reto activo
          </label>
          <select
            id="challenge-quick-switch"
            value={challenge.id}
            onChange={(e) => {
              const targetId = e.target.value;
              if (isChallengeUnlocked(targetId, allChallengesProgress)) {
                onSelectChallenge(targetId);
              }
            }}
            className="text-xs font-medium text-[#1E3A5F] dark:text-[#F1F5F9] bg-[#F5F7FA] dark:bg-[#0F172A] border border-[#CBD5E1] dark:border-[#334155] rounded-md px-2.5 py-1.5 focus:outline-none focus:border-[#1E3A5F] dark:focus:border-[#60A5FA] max-w-full sm:max-w-md"
          >
            {CHALLENGES.map((c) => {
              const unlocked = isChallengeUnlocked(c.id, allChallengesProgress);
              return (
                <option key={c.id} value={c.id} disabled={!unlocked}>
                  {c.orderLabel} · {c.level} — {c.title}
                  {!unlocked ? " (Bloqueado)" : ""}
                </option>
              );
            })}
          </select>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <span
            className={`inline-flex items-center gap-1.5 text-xs font-semibold ${
              status === "Completado"
                ? "text-emerald-700 dark:text-emerald-400"
                : status === "En progreso"
                ? "text-amber-700 dark:text-amber-400"
                : "text-[#1E3A5F] dark:text-[#60A5FA]"
            }`}
          >
            {status === "Completado" && (
              <CheckCircle2 className="w-4 h-4" aria-hidden="true" />
            )}
            <span>Estado: {status}</span>
          </span>

          {canCompare && (
            <button
              type="button"
              onClick={onOpenComparator}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-[#1E3A5F] dark:bg-[#2B4F7E] hover:bg-[#152B47] dark:hover:bg-[#356199] rounded-lg transition-colors whitespace-nowrap shrink-0"
            >
              <Columns2 className="w-3.5 h-3.5" aria-hidden="true" />
              <span className="tabular-nums">
                Comparar ejecuciones (
                {progress.versions.length +
                  (progress.draftResponse.trim().length > 0 ? 1 : 0)}
                )
              </span>
            </button>
          )}

          <button
            type="button"
            onClick={() => setShowCriteria((v) => !v)}
            aria-expanded={showCriteria}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-[#1E3A5F] dark:text-[#F1F5F9] bg-white dark:bg-[#0F172A] hover:bg-[#F5F7FA] dark:hover:bg-[#334155]/60 border border-[#CBD5E1] dark:border-[#334155] rounded-lg transition-colors whitespace-nowrap shrink-0"
          >
            <span>Guía del reto</span>
            {showCriteria ? (
              <ChevronUp className="w-3.5 h-3.5" aria-hidden="true" />
            ) : (
              <ChevronDown className="w-3.5 h-3.5" aria-hidden="true" />
            )}
          </button>
        </div>
      </div>

      {/* Título y objetivo */}
      <div className="mt-4">
        {challenge.esLibre ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label
                htmlFor="custom-challenge-title"
                className="block text-xs font-semibold text-slate-600 dark:text-[#CBD5E1] mb-1"
              >
                Título de tu tarea propia
              </label>
              <input
                id="custom-challenge-title"
                type="text"
                value={progress.customMeta?.title ?? ""}
                onChange={(e) =>
                  onUpdateCustomMeta({
                    title: e.target.value,
                    objetivo: progress.customMeta?.objetivo ?? "",
                  })
                }
                placeholder="Ej. Planificación de secuencia didáctica de Orientación Educativa"
                className="w-full px-3 py-2 text-sm font-semibold text-[#1E3A5F] dark:text-[#F1F5F9] bg-[#F5F7FA] dark:bg-[#0F172A] border border-[#CBD5E1] dark:border-[#334155] rounded-lg placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:bg-white dark:focus:bg-[#0F172A] focus:border-[#1E3A5F] dark:focus:border-[#60A5FA] focus:outline-none"
              />
            </div>
            <div>
              <label
                htmlFor="custom-challenge-objetivo"
                className="block text-xs font-semibold text-slate-600 dark:text-[#CBD5E1] mb-1"
              >
                Objetivo de aprendizaje / calidad
              </label>
              <input
                id="custom-challenge-objetivo"
                type="text"
                value={progress.customMeta?.objetivo ?? ""}
                onChange={(e) =>
                  onUpdateCustomMeta({
                    title: progress.customMeta?.title ?? "",
                    objetivo: e.target.value,
                  })
                }
                placeholder="Ej. Diseñar instrumentos de evaluación auténtica coherentes con el currículo"
                className="w-full px-3 py-2 text-sm text-[#0F172A] dark:text-[#F1F5F9] bg-[#F5F7FA] dark:bg-[#0F172A] border border-[#CBD5E1] dark:border-[#334155] rounded-lg placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:bg-white dark:focus:bg-[#0F172A] focus:border-[#1E3A5F] dark:focus:border-[#60A5FA] focus:outline-none"
              />
            </div>
          </div>
        ) : (
          <>
            <h1 className="text-xl sm:text-2xl font-bold text-[#1E3A5F] dark:text-[#F1F5F9]">
              {challenge.orderLabel}: {displayTitle}
            </h1>
            <p className="mt-1.5 text-sm text-slate-600 dark:text-[#CBD5E1]">
              <span className="font-semibold text-[#0F172A] dark:text-[#F1F5F9]">
                Objetivo:
              </span>{" "}
              {displayObjetivo}
            </p>
          </>
        )}
      </div>

      {/* Panel desplegable de criterios y bloques clave */}
      {showCriteria && (
        <div className="mt-4 pt-4 border-t border-[#E2E8F0] dark:border-[#334155] grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          <div>
            <p className="text-xs font-semibold text-[#1E3A5F] dark:text-[#60A5FA] mb-2">
              Criterios específicos de verificación
            </p>
            <ul className="space-y-1.5 text-slate-700 dark:text-[#CBD5E1]">
              {challenge.criterios.map((crit, idx) => (
                <li key={idx} className="flex items-start gap-2">
                  <span className="font-mono text-xs text-[#8B1E24] dark:text-[#F87171] mt-0.5 tabular-nums">
                    0{idx + 1}.
                  </span>
                  <span>{crit}</span>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <p className="text-xs font-semibold text-[#1E3A5F] dark:text-[#60A5FA] mb-2">
              Contexto y bloques prioritarios
            </p>
            <p className="text-slate-600 dark:text-[#CBD5E1] mb-2">
              {challenge.contexto}
            </p>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              <span className="font-semibold text-slate-700 dark:text-[#F1F5F9]">
                {challenge.esLibre ? "Bloques clave:" : "Dimensiones clave:"}
              </span>{" "}
              {challenge.bloquesClave.join(" · ")}
            </p>
          </div>
        </div>
      )}
    </section>
  );
}
