import { useState } from "react";
import {
  AlertCircle,
  ArrowRight,
  Award,
  Blocks,
  CheckCircle2,
  Circle,
  Clock,
  Lock,
  RotateCcw,
} from "lucide-react";
import { CHALLENGES } from "../data/challenges";
import { ChallengeLevel, ChallengeProgress, ChallengeStatus } from "../types/lab";
import {
  STRUCTURED_CHALLENGE_IDS,
  getUnlockRequirementMessage,
  isChallengeUnlocked,
  isFormativeSequenceCompleted,
  resolveChallengeStatus,
} from "../utils/progression";

interface ChallengeBankViewProps {
  challengesProgress: Record<string, ChallengeProgress>;
  blockedNotice?: string | null;
  onDismissBlockedNotice?: () => void;
  onSelectChallenge: (challengeId: string) => void;
  onOpenConstructor: () => void;
}

type LevelFilterOption = "Todos" | ChallengeLevel;
type StatusFilterOption = "Todos" | ChallengeStatus;

const LEVEL_FILTERS: LevelFilterOption[] = [
  "Todos",
  "Básico",
  "Intermedio",
  "Avanzado",
  "Libre",
];

const STATUS_FILTERS: StatusFilterOption[] = [
  "Todos",
  "Disponible",
  "En progreso",
  "Completado",
  "Bloqueado",
];

function StatusIndicator({
  status,
  versionCount,
}: {
  status: ChallengeStatus;
  versionCount: number;
}) {
  if (status === "Completado") {
    return (
      <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-700 dark:text-emerald-400 whitespace-nowrap shrink-0">
        <CheckCircle2 className="w-3.5 h-3.5" aria-hidden="true" />
        <span>Completado</span>
      </span>
    );
  }
  if (status === "En progreso") {
    return (
      <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-amber-700 dark:text-amber-400 whitespace-nowrap shrink-0">
        <Clock className="w-3.5 h-3.5" aria-hidden="true" />
        <span className="tabular-nums">
          En progreso{versionCount > 0 ? ` · v${versionCount}` : ""}
        </span>
      </span>
    );
  }
  if (status === "Bloqueado") {
    return (
      <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 dark:text-slate-400 whitespace-nowrap shrink-0">
        <Lock className="w-3.5 h-3.5" aria-hidden="true" />
        <span>Bloqueado</span>
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#1E3A5F] dark:text-[#60A5FA] whitespace-nowrap shrink-0">
      <Circle className="w-3.5 h-3.5" aria-hidden="true" />
      <span>Disponible</span>
    </span>
  );
}

function levelTextClass(level: ChallengeLevel): string {
  switch (level) {
    case "Básico":
      return "text-[#1E3A5F] dark:text-[#60A5FA]";
    case "Intermedio":
      return "text-[#8B1E24] dark:text-[#F87171]";
    case "Avanzado":
      return "text-[#0F172A] dark:text-[#F1F5F9]";
    case "Libre":
      return "text-emerald-700 dark:text-emerald-400";
  }
}

export function ChallengeBankView({
  challengesProgress,
  blockedNotice,
  onDismissBlockedNotice,
  onSelectChallenge,
  onOpenConstructor,
}: ChallengeBankViewProps) {
  const [levelFilter, setLevelFilter] = useState<LevelFilterOption>("Todos");
  const [statusFilter, setStatusFilter] = useState<StatusFilterOption>("Todos");

  const filteredChallenges = CHALLENGES.filter((ch) => {
    const matchesLevel =
      levelFilter === "Todos" || ch.level === levelFilter;
    const chStatus = resolveChallengeStatus(ch.id, challengesProgress);
    const matchesStatus =
      statusFilter === "Todos" || chStatus === statusFilter;
    return matchesLevel && matchesStatus;
  });

  const structuredCompletedCount = STRUCTURED_CHALLENGE_IDS.filter(
    (id) => resolveChallengeStatus(id, challengesProgress) === "Completado"
  ).length;
  const completedCount = CHALLENGES.filter(
    (c) => resolveChallengeStatus(c.id, challengesProgress) === "Completado"
  ).length;
  const inProgressCount = CHALLENGES.filter(
    (c) => resolveChallengeStatus(c.id, challengesProgress) === "En progreso"
  ).length;
  const sequenceCompleted = isFormativeSequenceCompleted(challengesProgress);
  const progressPercent = Math.round(
    (structuredCompletedCount / STRUCTURED_CHALLENGE_IDS.length) * 100
  );

  return (
    <div className="space-y-8">
      {/* Aviso si se intentó abrir directamente un reto bloqueado */}
      {blockedNotice && (
        <div
          role="alert"
          className="flex flex-wrap items-center justify-between gap-3 p-4 rounded-xl bg-amber-50 dark:bg-amber-950/50 border border-amber-300 dark:border-amber-800 text-amber-950 dark:text-amber-100 text-xs sm:text-sm"
        >
          <div className="flex items-start gap-2.5">
            <AlertCircle
              className="w-4 h-4 text-amber-700 dark:text-amber-400 shrink-0 mt-0.5"
              aria-hidden="true"
            />
            <span>{blockedNotice}</span>
          </div>
          {onDismissBlockedNotice && (
            <button
              type="button"
              onClick={onDismissBlockedNotice}
              className="text-xs font-semibold underline"
            >
              Entendido
            </button>
          )}
        </div>
      )}

      {/* Cabecera y controles de filtro por nivel y estado */}
      <div className="flex flex-col xl:flex-row xl:items-end justify-between gap-5">
        <div className="space-y-2">
          <h1 className="text-2xl sm:text-3xl font-bold text-[#1E3A5F] dark:text-[#F1F5F9]">
            Banco de Retos en Ciencias de la Educación
          </h1>
          <p className="text-sm text-[#1E293B] dark:text-[#CBD5E1] max-w-2xl">
            Secuencia progresiva en seis retos diferenciados: reconocimiento,
            discriminación, diagnóstico, análisis de respuesta, resolución de
            caso y auditoría crítica. Aprueba los dos retos de cada nivel para
            desbloquear el siguiente; el Reto Libre permanece siempre disponible.
          </p>
          <p className="text-xs text-slate-500 dark:text-slate-400 tabular-nums">
            {structuredCompletedCount} de {STRUCTURED_CHALLENGE_IDS.length}{" "}
            retos formativos aprobados ({completedCount} de {CHALLENGES.length}{" "}
            totales)
            <span aria-hidden="true" className="mx-2">
              ·
            </span>
            {inProgressCount} en progreso
          </p>
        </div>

        {/* Filtros por nivel y por estado */}
        <div className="flex flex-col sm:flex-row flex-wrap items-start sm:items-center gap-3">
          <div className="space-y-1">
            <span className="block text-[11px] font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Nivel
            </span>
            <div
              role="group"
              aria-label="Filtrar retos por nivel"
              className="inline-flex flex-wrap items-center gap-1 p-1 bg-white dark:bg-[#1E293B] border border-[#CBD5E1] dark:border-[#334155] rounded-lg"
            >
              {LEVEL_FILTERS.map((levelOption) => {
                const active = levelFilter === levelOption;
                return (
                  <button
                    key={levelOption}
                    type="button"
                    onClick={() => setLevelFilter(levelOption)}
                    className={`px-2.5 py-1.5 text-xs font-medium rounded-md whitespace-nowrap shrink-0 transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#1E3A5F] dark:focus-visible:outline-[#60A5FA] ${
                      active
                        ? "bg-[#1E3A5F] dark:bg-[#2B4F7E] text-white"
                        : "text-slate-600 dark:text-[#CBD5E1] hover:text-[#1E3A5F] dark:hover:text-[#F1F5F9] hover:bg-[#F5F7FA] dark:hover:bg-[#0F172A]"
                    }`}
                  >
                    {levelOption}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="space-y-1">
            <span className="block text-[11px] font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Estado
            </span>
            <div
              role="group"
              aria-label="Filtrar retos por estado"
              className="inline-flex flex-wrap items-center gap-1 p-1 bg-white dark:bg-[#1E293B] border border-[#CBD5E1] dark:border-[#334155] rounded-lg"
            >
              {STATUS_FILTERS.map((statusOption) => {
                const active = statusFilter === statusOption;
                return (
                  <button
                    key={statusOption}
                    type="button"
                    onClick={() => setStatusFilter(statusOption)}
                    className={`px-2.5 py-1.5 text-xs font-medium rounded-md whitespace-nowrap shrink-0 transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#1E3A5F] dark:focus-visible:outline-[#60A5FA] ${
                      active
                        ? "bg-[#8B1E24] dark:bg-[#C93B44] text-white"
                        : "text-slate-600 dark:text-[#CBD5E1] hover:text-[#1E3A5F] dark:hover:text-[#F1F5F9] hover:bg-[#F5F7FA] dark:hover:bg-[#0F172A]"
                    }`}
                  >
                    {statusOption}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Avance general + herramienta independiente Constructor */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-stretch">
        <section className="lg:col-span-7 bg-white dark:bg-[#1E293B] border border-[#CBD5E1] dark:border-[#334155] rounded-xl p-5 flex flex-col justify-between gap-3">
          <div className="flex items-center justify-between gap-3">
            <span className="text-xs font-bold uppercase tracking-wider text-[#1E3A5F] dark:text-[#60A5FA]">
              Avance en la secuencia formativa
            </span>
            <span className="font-mono text-xs font-bold text-[#8B1E24] dark:text-[#F87171] tabular-nums">
              {structuredCompletedCount} / {STRUCTURED_CHALLENGE_IDS.length} (
              {progressPercent}%)
            </span>
          </div>
          <div className="w-full h-2.5 rounded-full bg-[#E2E8F0] dark:bg-[#0F172A] overflow-hidden">
            <div
              className="h-full bg-[#1E3A5F] dark:bg-[#60A5FA] transition-all duration-300"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-600 dark:text-[#CBD5E1]">
            <span>Básico: Retos 01 y 02</span>
            <span aria-hidden="true">→</span>
            <span>Intermedio: Retos 03 y 04</span>
            <span aria-hidden="true">→</span>
            <span>Avanzado: Retos 05 y 06</span>
          </div>
        </section>

        <section className="lg:col-span-5 bg-white dark:bg-[#1E293B] border border-[#CBD5E1] dark:border-[#334155] border-l-4 border-l-[#1E3A5F] dark:border-l-[#60A5FA] rounded-xl p-5 flex flex-col sm:flex-row lg:flex-col xl:flex-row items-start sm:items-center lg:items-start xl:items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            <span className="w-9 h-9 rounded-lg bg-[#1E3A5F]/10 dark:bg-[#2B4F7E]/30 text-[#1E3A5F] dark:text-[#60A5FA] flex items-center justify-center shrink-0">
              <Blocks className="w-4 h-4" aria-hidden="true" />
            </span>
            <div>
              <h2 className="text-sm font-bold text-[#1E3A5F] dark:text-[#F1F5F9]">
                Constructor Guiado por Bloques
              </h2>
              <p className="text-xs text-slate-600 dark:text-[#CBD5E1] mt-0.5 leading-snug">
                Herramienta independiente para aprender a formular instrucciones
                por componentes.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onOpenConstructor}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-[#1E3A5F] dark:bg-[#2B4F7E] hover:bg-[#152B47] dark:hover:bg-[#356199] rounded-lg transition-colors whitespace-nowrap shrink-0"
          >
            <span>Abrir Constructor</span>
            <ArrowRight className="w-3.5 h-3.5" aria-hidden="true" />
          </button>
        </section>
      </div>

      {/* Banner de secuencia formativa completada */}
      {sequenceCompleted && (
        <section className="bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-300 dark:border-emerald-800 rounded-xl p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            <Award
              className="w-5 h-5 text-emerald-700 dark:text-emerald-400 shrink-0 mt-0.5"
              aria-hidden="true"
            />
            <div>
              <h2 className="text-sm sm:text-base font-bold text-emerald-950 dark:text-emerald-100">
                ¡Has completado la secuencia formativa de los seis retos!
              </h2>
              <p className="text-xs sm:text-sm text-emerald-900/90 dark:text-emerald-200 mt-0.5">
                Aprobaste los niveles Básico, Intermedio y Avanzado. Puedes
                repasar cualquier reto o experimentar libremente en el Reto
                Libre.
              </p>
            </div>
          </div>
        </section>
      )}

      {/* Cuadrícula de retos o estado vacío de filtro */}
      {filteredChallenges.length === 0 ? (
        <section className="bg-white dark:bg-[#1E293B] border border-[#CBD5E1] dark:border-[#334155] rounded-xl p-10 text-center space-y-3">
          <h2 className="text-base sm:text-lg font-semibold text-[#1E3A5F] dark:text-[#F1F5F9]">
            No hay retos que coincidan con los filtros seleccionados
          </h2>
          <p className="text-sm text-slate-600 dark:text-[#CBD5E1] max-w-md mx-auto">
            Prueba combinando otro nivel o estado para visualizar los retos
            disponibles.
          </p>
          <div className="pt-1">
            <button
              type="button"
              onClick={() => {
                setLevelFilter("Todos");
                setStatusFilter("Todos");
              }}
              className="inline-flex items-center gap-2 px-4 py-2 text-xs sm:text-sm font-semibold text-[#1E3A5F] dark:text-[#F1F5F9] bg-[#F5F7FA] dark:bg-[#0F172A] hover:bg-slate-200/70 dark:hover:bg-[#334155]/60 border border-[#CBD5E1] dark:border-[#334155] rounded-lg transition-colors"
            >
              <RotateCcw className="w-3.5 h-3.5" aria-hidden="true" />
              <span>Mostrar todos los retos</span>
            </button>
          </div>
        </section>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredChallenges.map((ch) => {
            const progress = challengesProgress[ch.id];
            const unlocked = isChallengeUnlocked(ch.id, challengesProgress);
            const status = resolveChallengeStatus(ch.id, challengesProgress);
            const unlockRequirement = !unlocked
              ? getUnlockRequirementMessage(ch.id)
              : null;

            const displayTitle =
              ch.esLibre && progress?.customMeta?.title
                ? progress.customMeta.title
                : ch.title;
            const displayObjetivo =
              ch.esLibre && progress?.customMeta?.objetivo
                ? progress.customMeta.objetivo
                : ch.objetivo;

            return (
              <button
                key={ch.id}
                type="button"
                disabled={!unlocked}
                aria-disabled={!unlocked}
                onClick={() => {
                  if (unlocked) {
                    onSelectChallenge(ch.id);
                  }
                }}
                className={`group text-left rounded-xl p-6 flex flex-col justify-between transition-colors border ${
                  unlocked
                    ? `bg-white dark:bg-[#1E293B] border-[#CBD5E1] dark:border-[#334155] border-t-4 ${
                        ch.level === "Intermedio" || ch.level === "Avanzado"
                          ? "border-t-[#8B1E24] dark:border-t-[#F87171]"
                          : "border-t-[#1E3A5F] dark:border-t-[#60A5FA]"
                      } hover:border-[#8B1E24] dark:hover:border-[#60A5FA] cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#1E3A5F] dark:focus-visible:outline-[#60A5FA]`
                    : "bg-slate-100/80 dark:bg-[#0F172A]/70 border-dashed border-[#CBD5E1] dark:border-[#334155] opacity-75 cursor-not-allowed"
                }`}
              >
                <div>
                  <div className="flex items-center justify-between gap-3 text-xs">
                    <span className="text-slate-500 dark:text-slate-400 font-medium">
                      {ch.orderLabel}
                      <span aria-hidden="true" className="mx-1.5">
                        ·
                      </span>
                      <span
                        className={`font-semibold ${levelTextClass(ch.level)}`}
                      >
                        {ch.level}
                      </span>
                      {ch.esLibre && (
                        <>
                          <span aria-hidden="true" className="mx-1.5">
                            ·
                          </span>
                          <span className="text-emerald-700 dark:text-emerald-400 font-medium">
                            Acceso permanente
                          </span>
                        </>
                      )}
                    </span>
                    <StatusIndicator
                      status={status}
                      versionCount={progress?.versions.length ?? 0}
                    />
                  </div>

                  <h2
                    className={`mt-3 text-lg font-semibold transition-colors ${
                      unlocked
                        ? "text-[#1E3A5F] dark:text-[#F1F5F9] group-hover:text-[#8B1E24] dark:group-hover:text-[#60A5FA]"
                        : "text-slate-600 dark:text-slate-300"
                    }`}
                  >
                    {displayTitle}
                  </h2>

                  <div className="mt-3 space-y-2 text-sm text-[#1E293B] dark:text-[#CBD5E1] leading-relaxed">
                    <p>
                      <span className="font-semibold text-[#0F172A] dark:text-[#F1F5F9]">
                        Propósito:
                      </span>{" "}
                      {displayObjetivo}
                    </p>
                    <p className="text-xs text-slate-600 dark:text-slate-400">
                      {ch.contexto}
                    </p>
                  </div>
                </div>

                <div className="mt-5 pt-4 border-t border-[#E2E8F0] dark:border-[#334155] space-y-3">
                  <p className="text-xs text-slate-600 dark:text-slate-400">
                    <span className="font-semibold text-[#0F172A] dark:text-[#CBD5E1]">
                      {ch.secuencia ? "Secuencia:" : "Bloques clave:"}
                    </span>{" "}
                    {ch.secuencia
                      ? ch.secuencia.join(" → ")
                      : ch.bloquesClave.join(" · ")}
                  </p>

                  {unlocked ? (
                    <div className="flex items-center justify-between gap-2 text-xs font-semibold text-[#8B1E24] dark:text-[#F87171]">
                      <span className="text-slate-500 dark:text-slate-400 font-normal truncate">
                        {progress?.activityResult
                          ? progress.activityResult.resultLabel
                          : ch.esLibre
                          ? `${ch.criterios.length} criterios de evaluación`
                          : "Actividad evaluada"}
                      </span>
                      <span className="inline-flex items-center gap-1 group-hover:translate-x-0.5 transition-transform shrink-0">
                        <span>
                          {status === "Completado"
                            ? "Repasar actividad"
                            : ch.esLibre
                            ? "Abrir mesa"
                            : "Iniciar reto"}
                        </span>
                        <ArrowRight className="w-3.5 h-3.5" aria-hidden="true" />
                      </span>
                    </div>
                  ) : (
                    <div className="flex items-start gap-2 text-xs font-medium text-slate-600 dark:text-slate-400">
                      <Lock
                        className="w-3.5 h-3.5 shrink-0 mt-0.5 text-slate-500 dark:text-slate-400"
                        aria-hidden="true"
                      />
                      <span>{unlockRequirement}</span>
                    </div>
                  )}
                </div>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
