import { useState } from "react";
import {
  ArrowRight,
  CheckCircle2,
  Clock,
  Download,
  Lock,
  RotateCcw,
} from "lucide-react";
import { CHALLENGES } from "../data/challenges";
import { getChallengeStatus } from "../hooks/useLabStorage";
import { LabStorageState } from "../types/lab";
import {
  canExportPortfolioPdf,
  downloadPortfolioPdf,
} from "../utils/portfolioPdf";
import { STRUCTURED_CHALLENGE_IDS } from "../utils/progression";
import {
  formatDateTimeEs,
  formatEvaluationAnswer,
} from "../utils/promptBuilder";
import { AiResponseRenderer } from "./workbench/AiResponseRenderer";

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
  const [pdfFeedback, setPdfFeedback] = useState<{
    filename: string;
    pageCount: number;
  } | null>(null);
  const [pdfError, setPdfError] = useState(false);
  const [confirmReset, setConfirmReset] = useState(false);

  const completedCount = CHALLENGES.filter(
    (c) => getChallengeStatus(state.challenges[c.id]) === "Completado"
  ).length;
  const iteratingCount = CHALLENGES.filter(
    (c) => getChallengeStatus(state.challenges[c.id]) === "En progreso"
  ).length;
  const totalVersions = CHALLENGES.reduce(
    (acc, c) => acc + (state.challenges[c.id]?.versions.length ?? 0),
    0
  );

  const mandatoryCompletedCount = STRUCTURED_CHALLENGE_IDS.filter((id) =>
    Boolean(state.challenges[id]?.completed)
  ).length;
  const canDownloadPdf = canExportPortfolioPdf(state.challenges);

  const challengesWithActivity = CHALLENGES.filter((c) => {
    const p = state.challenges[c.id];
    return p && (p.versions.length > 0 || p.completed || Boolean(p.activityResult));
  });

  const visibleChallenges =
    selectedFilterId === "all"
      ? challengesWithActivity
      : challengesWithActivity.filter((c) => c.id === selectedFilterId);

  const handleDownloadPdf = () => {
    if (!canDownloadPdf) return;
    setPdfError(false);
    try {
      const result = downloadPortfolioPdf(state, CHALLENGES);
      setPdfFeedback({
        filename: result.filename,
        pageCount: result.pageCount,
      });
    } catch {
      setPdfFeedback(null);
      setPdfError(true);
    }
  };

  return (
    <div className="space-y-8">
      {/* Cabecera y acciones de exportación */}
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-[#1E3A5F] dark:text-[#F1F5F9]">
            Bitácora de aprendizaje
          </h1>
          <p className="mt-1.5 text-sm text-slate-600 dark:text-[#CBD5E1] max-w-2xl">
            Tu historial personal de aprendizaje y pruebas: resultados de los
            seis retos obligatorios y registros opcionales del Reto Libre.
          </p>
          {!canDownloadPdf ? (
            <p className="mt-2 text-xs font-medium text-amber-800 dark:text-amber-300">
              Completa los 6 retos obligatorios para habilitar la descarga de tu
              bitácora en PDF ({mandatoryCompletedCount} de 6 completados). El
              Reto Libre es opcional.
            </p>
          ) : (
            <p className="mt-2 text-xs font-medium text-emerald-700 dark:text-emerald-400">
              Secuencia obligatoria completada (6 de 6). Tu bitácora PDF A4
              está lista para descargar.
            </p>
          )}
          {pdfFeedback && (
            <p className="mt-1.5 text-xs text-emerald-700 dark:text-emerald-400">
              Descarga iniciada: <strong>{pdfFeedback.filename}</strong> (
              {pdfFeedback.pageCount} páginas, formato A4).
            </p>
          )}
          {pdfError && (
            <p className="mt-1.5 text-xs text-red-700 dark:text-red-300">
              No se pudo generar el documento PDF. Intenta nuevamente.
            </p>
          )}
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            type="button"
            onClick={handleDownloadPdf}
            disabled={!canDownloadPdf}
            title={
              canDownloadPdf
                ? "Descargar tu bitácora completa en formato PDF A4"
                : `Completa los 6 retos obligatorios para habilitar la descarga (${mandatoryCompletedCount} de 6)`
            }
            className={`inline-flex items-center gap-2 px-4 py-2 text-xs font-bold tracking-wide rounded-lg transition-colors whitespace-nowrap shrink-0 ${
              canDownloadPdf
                ? "bg-[#1E3A5F] dark:bg-[#2B4F7E] hover:bg-[#152B47] dark:hover:bg-[#356199] text-white cursor-pointer shadow-sm"
                : "bg-slate-200 dark:bg-slate-800 text-slate-500 dark:text-slate-400 border border-[#CBD5E1] dark:border-[#334155] cursor-not-allowed"
            }`}
          >
            {canDownloadPdf ? (
              <Download className="w-4 h-4" aria-hidden="true" />
            ) : (
              <Lock className="w-4 h-4" aria-hidden="true" />
            )}
            <span>DESCARGAR MI BITÁCORA PDF</span>
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
                  setPdfFeedback(null);
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
      <section className="bg-white dark:bg-[#1E293B] border border-[#CBD5E1] dark:border-[#334155] border-t-4 border-t-[#1E3A5F] dark:border-t-[#60A5FA] rounded-xl grid grid-cols-2 lg:grid-cols-4 divide-y lg:divide-y-0 lg:divide-x divide-[#E2E8F0] dark:divide-[#334155]">
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
            Retos obligatorios
          </p>
          <p className="mt-1 text-2xl font-bold text-[#1E3A5F] dark:text-[#60A5FA] tabular-nums">
            {mandatoryCompletedCount}{" "}
            <span className="text-sm font-normal text-slate-500 dark:text-slate-400">
              / 6
            </span>
          </p>
        </div>
        <div className="p-5">
          <p className="text-xs font-medium text-slate-500 dark:text-slate-400">
            Retos en práctica
          </p>
          <p className="mt-1 text-2xl font-bold text-[#8B1E24] dark:text-[#F87171] tabular-nums">
            {iteratingCount}
          </p>
        </div>
        <div className="p-5">
          <p className="text-xs font-medium text-slate-500 dark:text-slate-400">
            Total completados ({completedCount}) / Pruebas
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
            Aún no hay registros en tu bitácora
          </h2>
          <p className="text-sm text-slate-600 dark:text-[#CBD5E1] max-w-md mx-auto">
            Abre un reto desde el Banco de Retos, completa la actividad
            correspondiente o experimenta en el Reto Libre para guardar tus
            resultados aquí.
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

                {/* Resultado de actividad evaluada (Retos 1–6) */}
                {progress.activityResult && (
                  <div className="bg-[#F5F7FA] dark:bg-[#0F172A] border border-[#E2E8F0] dark:border-[#334155] rounded-lg p-4 space-y-2 text-xs">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <span className="font-mono font-semibold text-[#1E3A5F] dark:text-[#60A5FA]">
                        Actividad evaluada ·{" "}
                        {progress.activityResult.approved
                          ? "Aprobado"
                          : "En práctica"}
                      </span>
                      <span className="text-slate-500 dark:text-slate-400">
                        {formatDateTimeEs(progress.activityResult.evaluatedAt)}
                      </span>
                    </div>
                    <p className="text-[#0F172A] dark:text-[#F1F5F9]">
                      <strong>Resultado obtenido:</strong>{" "}
                      {progress.activityResult.resultLabel}
                    </p>
                    <p className="text-[#1E293B] dark:text-[#CBD5E1]">
                      <strong>Competencia desarrollada:</strong>{" "}
                      {progress.activityResult.competence}
                    </p>
                    <p className="text-slate-600 dark:text-slate-400">
                      {progress.activityResult.feedbackSummary}
                    </p>
                  </div>
                )}

                {/* Pruebas registradas en la bitácora */}
                <div className="space-y-4">
                  {progress.versions.map((ver) => {
                    const promptUsed =
                      ver.executedPrompt?.trim() || ver.assembledPrompt;
                    const providerBadge = [
                      ver.aiProvider?.trim(),
                      ver.aiModel?.trim(),
                    ]
                      .filter(Boolean)
                      .join(" · ");
                    const ev = ver.evaluation;

                    return (
                      <article
                        key={ver.id}
                        className="bg-[#F5F7FA] dark:bg-[#0F172A] border border-[#E2E8F0] dark:border-[#334155] rounded-lg p-4 space-y-3"
                      >
                        <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
                          <span className="font-mono font-semibold text-[#1E3A5F] dark:text-[#60A5FA] tabular-nums">
                            Prueba {ver.versionNumber}
                          </span>
                          <span className="text-slate-500 dark:text-slate-400">
                            {formatDateTimeEs(ver.createdAt)}
                            <span aria-hidden="true" className="mx-1.5">
                              ·
                            </span>
                            {providerBadge ||
                              (ver.sourceMode === "live_gemini"
                                ? "Prueba directa"
                                : "Prueba externa")}
                          </span>
                        </div>

                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                          <div className="space-y-3">
                            <div>
                              <p className="text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">
                                Instrucción utilizada
                              </p>
                              <pre className="font-mono text-xs text-[#1E293B] dark:text-[#E2E8F0] bg-white dark:bg-[#1E293B] border border-[#E2E8F0] dark:border-[#334155] rounded p-3 whitespace-pre-wrap max-h-56 overflow-y-auto">
                                {promptUsed}
                              </pre>
                            </div>

                            <div className="bg-white dark:bg-[#1E293B] border border-[#E2E8F0] dark:border-[#334155] rounded-lg p-3.5 space-y-2.5 text-xs">
                              <p className="font-semibold text-[#1E3A5F] dark:text-[#60A5FA]">
                                Evaluación de la respuesta
                              </p>
                              <ul className="space-y-1 text-slate-600 dark:text-[#CBD5E1]">
                                <li>
                                  ¿Respondió lo que pediste?:{" "}
                                  <strong className="text-[#0F172A] dark:text-[#F1F5F9]">
                                    {formatEvaluationAnswer(
                                      ev.cumplioRestricciones,
                                      1
                                    )}
                                  </strong>
                                </li>
                                <li>
                                  ¿Fue clara y fácil de entender?:{" "}
                                  <strong className="text-[#0F172A] dark:text-[#F1F5F9]">
                                    {formatEvaluationAnswer(
                                      ev.alucinacionesOSesgos,
                                      2
                                    )}
                                  </strong>
                                </li>
                                <li>
                                  ¿Incluyó lo que necesitabas?:{" "}
                                  <strong className="text-[#0F172A] dark:text-[#F1F5F9]">
                                    {formatEvaluationAnswer(
                                      ev.nivelYFormatoAdecuados,
                                      3
                                    )}
                                  </strong>
                                </li>
                              </ul>

                              {ev.cambiosInstruccion?.trim() && (
                                <div className="pt-2 border-t border-[#E2E8F0] dark:border-[#334155]">
                                  <p className="font-semibold text-[#1E3A5F] dark:text-[#93C5FD]">
                                    ¿Qué cambiaría en mi instrucción?
                                  </p>
                                  <p className="mt-0.5 text-[#1E293B] dark:text-[#CBD5E1] leading-relaxed">
                                    {ev.cambiosInstruccion}
                                  </p>
                                </div>
                              )}

                              {ev.notasReflexion?.trim() && (
                                <div className="pt-2 border-t border-[#E2E8F0] dark:border-[#334155]">
                                  <p className="font-semibold text-[#8B1E24] dark:text-[#FCA5A5]">
                                    ¿Qué aprendí de esta prueba?
                                  </p>
                                  <p className="mt-0.5 text-[#1E293B] dark:text-[#CBD5E1] leading-relaxed">
                                    {ev.notasReflexion}
                                  </p>
                                </div>
                              )}

                              {(ev.aspectosPositivos?.trim() ||
                                ev.erroresOLimitaciones?.trim() ||
                                ev.informacionAVerificar?.trim() ||
                                ev.justificacionModificaciones?.trim()) && (
                                <div className="pt-2 border-t border-[#E2E8F0] dark:border-[#334155] space-y-1 text-slate-600 dark:text-slate-400">
                                  <p className="font-semibold text-slate-500 dark:text-slate-400">
                                    Notas anteriores conservadas
                                  </p>
                                  {ev.aspectosPositivos?.trim() && (
                                    <p>
                                      <strong>Aspectos positivos:</strong>{" "}
                                      {ev.aspectosPositivos}
                                    </p>
                                  )}
                                  {ev.erroresOLimitaciones?.trim() && (
                                    <p>
                                      <strong>Errores o limitaciones:</strong>{" "}
                                      {ev.erroresOLimitaciones}
                                    </p>
                                  )}
                                  {ev.informacionAVerificar?.trim() && (
                                    <p>
                                      <strong>Información a verificar:</strong>{" "}
                                      {ev.informacionAVerificar}
                                    </p>
                                  )}
                                  {ev.justificacionModificaciones?.trim() && (
                                    <p>
                                      <strong>Justificación:</strong>{" "}
                                      {ev.justificacionModificaciones}
                                    </p>
                                  )}
                                </div>
                              )}
                            </div>
                          </div>

                          <AiResponseRenderer
                            title="Respuesta generada por la IA"
                            responseText={ver.aiResponse}
                            provider={
                              ver.aiProvider ||
                              (ver.sourceMode === "live_gemini"
                                ? "Google Gemini"
                                : "Prueba externa")
                            }
                            model={ver.aiModel}
                            sourceMode={ver.sourceMode}
                            compact
                            maxHeightClass="max-h-72"
                          />
                        </div>
                      </article>
                    );
                  })}
                </div>
              </section>
            );
          })}
        </div>
      )}
    </div>
  );
}
