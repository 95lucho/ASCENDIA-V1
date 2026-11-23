import { useEffect, useMemo, useState } from "react";
import {
  AlertCircle,
  AlertTriangle,
  ArrowLeft,
  Check,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Columns2,
  Copy,
  FileCheck2,
  Loader2,
  Play,
  RotateCcw,
  Save,
  X,
} from "lucide-react";
import { CHALLENGES } from "../data/challenges";
import { getChallengeStatus } from "../hooks/useLabStorage";
import {
  ChallengeDefinition,
  ChallengeProgress,
  ComplianceRating,
  CriticalEvaluation,
  CustomChallengeMeta,
  FitRating,
  HallucinationRating,
  IterationVersion,
  PromptBlocks,
} from "../types/lab";
import {
  assemblePrompt,
  evaluateCompleteness,
  formatDateTimeEs,
} from "../utils/promptBuilder";

interface WorkbenchViewProps {
  challenge: ChallengeDefinition;
  progress: ChallengeProgress;
  onSelectChallenge: (id: string) => void;
  onBackToBank: () => void;
  onUpdateBlocks: (blocks: PromptBlocks) => void;
  onUpdateResponse: (
    response: string,
    sourceMode?: "live_gemini" | "manual"
  ) => void;
  onUpdateEvaluation: (evaluation: CriticalEvaluation) => void;
  onUpdateCustomMeta: (meta: CustomChallengeMeta) => void;
  onResetBlocks: () => void;
  onSaveIteration: () => IterationVersion | null;
  onCompleteChallenge: (saveCurrentDraft: boolean) => void;
  onReopenChallenge: () => void;
  onLoadVersion: (version: IterationVersion) => void;
  onGoToPortfolio: () => void;
}

const BLOCK_FIELDS: {
  key: keyof PromptBlocks;
  number: string;
  label: string;
  essential: boolean;
}[] = [
  {
    key: "rol",
    number: "01",
    label: "Rol / Perspectiva de la IA",
    essential: false,
  },
  {
    key: "contexto",
    number: "02",
    label: "Propósito y Contexto Académico",
    essential: true,
  },
  {
    key: "tarea",
    number: "03",
    label: "Tarea Específica",
    essential: true,
  },
  {
    key: "restricciones",
    number: "04",
    label: "Restricciones y Límites",
    essential: true,
  },
  {
    key: "formato",
    number: "05",
    label: "Formato de Salida Esperado",
    essential: false,
  },
];

export function WorkbenchView({
  challenge,
  progress,
  onSelectChallenge,
  onBackToBank,
  onUpdateBlocks,
  onUpdateResponse,
  onUpdateEvaluation,
  onUpdateCustomMeta,
  onResetBlocks,
  onSaveIteration,
  onCompleteChallenge,
  onReopenChallenge,
  onLoadVersion,
  onGoToPortfolio,
}: WorkbenchViewProps) {
  const [showCriteria, setShowCriteria] = useState(false);
  const [copiedPrompt, setCopiedPrompt] = useState(false);
  const [isTestingLive, setIsTestingLive] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);
  const [geminiAvailable, setGeminiAvailable] = useState<boolean | null>(null);
  const [validationError, setValidationError] = useState<string | null>(null);
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);
  const [showCompareModal, setShowCompareModal] = useState(false);
  const [compareLeftIdx, setCompareLeftIdx] = useState(0);
  const [compareRightIdx, setCompareRightIdx] = useState(1);

  useEffect(() => {
    let cancelled = false;
    fetch("/api/health")
      .then((res) => (res.ok ? res.json() : null))
      .then((data: { geminiAvailable?: boolean } | null) => {
        if (!cancelled && data && typeof data.geminiAvailable === "boolean") {
          setGeminiAvailable(data.geminiAvailable);
        }
      })
      .catch(() => {
        if (!cancelled) setGeminiAvailable(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  // Limpiar mensajes transitorios al cambiar de reto
  useEffect(() => {
    setApiError(null);
    setValidationError(null);
    setActionSuccess(null);
    setShowCompareModal(false);
  }, [challenge.id]);

  const currentVersionNumber = progress.versions.length + 1;
  const status = getChallengeStatus(progress);
  const assembledPrompt = useMemo(
    () => assemblePrompt(progress.draftBlocks),
    [progress.draftBlocks]
  );
  const completeness = useMemo(
    () => evaluateCompleteness(progress.draftBlocks),
    [progress.draftBlocks]
  );

  const verifiedCriteriaCount =
    progress.draftEvaluation.criteriosVerificados.filter(Boolean).length;

  const displayTitle =
    challenge.esLibre && progress.customMeta?.title
      ? progress.customMeta.title
      : challenge.title;
  const displayObjetivo =
    challenge.esLibre && progress.customMeta?.objetivo
      ? progress.customMeta.objetivo
      : challenge.objetivo;

  const handleBlockChange = (key: keyof PromptBlocks, value: string) => {
    setValidationError(null);
    setActionSuccess(null);
    onUpdateBlocks({
      ...progress.draftBlocks,
      [key]: value,
    });
  };

  const handleCopyPrompt = async () => {
    if (!assembledPrompt.trim()) return;
    try {
      await navigator.clipboard.writeText(assembledPrompt);
      setCopiedPrompt(true);
      setTimeout(() => setCopiedPrompt(false), 2000);
    } catch {
      setCopiedPrompt(false);
    }
  };

  const handleTestLive = async () => {
    if (!assembledPrompt.trim()) {
      setApiError(
        "Completa al menos un bloque del prompt antes de enviarlo a prueba."
      );
      return;
    }

    setIsTestingLive(true);
    setApiError(null);
    setActionSuccess(null);

    try {
      const response = await fetch("/api/gemini/test-prompt", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt: assembledPrompt,
          challengeTitle: displayTitle,
          version: currentVersionNumber,
        }),
      });
      const data = (await response.json()) as { text?: string; error?: string };

      if (!response.ok || !data.text) {
        setApiError(
          data.error ||
            "No fue posible obtener respuesta en vivo. Puedes pegar manualmente la respuesta de otra IA abajo."
        );
        return;
      }

      onUpdateResponse(data.text, "live_gemini");
    } catch {
      setApiError(
        "Error de conexión con el servidor. Puedes continuar en modo offline pegando una respuesta externa en el cuadro inferior."
      );
    } finally {
      setIsTestingLive(false);
    }
  };

  const validateEvaluationForm = (requireAllCriteria: boolean): string | null => {
    if (!assembledPrompt.trim()) {
      return "Debes redactar al menos los bloques esenciales del prompt en la columna izquierda.";
    }
    if (!progress.draftResponse.trim()) {
      return "Debes probar el prompt en vivo o pegar la respuesta obtenida de la IA antes de registrar la evaluación.";
    }
    const ev = progress.draftEvaluation;
    if (
      !ev.cumplioRestricciones ||
      !ev.alucinacionesOSesgos ||
      !ev.nivelYFormatoAdecuados
    ) {
      return "Responde las 3 preguntas de diagnóstico crítico sobre la salida obtenida.";
    }
    if (ev.notasReflexion.trim().length < 10) {
      return "Escribe una reflexión en la bitácora (mínimo 10 caracteres) indicando qué hallaste o qué ajustarás.";
    }
    if (requireAllCriteria && !ev.criteriosVerificados.every(Boolean)) {
      return "Para marcar el reto como completado, verifica y marca los 3 criterios de evaluación del reto.";
    }
    return null;
  };

  const handleSaveIteration = () => {
    const err = validateEvaluationForm(false);
    if (err) {
      setValidationError(err);
      return;
    }
    setValidationError(null);
    const saved = onSaveIteration();
    if (saved) {
      setActionSuccess(
        `Versión ${saved.versionNumber} guardada en bitácora. Ahora estás refinando la Versión ${
          saved.versionNumber + 1
        }.`
      );
    }
  };

  const handleMarkComplete = () => {
    const hasSavedVersion = progress.versions.length > 0;
    const hasCurrentDraft =
      assembledPrompt.trim().length > 0 &&
      progress.draftResponse.trim().length > 0;

    if (hasCurrentDraft) {
      const err = validateEvaluationForm(true);
      if (err) {
        setValidationError(err);
        return;
      }
      setValidationError(null);
      onCompleteChallenge(true);
      setActionSuccess("Reto verificado y marcado como Completado.");
      return;
    }

    if (hasSavedVersion) {
      if (!progress.draftEvaluation.criteriosVerificados.every(Boolean)) {
        setValidationError(
          "Verifica y marca los 3 criterios de evaluación antes de completar el reto."
        );
        return;
      }
      setValidationError(null);
      onCompleteChallenge(false);
      setActionSuccess("Reto marcado como Completado.");
      return;
    }

    setValidationError(
      "Completa al menos una iteración con respuesta y evaluación crítica antes de cerrar el reto."
    );
  };

  const openComparator = () => {
    if (progress.versions.length >= 2) {
      setCompareLeftIdx(0);
      setCompareRightIdx(progress.versions.length - 1);
      setShowCompareModal(true);
    }
  };

  const updateEvalField = <K extends keyof CriticalEvaluation>(
    field: K,
    value: CriticalEvaluation[K]
  ) => {
    setValidationError(null);
    onUpdateEvaluation({
      ...progress.draftEvaluation,
      [field]: value,
    });
  };

  const toggleCriterion = (index: number) => {
    setValidationError(null);
    const next = [...progress.draftEvaluation.criteriosVerificados];
    next[index] = !next[index];
    updateEvalField("criteriosVerificados", next);
  };

  const leftCompareVer = progress.versions[compareLeftIdx];
  const rightCompareVer = progress.versions[compareRightIdx];

  return (
    <div className="space-y-6">
      {/* Cabecera del reto activo */}
      <section className="bg-white dark:bg-[#1E293B] border border-[#CBD5E1] dark:border-[#334155] rounded-xl p-5 sm:p-6 transition-colors">
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
              onChange={(e) => onSelectChallenge(e.target.value)}
              className="text-xs font-medium text-[#1E3A5F] dark:text-[#F1F5F9] bg-[#F5F7FA] dark:bg-[#0F172A] border border-[#CBD5E1] dark:border-[#334155] rounded-md px-2.5 py-1.5 focus:outline-none focus:border-[#1E3A5F] dark:focus:border-[#60A5FA] max-w-full sm:max-w-md"
            >
              {CHALLENGES.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.orderLabel} · {c.level} — {c.title}
                </option>
              ))}
            </select>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <span
              className={`inline-flex items-center gap-1.5 text-xs font-semibold ${
                status === "Completado"
                  ? "text-emerald-700 dark:text-emerald-400"
                  : status === "En iteración"
                  ? "text-amber-700 dark:text-amber-400"
                  : "text-slate-500 dark:text-slate-400"
              }`}
            >
              {status === "Completado" && (
                <CheckCircle2 className="w-4 h-4" aria-hidden="true" />
              )}
              <span>Estado: {status}</span>
            </span>

            {progress.versions.length >= 2 && (
              <button
                type="button"
                onClick={openComparator}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-[#1E3A5F] dark:text-[#F1F5F9] bg-[#F5F7FA] dark:bg-[#0F172A] hover:bg-slate-200/70 dark:hover:bg-[#334155]/60 border border-[#CBD5E1] dark:border-[#334155] rounded-lg transition-colors whitespace-nowrap shrink-0"
              >
                <Columns2 className="w-3.5 h-3.5" aria-hidden="true" />
                <span className="tabular-nums">
                  Comparar versiones ({progress.versions.length})
                </span>
              </button>
            )}

            <button
              type="button"
              onClick={() => setShowCriteria((v) => !v)}
              aria-expanded={showCriteria}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-[#1E3A5F] dark:text-[#F1F5F9] bg-white dark:bg-[#0F172A] hover:bg-[#F5F7FA] dark:hover:bg-[#334155]/60 border border-[#CBD5E1] dark:border-[#334155] rounded-lg transition-colors whitespace-nowrap shrink-0"
            >
              <span className="tabular-nums">
                Criterios de evaluación ({verifiedCriteriaCount}/
                {challenge.criterios.length})
              </span>
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
                  Bloques clave:
                </span>{" "}
                {challenge.bloquesClave.join(" · ")}
              </p>
            </div>
          </div>
        )}
      </section>

      {/* Mesa de trabajo en 2 columnas equilibradas */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* COLUMNA IZQUIERDA: Constructor Guiado por Bloques */}
        <section className="lg:col-span-6 bg-white dark:bg-[#1E293B] border border-[#CBD5E1] dark:border-[#334155] rounded-xl p-5 sm:p-6 space-y-5 transition-colors">
          <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-[#E2E8F0] dark:border-[#334155]">
            <div>
              <div className="flex items-center gap-2.5">
                <h2 className="text-lg font-bold text-[#1E3A5F] dark:text-[#F1F5F9]">
                  Constructor Guiado por Bloques
                </h2>
                <span className="font-mono text-xs font-semibold text-[#8B1E24] dark:text-[#F87171] tabular-nums">
                  Versión {currentVersionNumber}
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Redacta cada dimensión por separado para evitar instrucciones
                ambiguas.
              </p>
            </div>

            <div className="flex items-center gap-2">
              {progress.versions.length > 0 && (
                <select
                  aria-label="Cargar una versión guardada"
                  defaultValue=""
                  onChange={(e) => {
                    const idx = Number(e.target.value);
                    if (!Number.isNaN(idx) && progress.versions[idx]) {
                      onLoadVersion(progress.versions[idx]);
                    }
                    e.target.value = "";
                  }}
                  className="text-xs text-slate-700 dark:text-[#F1F5F9] bg-[#F5F7FA] dark:bg-[#0F172A] border border-[#CBD5E1] dark:border-[#334155] rounded-md px-2 py-1.5 focus:outline-none focus:border-[#1E3A5F] dark:focus:border-[#60A5FA]"
                >
                  <option value="" disabled>
                    Cargar v1–v{progress.versions.length}...
                  </option>
                  {progress.versions.map((v, idx) => (
                    <option key={v.id} value={idx}>
                      Versión {v.versionNumber}
                    </option>
                  ))}
                </select>
              )}
              <button
                type="button"
                onClick={onResetBlocks}
                className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium text-slate-600 dark:text-[#CBD5E1] hover:text-[#1E3A5F] dark:hover:text-[#F1F5F9] border border-[#CBD5E1] dark:border-[#334155] rounded-md hover:bg-[#F5F7FA] dark:hover:bg-[#0F172A] transition-colors whitespace-nowrap shrink-0"
              >
                <RotateCcw className="w-3.5 h-3.5" aria-hidden="true" />
                <span>Limpiar</span>
              </button>
            </div>
          </div>

          {/* 5 Campos de texto estructurados */}
          <div className="space-y-4">
            {BLOCK_FIELDS.map((field) => (
              <div key={field.key}>
                <div className="flex items-baseline justify-between gap-2 mb-1.5">
                  <label
                    htmlFor={`block-${field.key}`}
                    className="text-sm font-semibold text-[#1E3A5F] dark:text-[#60A5FA]"
                  >
                    <span className="font-mono text-xs text-[#8B1E24] dark:text-[#F87171] mr-1.5 tabular-nums">
                      {field.number}.
                    </span>
                    {field.label}
                  </label>
                  <span className="text-[11px] text-slate-500 dark:text-slate-400">
                    {field.essential ? "Esencial" : "Recomendado"}
                  </span>
                </div>
                <textarea
                  id={`block-${field.key}`}
                  rows={field.key === "tarea" ? 3 : 2}
                  value={progress.draftBlocks[field.key]}
                  onChange={(e) => handleBlockChange(field.key, e.target.value)}
                  placeholder={challenge.placeholders[field.key]}
                  className="w-full px-3.5 py-2.5 text-sm text-[#0F172A] dark:text-[#F1F5F9] bg-[#F5F7FA] dark:bg-[#0F172A] border border-[#CBD5E1] dark:border-[#334155] rounded-lg placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:bg-white dark:focus:bg-[#0F172A] focus:border-[#1E3A5F] dark:focus:border-[#60A5FA] focus:outline-none transition-colors resize-y"
                />
              </div>
            ))}
          </div>

          {/* Semáforo de completitud estructural */}
          <div
            className={`rounded-lg border p-4 ${
              completeness.state === "completo"
                ? "bg-emerald-50 dark:bg-emerald-950/50 border-emerald-200 dark:border-emerald-800 text-emerald-950 dark:text-emerald-100"
                : completeness.state === "parcial"
                ? "bg-amber-50 dark:bg-amber-950/50 border-amber-200 dark:border-amber-800 text-amber-950 dark:text-amber-100"
                : "bg-red-50 dark:bg-red-950/50 border-red-200 dark:border-red-800 text-red-950 dark:text-red-100"
            }`}
          >
            <div className="flex items-center justify-between gap-2 mb-2">
              <div className="flex items-center gap-2 text-xs font-semibold">
                {completeness.state === "completo" ? (
                  <CheckCircle2
                    className="w-4 h-4 text-emerald-700 dark:text-emerald-400 shrink-0"
                    aria-hidden="true"
                  />
                ) : completeness.state === "parcial" ? (
                  <AlertTriangle
                    className="w-4 h-4 text-amber-700 dark:text-amber-400 shrink-0"
                    aria-hidden="true"
                  />
                ) : (
                  <AlertCircle
                    className="w-4 h-4 text-red-700 dark:text-red-400 shrink-0"
                    aria-hidden="true"
                  />
                )}
                <span>Semáforo estructural: {completeness.label}</span>
              </div>
              <span className="font-mono text-xs font-semibold tabular-nums">
                {completeness.filledCount}/5 bloques
              </span>
            </div>

            {/* Barra segmentada */}
            <div className="grid grid-cols-5 gap-1.5 mb-2" aria-hidden="true">
              {[0, 1, 2, 3, 4].map((idx) => {
                const filled = idx < completeness.filledCount;
                const barColor =
                  completeness.state === "completo"
                    ? "bg-emerald-600 dark:bg-emerald-400"
                    : completeness.state === "parcial"
                    ? "bg-amber-500 dark:bg-amber-400"
                    : "bg-red-500 dark:bg-red-400";
                return (
                  <div
                    key={idx}
                    className={`h-1.5 rounded-full ${
                      filled ? barColor : "bg-black/10 dark:bg-white/15"
                    }`}
                  />
                );
              })}
            </div>

            <p className="text-xs leading-relaxed">{completeness.detail}</p>
          </div>

          {/* Vista previa del Prompt Ensamblado */}
          <div className="pt-2 border-t border-[#E2E8F0] dark:border-[#334155]">
            <div className="flex items-center justify-between gap-2 mb-2">
              <h3 className="text-sm font-semibold text-[#1E3A5F] dark:text-[#F1F5F9]">
                Vista previa del Prompt Ensamblado
              </h3>
              <button
                type="button"
                onClick={handleCopyPrompt}
                disabled={!assembledPrompt.trim()}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-md border border-[#CBD5E1] dark:border-[#334155] bg-white dark:bg-[#0F172A] hover:bg-[#F5F7FA] dark:hover:bg-[#334155]/60 text-[#1E3A5F] dark:text-[#F1F5F9] disabled:opacity-40 disabled:cursor-not-allowed transition-colors whitespace-nowrap shrink-0"
              >
                {copiedPrompt ? (
                  <>
                    <Check
                      className="w-3.5 h-3.5 text-emerald-700 dark:text-emerald-400"
                      aria-hidden="true"
                    />
                    <span className="text-emerald-700 dark:text-emerald-400">
                      Copiado
                    </span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" aria-hidden="true" />
                    <span>Copiar Prompt</span>
                  </>
                )}
              </button>
            </div>

            <div className="bg-[#F5F7FA] dark:bg-[#0F172A] border border-[#E2E8F0] dark:border-[#334155] rounded-lg p-4 max-h-64 overflow-y-auto">
              {assembledPrompt ? (
                <pre className="font-mono text-xs text-[#1E293B] dark:text-[#E2E8F0] whitespace-pre-wrap leading-relaxed">
                  {assembledPrompt}
                </pre>
              ) : (
                <p className="text-xs text-slate-400 dark:text-slate-500 italic">
                  El prompt ensamblado aparecerá aquí automáticamente conforme
                  completes los bloques superiores.
                </p>
              )}
            </div>
          </div>
        </section>

        {/* COLUMNA DERECHA: Prueba, Diagnóstico Metacognitivo y Verificación */}
        <section className="lg:col-span-6 bg-white dark:bg-[#1E293B] border border-[#CBD5E1] dark:border-[#334155] rounded-xl p-5 sm:p-6 space-y-6 transition-colors">
          {/* Ejecución Dual */}
          <div className="space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-[#E2E8F0] dark:border-[#334155]">
              <div>
                <h2 className="text-lg font-bold text-[#1E3A5F] dark:text-[#F1F5F9]">
                  Prueba y Salida de la IA
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  {geminiAvailable === false
                    ? "Modo manual activo: copia el prompt, pruébalo en tu IA externa y pega el resultado."
                    : "Prueba en vivo con Gemini o pega manualmente la salida de cualquier sistema de IA."}
                </p>
              </div>

              <button
                type="button"
                onClick={handleTestLive}
                disabled={isTestingLive || !assembledPrompt.trim()}
                className="inline-flex items-center gap-2 px-4 py-2 bg-[#8B1E24] dark:bg-[#C93B44] hover:bg-[#70161B] dark:hover:bg-[#B02E36] disabled:bg-slate-300 dark:disabled:bg-slate-700 disabled:text-slate-500 dark:disabled:text-slate-400 disabled:cursor-not-allowed text-white text-xs sm:text-sm font-semibold rounded-lg transition-colors whitespace-nowrap shrink-0 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#1E3A5F] dark:focus-visible:outline-[#60A5FA]"
              >
                {isTestingLive ? (
                  <>
                    <Loader2
                      className="w-4 h-4 animate-spin"
                      aria-hidden="true"
                    />
                    <span>Consultando...</span>
                  </>
                ) : (
                  <>
                    <Play className="w-4 h-4" aria-hidden="true" />
                    <span>Probar con IA en vivo</span>
                  </>
                )}
              </button>
            </div>

            {apiError && (
              <div
                role="alert"
                className="flex items-start gap-2.5 p-3.5 rounded-lg bg-amber-50 dark:bg-amber-950/50 border border-amber-200 dark:border-amber-800 text-amber-950 dark:text-amber-100 text-xs leading-relaxed"
              >
                <AlertTriangle
                  className="w-4 h-4 text-amber-700 dark:text-amber-400 shrink-0 mt-0.5"
                  aria-hidden="true"
                />
                <span>{apiError}</span>
              </div>
            )}

            <div>
              <div className="flex items-center justify-between gap-2 mb-1.5">
                <label
                  htmlFor="ai-response-textarea"
                  className="text-sm font-semibold text-[#1E3A5F] dark:text-[#60A5FA]"
                >
                  Respuesta obtenida de la IA
                </label>
                <div className="flex items-center gap-3 text-xs text-slate-500 dark:text-slate-400">
                  {progress.draftResponse.trim() && (
                    <span>
                      Origen:{" "}
                      {progress.draftSourceMode === "live_gemini"
                        ? "IA en vivo"
                        : "Pegado manual"}
                    </span>
                  )}
                  {progress.draftResponse && (
                    <button
                      type="button"
                      onClick={() => onUpdateResponse("", "manual")}
                      className="text-slate-500 dark:text-slate-400 hover:text-[#1E3A5F] dark:hover:text-[#F1F5F9] underline"
                    >
                      Limpiar
                    </button>
                  )}
                </div>
              </div>
              <textarea
                id="ai-response-textarea"
                rows={7}
                value={progress.draftResponse}
                onChange={(e) => {
                  setValidationError(null);
                  onUpdateResponse(e.target.value, "manual");
                }}
                placeholder="Aquí aparecerá la respuesta de la IA en vivo, o puedes pegar manualmente la respuesta obtenida en otra herramienta de IA para analizarla."
                className="w-full px-3.5 py-2.5 text-sm text-[#0F172A] dark:text-[#F1F5F9] bg-[#F5F7FA] dark:bg-[#0F172A] border border-[#CBD5E1] dark:border-[#334155] rounded-lg placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:bg-white dark:focus:bg-[#0F172A] focus:border-[#1E3A5F] dark:focus:border-[#60A5FA] focus:outline-none transition-colors resize-y leading-relaxed"
              />
            </div>
          </div>

          {/* Panel de Evaluación Crítica y Bitácora (Obligatorio) */}
          <div className="pt-5 border-t border-[#E2E8F0] dark:border-[#334155] space-y-5">
            <div>
              <h2 className="text-lg font-bold text-[#1E3A5F] dark:text-[#F1F5F9]">
                Evaluación Crítica y Bitácora (Obligatorio)
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Audita la salida antes de crear la siguiente versión o cerrar el
                reto.
              </p>
            </div>

            {/* Pregunta 1 */}
            <div className="space-y-2">
              <p className="text-xs font-semibold text-[#0F172A] dark:text-[#F1F5F9]">
                1. ¿Cumplió con las restricciones y el rol asignado?
              </p>
              <div className="flex flex-wrap gap-2">
                {(
                  [
                    { value: "si", label: "Sí, totalmente" },
                    { value: "parcial", label: "Parcialmente" },
                    { value: "no", label: "No cumplió" },
                  ] as { value: ComplianceRating; label: string }[]
                ).map((opt) => {
                  const active =
                    progress.draftEvaluation.cumplioRestricciones === opt.value;
                  return (
                    <button
                      key={opt.value}
                      type="button"
                      onClick={() =>
                        updateEvalField("cumplioRestricciones", opt.value)
                      }
                      className={`px-3 py-1.5 text-xs font-medium rounded-md border transition-colors ${
                        active
                          ? "bg-[#1E3A5F] dark:bg-[#2B4F7E] border-[#1E3A5F] dark:border-[#60A5FA] text-white"
                          : "bg-white dark:bg-[#0F172A] border-[#CBD5E1] dark:border-[#334155] text-[#1E293B] dark:text-[#CBD5E1] hover:border-[#8B1E24] dark:hover:border-[#60A5FA]"
                      }`}
                    >
                      {opt.label}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Pregunta 2 */}
            <div className="space-y-2">
              <p className="text-xs font-semibold text-[#0F172A] dark:text-[#F1F5F9]">
                2. ¿Detectaste alucinaciones, citas inventadas, sesgos o errores
                conceptuales?
              </p>
              <div className="flex flex-wrap gap-2">
                {(
                  [
                    { value: "ninguno", label: "Sin errores detectados" },
                    { value: "menores", label: "Imprecisiones menores" },
                    { value: "graves", label: "Alucinaciones / sesgos graves" },
                  ] as { value: HallucinationRating; label: string }[]
                ).map((opt) => {
                  const active =
                    progress.draftEvaluation.alucinacionesOSesgos === opt.value;
                  return (
                    <button
                      key={opt.value}
                      type="button"
                      onClick={() =>
                        updateEvalField("alucinacionesOSesgos", opt.value)
                      }
                      className={`px-3 py-1.5 text-xs font-medium rounded-md border transition-colors ${
                        active
                          ? "bg-[#1E3A5F] dark:bg-[#2B4F7E] border-[#1E3A5F] dark:border-[#60A5FA] text-white"
                          : "bg-white dark:bg-[#0F172A] border-[#CBD5E1] dark:border-[#334155] text-[#1E293B] dark:text-[#CBD5E1] hover:border-[#8B1E24] dark:hover:border-[#60A5FA]"
                      }`}
                    >
                      {opt.label}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Pregunta 3 */}
            <div className="space-y-2">
              <p className="text-xs font-semibold text-[#0F172A] dark:text-[#F1F5F9]">
                3. ¿El nivel académico y formato de salida son adecuados para tu
                propósito?
              </p>
              <div className="flex flex-wrap gap-2">
                {(
                  [
                    { value: "adecuado", label: "Adecuado al propósito" },
                    { value: "ajustar", label: "Requiere ajuste" },
                  ] as { value: FitRating; label: string }[]
                ).map((opt) => {
                  const active =
                    progress.draftEvaluation.nivelYFormatoAdecuados ===
                    opt.value;
                  return (
                    <button
                      key={opt.value}
                      type="button"
                      onClick={() =>
                        updateEvalField("nivelYFormatoAdecuados", opt.value)
                      }
                      className={`px-3 py-1.5 text-xs font-medium rounded-md border transition-colors ${
                        active
                          ? "bg-[#1E3A5F] dark:bg-[#2B4F7E] border-[#1E3A5F] dark:border-[#60A5FA] text-white"
                          : "bg-white dark:bg-[#0F172A] border-[#CBD5E1] dark:border-[#334155] text-[#1E293B] dark:text-[#CBD5E1] hover:border-[#8B1E24] dark:hover:border-[#60A5FA]"
                      }`}
                    >
                      {opt.label}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Verificación de criterios del reto */}
            <div className="space-y-2">
              <p className="text-xs font-semibold text-[#0F172A] dark:text-[#F1F5F9]">
                Criterios de verificación del reto
              </p>
              <div className="space-y-2">
                {challenge.criterios.map((crit, idx) => {
                  const checked = Boolean(
                    progress.draftEvaluation.criteriosVerificados[idx]
                  );
                  return (
                    <label
                      key={idx}
                      className="flex items-start gap-2.5 p-2.5 rounded-lg border border-[#E2E8F0] dark:border-[#334155] bg-[#F5F7FA] dark:bg-[#0F172A] hover:bg-white dark:hover:bg-[#334155]/40 cursor-pointer transition-colors"
                    >
                      <input
                        type="checkbox"
                        checked={checked}
                        onChange={() => toggleCriterion(idx)}
                        className="mt-0.5 h-4 w-4 rounded border-slate-300 dark:border-slate-600 text-[#8B1E24] focus:ring-[#1E3A5F]"
                      />
                      <span className="text-xs text-[#0F172A] dark:text-[#CBD5E1] leading-snug">
                        {crit}
                      </span>
                    </label>
                  );
                })}
              </div>
            </div>

            {/* Notas de bitácora */}
            <div>
              <label
                htmlFor="reflection-notes"
                className="block text-xs font-semibold text-[#0F172A] dark:text-[#F1F5F9] mb-1.5"
              >
                Bitácora de hallazgos y plan de refinamiento
              </label>
              <textarea
                id="reflection-notes"
                rows={3}
                value={progress.draftEvaluation.notasReflexion}
                onChange={(e) =>
                  updateEvalField("notasReflexion", e.target.value)
                }
                placeholder="¿Qué falló o quedó superficial? ¿Qué contrastaste con tus apuntes/fuentes reales y qué ajustarás en la siguiente versión?"
                className="w-full px-3.5 py-2.5 text-sm text-[#0F172A] dark:text-[#F1F5F9] bg-[#F5F7FA] dark:bg-[#0F172A] border border-[#CBD5E1] dark:border-[#334155] rounded-lg placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:bg-white dark:focus:bg-[#0F172A] focus:border-[#1E3A5F] dark:focus:border-[#60A5FA] focus:outline-none transition-colors resize-y"
              />
            </div>

            {validationError && (
              <div
                role="alert"
                className="flex items-start gap-2 p-3 rounded-lg bg-red-50 dark:bg-red-950/50 border border-red-200 dark:border-red-800 text-red-900 dark:text-red-100 text-xs"
              >
                <AlertCircle
                  className="w-4 h-4 text-red-700 dark:text-red-400 shrink-0 mt-0.5"
                  aria-hidden="true"
                />
                <span>{validationError}</span>
              </div>
            )}

            {actionSuccess && (
              <div
                role="status"
                className="flex flex-wrap items-center justify-between gap-2 p-3 rounded-lg bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-800 text-emerald-900 dark:text-emerald-100 text-xs"
              >
                <div className="flex items-center gap-2">
                  <CheckCircle2
                    className="w-4 h-4 text-emerald-700 dark:text-emerald-400 shrink-0"
                    aria-hidden="true"
                  />
                  <span>{actionSuccess}</span>
                </div>
                <button
                  type="button"
                  onClick={onGoToPortfolio}
                  className="font-semibold text-[#1E3A5F] dark:text-[#60A5FA] underline whitespace-nowrap"
                >
                  Ver en Bitácora
                </button>
              </div>
            )}

            {/* Botones de iteración y cierre */}
            <div className="flex flex-col sm:flex-row gap-3 pt-1">
              <button
                type="button"
                onClick={handleSaveIteration}
                className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-white dark:bg-[#0F172A] hover:bg-[#F5F7FA] dark:hover:bg-[#334155]/60 border border-[#1E3A5F] dark:border-[#60A5FA] text-[#1E3A5F] dark:text-[#60A5FA] text-xs sm:text-sm font-semibold rounded-lg transition-colors whitespace-nowrap"
              >
                <Save className="w-4 h-4 shrink-0" aria-hidden="true" />
                <span className="tabular-nums">
                  Guardar v{currentVersionNumber} y refinar (v
                  {currentVersionNumber + 1})
                </span>
              </button>

              {progress.completed ? (
                <button
                  type="button"
                  onClick={onReopenChallenge}
                  className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-slate-100 dark:bg-[#0F172A] hover:bg-slate-200 dark:hover:bg-[#334155]/60 border border-transparent dark:border-[#334155] text-[#1E3A5F] dark:text-[#F1F5F9] text-xs sm:text-sm font-semibold rounded-lg transition-colors whitespace-nowrap"
                >
                  <RotateCcw className="w-4 h-4 shrink-0" aria-hidden="true" />
                  <span>Reabrir reto</span>
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handleMarkComplete}
                  className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-[#1E3A5F] dark:bg-[#2B4F7E] hover:bg-[#152B47] dark:hover:bg-[#356199] text-white text-xs sm:text-sm font-semibold rounded-lg transition-colors whitespace-nowrap"
                >
                  <FileCheck2 className="w-4 h-4 shrink-0" aria-hidden="true" />
                  <span>Marcar como Completado</span>
                </button>
              )}
            </div>
          </div>
        </section>
      </div>

      {/* Modal comparador de versiones v1 vs vN */}
      {showCompareModal && leftCompareVer && rightCompareVer && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Comparador de versiones de prompt"
          className="fixed inset-0 z-50 bg-slate-900/50 dark:bg-black/75 flex items-center justify-center p-4"
        >
          <div className="bg-white dark:bg-[#1E293B] border border-[#CBD5E1] dark:border-[#334155] rounded-xl max-w-5xl w-full max-h-[90vh] flex flex-col overflow-hidden">
            <div className="flex items-center justify-between gap-4 px-6 py-4 border-b border-[#E2E8F0] dark:border-[#334155]">
              <div>
                <h3 className="text-lg font-bold text-[#1E3A5F] dark:text-[#F1F5F9]">
                  Comparación de iteraciones
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Contrasta la evolución entre versiones de tu prompt y sus
                  hallazgos críticos.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowCompareModal(false)}
                aria-label="Cerrar comparador"
                className="p-2 text-slate-500 dark:text-[#CBD5E1] hover:text-[#1E3A5F] dark:hover:text-[#F1F5F9] rounded-lg hover:bg-[#F5F7FA] dark:hover:bg-[#0F172A]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 overflow-y-auto grid grid-cols-1 md:grid-cols-2 gap-6">
              {[
                {
                  ver: leftCompareVer,
                  selectedIdx: compareLeftIdx,
                  onChangeIdx: setCompareLeftIdx,
                  label: "Versión base",
                },
                {
                  ver: rightCompareVer,
                  selectedIdx: compareRightIdx,
                  onChangeIdx: setCompareRightIdx,
                  label: "Versión refinada",
                },
              ].map((col, i) => (
                <div
                  key={i}
                  className="border border-[#E2E8F0] dark:border-[#334155] rounded-lg p-4 bg-[#F5F7FA] dark:bg-[#0F172A] space-y-4"
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                      {col.label}
                    </span>
                    <select
                      value={col.selectedIdx}
                      onChange={(e) => col.onChangeIdx(Number(e.target.value))}
                      className="text-xs font-semibold text-[#1E3A5F] dark:text-[#F1F5F9] bg-white dark:bg-[#1E293B] border border-[#E2E8F0] dark:border-[#334155] rounded px-2 py-1"
                    >
                      {progress.versions.map((v, idx) => (
                        <option key={v.id} value={idx}>
                          Versión {v.versionNumber} (
                          {formatDateTimeEs(v.createdAt)})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <p className="text-xs font-semibold text-[#1E3A5F] dark:text-[#60A5FA] mb-1">
                      Prompt ensamblado
                    </p>
                    <pre className="font-mono text-xs text-[#1E293B] dark:text-[#E2E8F0] bg-white dark:bg-[#1E293B] border border-[#E2E8F0] dark:border-[#334155] rounded p-3 whitespace-pre-wrap max-h-52 overflow-y-auto">
                      {col.ver.assembledPrompt}
                    </pre>
                  </div>

                  <div>
                    <p className="text-xs font-semibold text-[#1E3A5F] dark:text-[#60A5FA] mb-1">
                      Respuesta obtenida
                    </p>
                    <div className="text-xs text-slate-700 dark:text-[#CBD5E1] bg-white dark:bg-[#1E293B] border border-[#E2E8F0] dark:border-[#334155] rounded p-3 whitespace-pre-wrap max-h-44 overflow-y-auto">
                      {col.ver.aiResponse}
                    </div>
                  </div>

                  <div>
                    <p className="text-xs font-semibold text-[#1E3A5F] dark:text-[#60A5FA] mb-1">
                      Nota de bitácora
                    </p>
                    <p className="text-xs text-slate-700 dark:text-[#CBD5E1] bg-white dark:bg-[#1E293B] border border-[#E2E8F0] dark:border-[#334155] rounded p-3">
                      {col.ver.evaluation.notasReflexion}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
