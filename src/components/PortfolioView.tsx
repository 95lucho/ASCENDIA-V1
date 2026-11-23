import { useState } from "react";
import {
  ArrowRight,
  Check,
  CheckCircle2,
  Clock,
  Copy,
  Download,
  RotateCcw,
} from "lucide-react";
import { CHALLENGES } from "../data/challenges";
import { getChallengeStatus } from "../hooks/useLabStorage";
import { LabStorageState } from "../types/lab";
import {
  exportPortfolioMarkdown,
  formatDateTimeEs,
} from "../utils/promptBuilder";

interface PortfolioViewProps {
  state: LabStorageState;
  onOpenChallenge: (challengeId: string) => void;
  onResetAll: () => void;
}

export function PortfolioView({
  state,
  onOpenChallenge,
  onResetAll,
}: PortfolioViewProps) {
  const [selectedFilterId, setSelectedFilterId] = useState<string>("all");
  const [copiedMd, setCopiedMd] = useState(false);
  const [copyError, setCopyError] = useState(false);
  const [confirmReset, setConfirmReset] = useState(false);

  const completedCount = CHALLENGES.filter(
    (c) => getChallengeStatus(state.challenges[c.id]) === "Completado"
  ).length;
  const iteratingCount = CHALLENGES.filter(
    (c) => getChallengeStatus(state.challenges[c.id]) === "En iteración"
  ).length;
  const totalVersions = CHALLENGES.reduce(
    (acc, c) => acc + (state.challenges[c.id]?.versions.length ?? 0),
    0
  );

  const challengesWithActivity = CHALLENGES.filter((c) => {
    const p = state.challenges[c.id];
    return p && (p.versions.length > 0 || p.completed);
  });

  const visibleChallenges =
    selectedFilterId === "all"
      ? challengesWithActivity
      : challengesWithActivity.filter((c) => c.id === selectedFilterId);

  const handleCopyMarkdown = async () => {
    const md = exportPortfolioMarkdown(state, CHALLENGES);
    setCopyError(false);
    try {
      await navigator.clipboard.writeText(md);
      setCopiedMd(true);
      setTimeout(() => setCopiedMd(false), 2000);
    } catch {
      setCopiedMd(false);
      setCopyError(true);
    }
  };

  const handleDownloadMarkdown = () => {
    const md = exportPortfolioMarkdown(state, CHALLENGES);
    const blob = new Blob([md], { type: "text/markdown;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    const slug = (state.studentName.trim() || "estudiante")
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-");
    a.href = url;
    a.download = `bitacora-prompts-${slug}.md`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-8">
      {/* Cabecera y acciones de exportación */}
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-[#1E3A5F] dark:text-[#F1F5F9]">
            Bitácora de Progreso y Portafolio Metacognitivo
          </h1>
          <p className="mt-1.5 text-sm text-slate-600 dark:text-[#CBD5E1] max-w-2xl">
            Registro trazable de tus versiones de prompts, auditorías críticas y
            evidencias de mejora para entrega o autoevaluación académica.
          </p>
          {copyError && (
            <p className="mt-2 text-xs text-amber-700 dark:text-amber-300">
              No se pudo acceder al portapapeles automático. Usa “Descargar reporte (.md)” para guardar tu portafolio.
            </p>
          )}
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            type="button"
            onClick={handleCopyMarkdown}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold bg-white dark:bg-[#1E293B] hover:bg-[#F5F7FA] dark:hover:bg-[#334155]/60 border border-[#CBD5E1] dark:border-[#334155] text-[#1E3A5F] dark:text-[#F1F5F9] rounded-lg transition-colors whitespace-nowrap shrink-0"
          >
            {copiedMd ? (
              <>
                <Check
                  className="w-3.5 h-3.5 text-emerald-700 dark:text-emerald-400"
                  aria-hidden="true"
                />
                <span className="text-emerald-700 dark:text-emerald-400">
                  Markdown copiado
                </span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5" aria-hidden="true" />
                <span>Copiar Markdown</span>
              </>
            )}
          </button>

          <button
            type="button"
            onClick={handleDownloadMarkdown}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold bg-[#1E3A5F] dark:bg-[#2B4F7E] hover:bg-[#152B47] dark:hover:bg-[#356199] text-white rounded-lg transition-colors whitespace-nowrap shrink-0"
          >
            <Download className="w-3.5 h-3.5" aria-hidden="true" />
            <span>Descargar reporte (.md)</span>
          </button>

          {confirmReset ? (
            <div className="inline-flex items-center gap-2 bg-red-50 dark:bg-red-950/60 border border-red-200 dark:border-red-800 rounded-lg px-3 py-1.5">
              <span className="text-xs font-medium text-red-900 dark:text-red-100">
                ¿Borrar todo?
              </span>
              <button
                type="button"
                onClick={() => {
                  onResetAll();
                  setConfirmReset(false);
                }}
                className="text-xs font-semibold text-red-700 dark:text-red-300 underline"
              >
                Confirmar
              </button>
              <button
                type="button"
                onClick={() => setConfirmReset(false)}
                className="text-xs text-slate-600 dark:text-slate-300"
              >
                Cancelar
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => setConfirmReset(true)}
              className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-slate-600 dark:text-[#CBD5E1] hover:text-red-700 dark:hover:text-red-400 bg-white dark:bg-[#1E293B] border border-[#CBD5E1] dark:border-[#334155] rounded-lg transition-colors whitespace-nowrap shrink-0"
            >
              <RotateCcw className="w-3.5 h-3.5" aria-hidden="true" />
              <span>Reiniciar</span>
            </button>
          )}
        </div>
      </div>

      {/* Tira de indicadores académicos */}
      <section className="bg-white dark:bg-[#1E293B] border border-[#CBD5E1] dark:border-[#334155] rounded-xl grid grid-cols-2 lg:grid-cols-4 divide-y lg:divide-y-0 lg:divide-x divide-[#E2E8F0] dark:divide-[#334155]">
        <div className="p-5">
          <p className="text-xs font-medium text-slate-500 dark:text-slate-400">
            Estudiante
          </p>
          <p className="mt-1 text-base font-semibold text-[#1E3A5F] dark:text-[#F1F5F9] truncate">
            {state.studentName.trim() || "Sin identificar"}
          </p>
        </div>
        <div className="p-5">
          <p className="text-xs font-medium text-slate-500 dark:text-slate-400">
            Retos completados
          </p>
          <p className="mt-1 text-2xl font-bold text-[#1E3A5F] dark:text-[#60A5FA] tabular-nums">
            {completedCount}{" "}
            <span className="text-sm font-normal text-slate-500 dark:text-slate-400">
              / {CHALLENGES.length}
            </span>
          </p>
        </div>
        <div className="p-5">
          <p className="text-xs font-medium text-slate-500 dark:text-slate-400">
            Retos en iteración
          </p>
          <p className="mt-1 text-2xl font-bold text-[#8B1E24] dark:text-[#F87171] tabular-nums">
            {iteratingCount}
          </p>
        </div>
        <div className="p-5">
          <p className="text-xs font-medium text-slate-500 dark:text-slate-400">
            Versiones documentadas
          </p>
          <p className="mt-1 text-2xl font-bold text-[#1E3A5F] dark:text-[#F1F5F9] tabular-nums">
            {totalVersions}
          </p>
        </div>
      </section>

      {/* Filtro por reto */}
      {challengesWithActivity.length > 0 && (
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => setSelectedFilterId("all")}
            className={`px-3 py-1.5 text-xs font-medium rounded-lg border transition-colors ${
              selectedFilterId === "all"
                ? "bg-[#1E3A5F] dark:bg-[#2B4F7E] border-[#1E3A5F] dark:border-[#60A5FA] text-white"
                : "bg-white dark:bg-[#1E293B] border-[#CBD5E1] dark:border-[#334155] text-[#1E293B] dark:text-[#CBD5E1] hover:border-[#8B1E24] dark:hover:border-[#60A5FA]"
            }`}
          >
            Todos con registro ({challengesWithActivity.length})
          </button>
          {challengesWithActivity.map((ch) => (
            <button
              key={ch.id}
              type="button"
              onClick={() => setSelectedFilterId(ch.id)}
              className={`px-3 py-1.5 text-xs font-medium rounded-lg border transition-colors ${
                selectedFilterId === ch.id
                  ? "bg-[#1E3A5F] dark:bg-[#2B4F7E] border-[#1E3A5F] dark:border-[#60A5FA] text-white"
                  : "bg-white dark:bg-[#1E293B] border-[#CBD5E1] dark:border-[#334155] text-[#1E293B] dark:text-[#CBD5E1] hover:border-[#8B1E24] dark:hover:border-[#60A5FA]"
              }`}
            >
              {ch.orderLabel}
            </button>
          ))}
        </div>
      )}

      {/* Listado cronológico de retos y versiones */}
      {visibleChallenges.length === 0 ? (
        <section className="bg-white dark:bg-[#1E293B] border border-[#CBD5E1] dark:border-[#334155] rounded-xl p-10 text-center space-y-3">
          <h2 className="text-lg font-semibold text-[#1E3A5F] dark:text-[#F1F5F9]">
            Aún no hay iteraciones registradas en tu bitácora
          </h2>
          <p className="text-sm text-slate-600 dark:text-[#CBD5E1] max-w-md mx-auto">
            Abre un reto desde el Banco de Retos, redacta los bloques del
            prompt, prueba la respuesta y guarda tu primera evaluación crítica.
          </p>
          <div className="pt-2">
            <button
              type="button"
              onClick={() => onOpenChallenge(state.activeChallengeId)}
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-[#1E3A5F] dark:bg-[#2B4F7E] hover:bg-[#152B47] dark:hover:bg-[#356199] text-white text-sm font-semibold rounded-lg transition-colors"
            >
              <span>Ir a Mesa de Trabajo</span>
              <ArrowRight className="w-4 h-4" aria-hidden="true" />
            </button>
          </div>
        </section>
      ) : (
        <div className="space-y-6">
          {visibleChallenges.map((ch) => {
            const progress = state.challenges[ch.id];
            const status = getChallengeStatus(progress);
            const title =
              ch.esLibre && progress?.customMeta?.title
                ? progress.customMeta.title
                : ch.title;

            return (
              <section
                key={ch.id}
                className="bg-white dark:bg-[#1E293B] border border-[#CBD5E1] dark:border-[#334155] rounded-xl p-6 space-y-5"
              >
                <div className="flex flex-wrap items-start justify-between gap-4 pb-4 border-b border-[#E2E8F0] dark:border-[#334155]">
                  <div>
                    <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
                      <span>{ch.orderLabel}</span>
                      <span aria-hidden="true">·</span>
                      <span>{ch.level}</span>
                      <span aria-hidden="true">·</span>
                      <span
                        className={`inline-flex items-center gap-1 font-semibold ${
                          status === "Completado"
                            ? "text-emerald-700 dark:text-emerald-400"
                            : "text-amber-700 dark:text-amber-400"
                        }`}
                      >
                        {status === "Completado" ? (
                          <CheckCircle2 className="w-3.5 h-3.5" aria-hidden="true" />
                        ) : (
                          <Clock className="w-3.5 h-3.5" aria-hidden="true" />
                        )}
                        <span>{status}</span>
                      </span>
                    </div>
                    <h2 className="mt-1 text-lg font-bold text-[#1E3A5F] dark:text-[#F1F5F9]">
                      {title}
                    </h2>
                  </div>

                  <button
                    type="button"
                    onClick={() => onOpenChallenge(ch.id)}
                    className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-[#1E3A5F] dark:text-[#F1F5F9] bg-[#F5F7FA] dark:bg-[#0F172A] hover:bg-slate-200/70 dark:hover:bg-[#334155]/60 border border-[#CBD5E1] dark:border-[#334155] rounded-lg transition-colors whitespace-nowrap shrink-0"
                  >
                    <span>Abrir en Mesa</span>
                    <ArrowRight className="w-3.5 h-3.5" aria-hidden="true" />
                  </button>
                </div>

                {/* Versiones registradas */}
                <div className="space-y-4">
                  {progress.versions.map((ver) => (
                    <article
                      key={ver.id}
                      className="bg-[#F5F7FA] dark:bg-[#0F172A] border border-[#E2E8F0] dark:border-[#334155] rounded-lg p-4 space-y-3"
                    >
                      <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
                        <span className="font-mono font-semibold text-[#1E3A5F] dark:text-[#60A5FA] tabular-nums">
                          Versión {ver.versionNumber}
                        </span>
                        <span className="text-slate-500 dark:text-slate-400">
                          {formatDateTimeEs(ver.createdAt)}
                          <span aria-hidden="true" className="mx-1.5">
                            ·
                          </span>
                          {ver.sourceMode === "live_gemini"
                            ? "IA en vivo"
                            : "Pegado manual"}
                        </span>
                      </div>

                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                        <div>
                          <p className="text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">
                            Prompt ensamblado
                          </p>
                          <pre className="font-mono text-xs text-[#1E293B] dark:text-[#E2E8F0] bg-white dark:bg-[#1E293B] border border-[#E2E8F0] dark:border-[#334155] rounded p-3 whitespace-pre-wrap max-h-48 overflow-y-auto">
                            {ver.assembledPrompt}
                          </pre>
                        </div>

                        <div className="space-y-3">
                          <div>
                            <p className="text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">
                              Respuesta analizada
                            </p>
                            <div className="text-xs text-slate-700 dark:text-[#CBD5E1] bg-white dark:bg-[#1E293B] border border-[#E2E8F0] dark:border-[#334155] rounded p-3 whitespace-pre-wrap max-h-28 overflow-y-auto">
                              {ver.aiResponse}
                            </div>
                          </div>

                          <div className="bg-white dark:bg-[#1E293B] border border-[#E2E8F0] dark:border-[#334155] rounded p-3 space-y-1.5">
                            <p className="text-xs font-semibold text-[#1E3A5F] dark:text-[#60A5FA]">
                              Diagnóstico y reflexión metacognitiva
                            </p>
                            <p className="text-xs text-slate-500 dark:text-slate-400">
                              Restricciones:{" "}
                              <span className="font-medium text-slate-800 dark:text-[#F1F5F9]">
                                {ver.evaluation.cumplioRestricciones || "N/A"}
                              </span>
                              <span aria-hidden="true" className="mx-1.5">
                                ·
                              </span>
                              Alucinaciones/sesgos:{" "}
                              <span className="font-medium text-slate-800 dark:text-[#F1F5F9]">
                                {ver.evaluation.alucinacionesOSesgos || "N/A"}
                              </span>
                              <span aria-hidden="true" className="mx-1.5">
                                ·
                              </span>
                              Nivel/formato:{" "}
                              <span className="font-medium text-slate-800 dark:text-[#F1F5F9]">
                                {ver.evaluation.nivelYFormatoAdecuados || "N/A"}
                              </span>
                            </p>
                            <p className="text-xs text-[#1E293B] dark:text-[#CBD5E1] leading-relaxed">
                              {ver.evaluation.notasReflexion}
                            </p>
                          </div>
                        </div>
                      </div>
                    </article>
                  ))}
                </div>
              </section>
            );
          })}
        </div>
      )}
    </div>
  );
}
