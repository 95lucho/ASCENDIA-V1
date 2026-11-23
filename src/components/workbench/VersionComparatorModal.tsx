import { useEffect, useMemo } from "react";
import { X } from "lucide-react";
import { IterationVersion } from "../../types/lab";
import {
  formatDateTimeEs,
  formatEvaluationAnswer,
} from "../../utils/promptBuilder";
import { AiResponseRenderer } from "./AiResponseRenderer";

interface VersionComparatorModalProps {
  open: boolean;
  versions: IterationVersion[];
  currentDraft?: IterationVersion | null;
  leftIdx: number;
  rightIdx: number;
  onChangeLeftIdx: (idx: number) => void;
  onChangeRightIdx: (idx: number) => void;
  onClose: () => void;
}

const COMPARISON_DIMENSIONS = [
  {
    name: "Precisión",
    detail: "Exactitud conceptual, terminológica y ausencia de datos inventados.",
  },
  {
    name: "Pertinencia",
    detail: "Adecuación al nivel universitario y contexto de Ciencias de la Educación.",
  },
  {
    name: "Coherencia",
    detail: "Articulación lógica entre objetivos, argumentos y estructura.",
  },
  {
    name: "Cumplimiento de la instrucción",
    detail: "Respeto efectivo al rol, restricciones y formato solicitados.",
  },
  {
    name: "Verificabilidad",
    detail: "Posibilidad de contrastar fuentes, autores o evidencias reales.",
  },
];

export function VersionComparatorModal({
  open,
  versions,
  currentDraft = null,
  leftIdx,
  rightIdx,
  onChangeLeftIdx,
  onChangeRightIdx,
  onClose,
}: VersionComparatorModalProps) {
  useEffect(() => {
    if (!open) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [open, onClose]);

  const comparableEntries = useMemo(() => {
    const entries: { item: IterationVersion; isDraft: boolean }[] = versions.map(
      (v) => ({ item: v, isDraft: false })
    );
    if (currentDraft && currentDraft.aiResponse.trim().length > 0) {
      entries.push({ item: currentDraft, isDraft: true });
    }
    return entries;
  }, [versions, currentDraft]);

  const safeLeftIdx = Math.min(
    Math.max(0, leftIdx),
    Math.max(0, comparableEntries.length - 1)
  );
  const safeRightIdx = Math.min(
    Math.max(0, rightIdx),
    Math.max(0, comparableEntries.length - 1)
  );

  const leftEntry = comparableEntries[safeLeftIdx];
  const rightEntry = comparableEntries[safeRightIdx];

  if (!open || comparableEntries.length < 2 || !leftEntry || !rightEntry) {
    return null;
  }

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Comparador de ejecuciones de prompt"
      className="fixed inset-0 z-50 bg-slate-900/50 dark:bg-black/75 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div
        className="bg-white dark:bg-[#1E293B] border border-[#CBD5E1] dark:border-[#334155] border-t-4 border-t-[#1E3A5F] dark:border-t-[#60A5FA] rounded-xl max-w-6xl w-full max-h-[92vh] flex flex-col overflow-hidden shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Encabezado */}
        <div className="flex items-center justify-between gap-4 px-6 py-4 border-b border-[#E2E8F0] dark:border-[#334155]">
          <div>
            <h3 className="text-lg font-bold text-[#1E3A5F] dark:text-[#F1F5F9]">
              Comparación de ejecuciones (1ª vs 2ª iteración)
            </h3>
            <p className="text-xs text-slate-600 dark:text-[#CBD5E1] mt-0.5">
              Analiza de manera crítica ambas instrucciones y sus respuestas
              reales sin asumir automáticamente que la versión posterior es
              mejor.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Cerrar comparador"
            className="p-2 text-slate-500 dark:text-[#CBD5E1] hover:text-[#1E3A5F] dark:hover:text-[#F1F5F9] rounded-lg hover:bg-[#F5F7FA] dark:hover:bg-[#0F172A]"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Criterios neutrales de análisis */}
        <div className="px-6 py-3 bg-[#F5F7FA] dark:bg-[#0F172A] border-b border-[#E2E8F0] dark:border-[#334155]">
          <p className="text-[11px] font-bold uppercase tracking-wider text-[#8B1E24] dark:text-[#FCA5A5] mb-2">
            Dimensiones de contraste crítico
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-2.5">
            {COMPARISON_DIMENSIONS.map((dim) => (
              <div
                key={dim.name}
                className="bg-white dark:bg-[#1E293B] border border-[#E2E8F0] dark:border-[#334155] rounded-md px-2.5 py-2"
              >
                <p className="text-xs font-semibold text-[#1E3A5F] dark:text-[#93C5FD]">
                  {dim.name}
                </p>
                <p className="text-[11px] text-slate-600 dark:text-[#CBD5E1] leading-snug mt-0.5">
                  {dim.detail}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Columnas comparativas */}
        <div className="p-6 overflow-y-auto grid grid-cols-1 lg:grid-cols-2 gap-6">
          {[
            {
              entry: leftEntry,
              selectedIdx: safeLeftIdx,
              onChangeIdx: onChangeLeftIdx,
              label: "Ejecución A (referencia)",
            },
            {
              entry: rightEntry,
              selectedIdx: safeRightIdx,
              onChangeIdx: onChangeRightIdx,
              label: "Ejecución B (contraste)",
            },
          ].map((col, i) => {
            const ver = col.entry.item;
            const executedText =
              ver.executedPrompt?.trim() || ver.assembledPrompt;
            const ev = ver.evaluation;
            const hasEvaluationOrNotes = Boolean(
              ev.cumplioRestricciones ||
                ev.alucinacionesOSesgos ||
                ev.nivelYFormatoAdecuados ||
                ev.cambiosInstruccion?.trim() ||
                ev.notasReflexion?.trim() ||
                ev.aspectosPositivos?.trim() ||
                ev.erroresOLimitaciones?.trim() ||
                ev.informacionAVerificar?.trim() ||
                ev.justificacionModificaciones?.trim()
            );

            return (
              <div
                key={i}
                className="border border-[#CBD5E1] dark:border-[#334155] rounded-xl p-4 bg-[#F5F7FA] dark:bg-[#0F172A] space-y-4"
              >
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <span className="text-xs font-bold text-[#1E3A5F] dark:text-[#93C5FD]">
                    {col.label}
                  </span>
                  <select
                    aria-label={col.label}
                    value={col.selectedIdx}
                    onChange={(e) => col.onChangeIdx(Number(e.target.value))}
                    className="text-xs font-semibold text-[#1E3A5F] dark:text-[#F1F5F9] bg-white dark:bg-[#1E293B] border border-[#CBD5E1] dark:border-[#334155] rounded-md px-2.5 py-1.5"
                  >
                    {comparableEntries.map((entry, idx) => (
                      <option key={entry.item.id} value={idx}>
                        {entry.isDraft
                          ? `Borrador actual (v${entry.item.versionNumber})`
                          : `Versión ${entry.item.versionNumber} (${formatDateTimeEs(
                              entry.item.createdAt
                            )})`}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <p className="text-xs font-semibold text-[#1E3A5F] dark:text-[#60A5FA] mb-1">
                    Instrucción ejecutada
                  </p>
                  <pre className="font-mono text-xs text-[#1E293B] dark:text-[#E2E8F0] bg-white dark:bg-[#1E293B] border border-[#E2E8F0] dark:border-[#334155] rounded-lg p-3 whitespace-pre-wrap max-h-48 overflow-y-auto">
                    {executedText || "(Sin instrucción registrada)"}
                  </pre>
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
                  maxHeightClass="max-h-64"
                />

                <div className="bg-white dark:bg-[#1E293B] border border-[#E2E8F0] dark:border-[#334155] rounded-lg p-3 space-y-2 text-xs">
                  <p className="font-semibold text-[#1E3A5F] dark:text-[#60A5FA]">
                    Evaluación y aprendizaje
                  </p>
                  {!hasEvaluationOrNotes ? (
                    <p className="text-slate-500 dark:text-slate-400 italic">
                      Sin evaluación registrada aún en esta prueba.
                    </p>
                  ) : (
                    <div className="space-y-1.5 text-slate-700 dark:text-[#CBD5E1]">
                      {(ev.cumplioRestricciones ||
                        ev.alucinacionesOSesgos ||
                        ev.nivelYFormatoAdecuados) && (
                        <ul className="space-y-0.5 text-slate-600 dark:text-[#CBD5E1]">
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
                      )}
                      {ev.cambiosInstruccion?.trim() && (
                        <p>
                          <strong className="text-[#0F172A] dark:text-[#F1F5F9]">
                            ¿Qué cambiaría?:
                          </strong>{" "}
                          {ev.cambiosInstruccion}
                        </p>
                      )}
                      {ev.notasReflexion?.trim() && (
                        <p>
                          <strong className="text-[#8B1E24] dark:text-[#FCA5A5]">
                            ¿Qué aprendí?:
                          </strong>{" "}
                          {ev.notasReflexion}
                        </p>
                      )}
                      {ev.aspectosPositivos?.trim() && (
                        <p>
                          <strong className="text-[#0F172A] dark:text-[#F1F5F9]">
                            Aspectos positivos:
                          </strong>{" "}
                          {ev.aspectosPositivos}
                        </p>
                      )}
                      {ev.erroresOLimitaciones?.trim() && (
                        <p>
                          <strong className="text-[#0F172A] dark:text-[#F1F5F9]">
                            Errores / limitaciones:
                          </strong>{" "}
                          {ev.erroresOLimitaciones}
                        </p>
                      )}
                      {ev.informacionAVerificar?.trim() && (
                        <p>
                          <strong className="text-[#0F172A] dark:text-[#F1F5F9]">
                            Información a verificar:
                          </strong>{" "}
                          {ev.informacionAVerificar}
                        </p>
                      )}
                      {ev.justificacionModificaciones?.trim() && (
                        <p>
                          <strong className="text-[#0F172A] dark:text-[#F1F5F9]">
                            Justificación:
                          </strong>{" "}
                          {ev.justificacionModificaciones}
                        </p>
                      )}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
