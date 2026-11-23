import { useState } from "react";
import { ArrowRight, CheckCircle2, Circle, Clock } from "lucide-react";
import { CHALLENGES } from "../data/challenges";
import { getChallengeStatus } from "../hooks/useLabStorage";
import { ChallengeLevel, ChallengeProgress, ChallengeStatus } from "../types/lab";

interface ChallengeBankViewProps {
  challengesProgress: Record<string, ChallengeProgress>;
  onSelectChallenge: (challengeId: string) => void;
}

type FilterOption = "Todos" | "Básico" | "Intermedio" | "Avanzado";

const FILTERS: FilterOption[] = ["Todos", "Básico", "Intermedio", "Avanzado"];

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
  if (status === "En iteración") {
    return (
      <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-amber-700 dark:text-amber-400 whitespace-nowrap shrink-0">
        <Clock className="w-3.5 h-3.5" aria-hidden="true" />
        <span className="tabular-nums">
          En iteración{versionCount > 0 ? ` · v${versionCount}` : ""}
        </span>
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-500 dark:text-slate-400 whitespace-nowrap shrink-0">
      <Circle className="w-3.5 h-3.5" aria-hidden="true" />
      <span>Pendiente</span>
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
  onSelectChallenge,
}: ChallengeBankViewProps) {
  const [filter, setFilter] = useState<FilterOption>("Todos");

  const filteredChallenges = CHALLENGES.filter((ch) => {
    if (filter === "Todos") return true;
    return ch.level === filter;
  });

  const completedCount = CHALLENGES.filter(
    (c) => getChallengeStatus(challengesProgress[c.id]) === "Completado"
  ).length;
  const iteratingCount = CHALLENGES.filter(
    (c) => getChallengeStatus(challengesProgress[c.id]) === "En iteración"
  ).length;

  return (
    <div className="space-y-8">
      {/* Cabecera y controles de filtro */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-[#1E3A5F] dark:text-[#F1F5F9]">
            Banco de Retos en Ciencias de la Educación
          </h1>
          <p className="mt-1.5 text-sm text-[#1E293B] dark:text-[#CBD5E1] max-w-2xl">
            Progresión gradual en didáctica, evaluación, currículo, teorías del
            aprendizaje y gestión educativa. Selecciona un reto para abrir su
            mesa de trabajo.
          </p>
          <p className="mt-2 text-xs text-slate-500 dark:text-slate-400 tabular-nums">
            {completedCount} de {CHALLENGES.length} completados
            <span aria-hidden="true" className="mx-2">
              ·
            </span>
            {iteratingCount} en iteración
          </p>
        </div>

        {/* Filtros por nivel */}
        <div
          role="group"
          aria-label="Filtrar retos por nivel"
          className="inline-flex items-center gap-1 p-1 bg-white dark:bg-[#1E293B] border border-[#CBD5E1] dark:border-[#334155] rounded-lg self-start md:self-auto"
        >
          {FILTERS.map((levelOption) => {
            const active = filter === levelOption;
            return (
              <button
                key={levelOption}
                type="button"
                onClick={() => setFilter(levelOption)}
                className={`px-3 py-1.5 text-xs font-medium rounded-md whitespace-nowrap shrink-0 transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#1E3A5F] dark:focus-visible:outline-[#60A5FA] ${
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

      {/* Cuadrícula de retos */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredChallenges.map((ch) => {
          const progress = challengesProgress[ch.id];
          const status = getChallengeStatus(progress);
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
              onClick={() => onSelectChallenge(ch.id)}
              className="group text-left bg-white dark:bg-[#1E293B] border border-[#CBD5E1] dark:border-[#334155] hover:border-[#8B1E24] dark:hover:border-[#60A5FA] rounded-xl p-6 flex flex-col justify-between transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#1E3A5F] dark:focus-visible:outline-[#60A5FA]"
            >
              <div>
                {/* Metadatos limpios sin cápsulas */}
                <div className="flex items-center justify-between gap-3 text-xs">
                  <span className="text-slate-500 dark:text-slate-400 font-medium">
                    {ch.orderLabel}
                    <span aria-hidden="true" className="mx-1.5">
                      ·
                    </span>
                    <span className={`font-semibold ${levelTextClass(ch.level)}`}>
                      {ch.level}
                    </span>
                  </span>
                  <StatusIndicator
                    status={status}
                    versionCount={progress?.versions.length ?? 0}
                  />
                </div>

                <h2 className="mt-3 text-lg font-semibold text-[#1E3A5F] dark:text-[#F1F5F9] group-hover:text-[#8B1E24] dark:group-hover:text-[#60A5FA] transition-colors">
                  {displayTitle}
                </h2>

                <div className="mt-3 space-y-2 text-sm text-[#1E293B] dark:text-[#CBD5E1] leading-relaxed">
                  <p>
                    <span className="font-semibold text-[#0F172A] dark:text-[#F1F5F9]">
                      Contexto:
                    </span>{" "}
                    {ch.contexto}
                  </p>
                  <p>
                    <span className="font-semibold text-[#0F172A] dark:text-[#F1F5F9]">
                      Objetivo:
                    </span>{" "}
                    {displayObjetivo}
                  </p>
                </div>
              </div>

              <div className="mt-5 pt-4 border-t border-[#E2E8F0] dark:border-[#334155] space-y-3">
                <p className="text-xs text-slate-600 dark:text-slate-400">
                  <span className="font-semibold text-[#0F172A] dark:text-[#CBD5E1]">
                    Bloques clave:
                  </span>{" "}
                  {ch.bloquesClave.join(" · ")}
                </p>

                <div className="flex items-center justify-between text-xs font-semibold text-[#8B1E24] dark:text-[#F87171]">
                  <span className="text-slate-500 dark:text-slate-400 font-normal tabular-nums">
                    {ch.criterios.length} criterios de evaluación
                  </span>
                  <span className="inline-flex items-center gap-1 group-hover:translate-x-0.5 transition-transform">
                    <span>Abrir mesa</span>
                    <ArrowRight className="w-3.5 h-3.5" aria-hidden="true" />
                  </span>
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
