import { useEffect, useState } from "react";
import {
  AlertTriangle,
  CheckCircle2,
  Columns2,
  ExternalLink,
  Loader2,
  Play,
  RefreshCw,
  Sparkles,
  Trash2,
} from "lucide-react";
import { AiResponseRenderer } from "./AiResponseRenderer";

interface AiExecutionPanelProps {
  challengeId: string;
  challengeTitle: string;
  currentVersionNumber: number;
  versionsCount: number;
  assembledPrompt: string;
  draftExecutedPrompt?: string;
  draftResponse: string;
  draftSourceMode: "live_gemini" | "manual";
  draftProvider?: string;
  draftModel?: string;
  onUpdateResponse: (
    response: string,
    sourceMode?: "live_gemini" | "manual",
    meta?: { provider?: string; model?: string; executedPrompt?: string }
  ) => void;
  onUpdateExecutionMeta: (meta: {
    executedPrompt?: string;
    provider?: string;
    model?: string;
    sourceMode?: "live_gemini" | "manual";
  }) => void;
  onClearValidationError: () => void;
  onOpenComparator: () => void;
}

type ExecutionModality = "direct" | "external" | null;

const EXTERNAL_TOOL_OPTIONS = [
  "ChatGPT",
  "Google Gemini",
  "Claude",
  "Microsoft Copilot",
] as const;

function isKnownExternalTool(name?: string): boolean {
  if (!name) return false;
  return (EXTERNAL_TOOL_OPTIONS as readonly string[]).includes(name.trim());
}

function resolveInitialModality(
  sourceMode: "live_gemini" | "manual",
  provider?: string,
  response?: string
): ExecutionModality {
  if (sourceMode === "manual" && (provider?.trim() || response?.trim())) {
    return "external";
  }
  if (sourceMode === "live_gemini" && response?.trim()) {
    return "direct";
  }
  return null;
}

export function AiExecutionPanel({
  challengeId,
  challengeTitle,
  currentVersionNumber,
  versionsCount,
  assembledPrompt,
  draftExecutedPrompt,
  draftResponse,
  draftSourceMode,
  draftProvider,
  draftModel,
  onUpdateResponse,
  onUpdateExecutionMeta,
  onClearValidationError,
  onOpenComparator,
}: AiExecutionPanelProps) {
  const [activeModality, setActiveModality] = useState<ExecutionModality>(() =>
    resolveInitialModality(draftSourceMode, draftProvider, draftResponse)
  );
  const [isCustomTool, setIsCustomTool] = useState<boolean>(() =>
    Boolean(draftProvider?.trim() && !isKnownExternalTool(draftProvider))
  );
  const [isTestingLive, setIsTestingLive] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);
  const [geminiAvailable, setGeminiAvailable] = useState<boolean | null>(null);
  const [backendModelInfo, setBackendModelInfo] = useState<{
    provider?: string;
    model?: string;
  }>({});

  useEffect(() => {
    let cancelled = false;
    fetch("./api/health")
      .then(async (res) => {
        const contentType = res.headers.get("content-type") ?? "";
        if (!res.ok || !contentType.includes("application/json")) {
          return { geminiAvailable: false };
        }
        return (await res.json()) as {
          geminiAvailable?: boolean;
          provider?: string;
          model?: string;
        };
      })
      .then((data) => {
        if (!cancelled) {
          const available = Boolean(data?.geminiAvailable);
          setGeminiAvailable(available);
          setBackendModelInfo({
            provider: data?.provider,
            model: data?.model,
          });
        }
      })
      .catch(() => {
        if (!cancelled) setGeminiAvailable(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    setApiError(null);
    setActiveModality(
      resolveInitialModality(draftSourceMode, draftProvider, draftResponse)
    );
    setIsCustomTool(
      Boolean(draftProvider?.trim() && !isKnownExternalTool(draftProvider))
    );
  }, [challengeId]);

  const effectivePrompt =
    draftExecutedPrompt !== undefined ? draftExecutedPrompt : assembledPrompt;

  const hasAssembledPrompt = assembledPrompt.trim().length > 0;

  const promptDiffersFromBlocks =
    draftExecutedPrompt !== undefined &&
    hasAssembledPrompt &&
    draftExecutedPrompt.trim() !== assembledPrompt.trim();

  const handleSelectModality = (modality: "direct" | "external") => {
    setActiveModality(modality);
    setApiError(null);
    onClearValidationError();
    if (modality === "external") {
      onUpdateExecutionMeta({ sourceMode: "manual" });
    } else {
      onUpdateExecutionMeta({ sourceMode: "live_gemini" });
    }
  };

  const handleSelectExternalTool = (tool: string) => {
    onClearValidationError();
    if (tool === "Otra") {
      setIsCustomTool(true);
      if (isKnownExternalTool(draftProvider)) {
        onUpdateExecutionMeta({ provider: "", sourceMode: "manual" });
      } else {
        onUpdateExecutionMeta({ sourceMode: "manual" });
      }
      return;
    }

    setIsCustomTool(false);
    onUpdateExecutionMeta({ provider: tool, sourceMode: "manual" });
  };

  const handleTestLive = async () => {
    const promptToSend = effectivePrompt.trim();
    if (!promptToSend) {
      setApiError(
        "Escribe una instrucción o completa los bloques de la izquierda antes de ejecutar la prueba."
      );
      return;
    }

    if (geminiAvailable === false) {
      setApiError(
        "El servicio integrado de IA no está disponible en este entorno. Puedes elegir «Ya la probé en otra IA» para registrar el resultado obtenido en otra herramienta."
      );
      return;
    }

    setIsTestingLive(true);
    setApiError(null);

    try {
      const response = await fetch("./api/gemini/test-prompt", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt: promptToSend,
          challengeTitle,
          version: currentVersionNumber,
        }),
      });

      const contentType = response.headers.get("content-type") ?? "";
      if (!contentType.includes("application/json")) {
        setGeminiAvailable(false);
        setApiError(
          "No hay un servidor de IA activo en este entorno. Selecciona «Ya la probé en otra IA» para registrar tu prueba."
        );
        return;
      }

      const data = (await response.json()) as {
        text?: string;
        provider?: string;
        model?: string;
        error?: string;
      };

      if (!response.ok || !data.text) {
        setApiError(
          data.error ||
            "No fue posible obtener respuesta del modelo. Puedes intentarlo nuevamente o elegir «Ya la probé en otra IA»."
        );
        return;
      }

      onClearValidationError();
      onUpdateResponse(data.text, "live_gemini", {
        provider: data.provider || backendModelInfo.provider || "Google Gemini",
        model: data.model || backendModelInfo.model || "gemini-4-hydrogen",
        executedPrompt: promptToSend,
      });
    } catch {
      setGeminiAvailable(false);
      setApiError(
        "Error de conexión con el servidor de IA. Puedes elegir «Ya la probé en otra IA» para registrar tu experiencia."
      );
    } finally {
      setIsTestingLive(false);
    }
  };

  const canCompareDraftWithSaved =
    versionsCount >= 1 && draftResponse.trim().length > 0;

  return (
    <div className="space-y-4">
      {/* Encabezado */}
      <div className="pb-3 border-b border-[#E2E8F0] dark:border-[#334155]">
        <h2 className="text-lg font-bold text-[#1E3A5F] dark:text-[#F1F5F9]">
          <span className="font-mono text-sm text-[#8B1E24] dark:text-[#F87171] mr-1.5">
            1.
          </span>
          Experimenta con tu instrucción
        </h2>
        <p className="text-xs sm:text-sm text-slate-600 dark:text-[#CBD5E1] mt-1">
          Es momento de comprobar qué tan bien funciona tu instrucción. Elige
          cómo quieres probarla.
        </p>
      </div>

      {/* Dos tarjetas de selección claras */}
      <div
        role="radiogroup"
        aria-label="Elige cómo probar tu instrucción"
        className="grid grid-cols-1 sm:grid-cols-2 gap-3"
      >
        <button
          type="button"
          role="radio"
          aria-checked={activeModality === "direct"}
          onClick={() => handleSelectModality("direct")}
          className={`text-left rounded-xl p-4 border-2 transition-all flex flex-col justify-between gap-2 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#1E3A5F] dark:focus-visible:outline-[#60A5FA] ${
            activeModality === "direct"
              ? "border-[#1E3A5F] dark:border-[#60A5FA] bg-[#1E3A5F]/5 dark:bg-[#2B4F7E]/25 shadow-sm"
              : "border-[#CBD5E1] dark:border-[#334155] bg-[#F5F7FA] dark:bg-[#0F172A] hover:border-[#1E3A5F]/60 dark:hover:border-[#60A5FA]/60"
          }`}
        >
          <div className="flex items-start justify-between gap-2">
            <div className="flex items-center gap-2">
              <span
                className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                  activeModality === "direct"
                    ? "bg-[#1E3A5F] dark:bg-[#2B4F7E] text-white"
                    : "bg-white dark:bg-[#1E293B] text-[#1E3A5F] dark:text-[#60A5FA] border border-[#CBD5E1] dark:border-[#334155]"
                }`}
              >
                <Sparkles className="w-4 h-4" aria-hidden="true" />
              </span>
              <span className="text-sm font-bold text-[#1E3A5F] dark:text-[#F1F5F9]">
                Probar con la IA
              </span>
            </div>
            {activeModality === "direct" && (
              <CheckCircle2
                className="w-4 h-4 text-[#1E3A5F] dark:text-[#60A5FA] shrink-0 mt-0.5"
                aria-hidden="true"
              />
            )}
          </div>
          <p className="text-xs text-slate-600 dark:text-[#CBD5E1] leading-relaxed">
            Ejecuta tu instrucción desde ASCENDIA y observa la respuesta que
            genera la inteligencia artificial.
          </p>
        </button>

        <button
          type="button"
          role="radio"
          aria-checked={activeModality === "external"}
          onClick={() => handleSelectModality("external")}
          className={`text-left rounded-xl p-4 border-2 transition-all flex flex-col justify-between gap-2 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#8B1E24] dark:focus-visible:outline-[#F87171] ${
            activeModality === "external"
              ? "border-[#8B1E24] dark:border-[#F87171] bg-[#8B1E24]/5 dark:bg-[#8B1E24]/20 shadow-sm"
              : "border-[#CBD5E1] dark:border-[#334155] bg-[#F5F7FA] dark:bg-[#0F172A] hover:border-[#8B1E24]/60 dark:hover:border-[#F87171]/60"
          }`}
        >
          <div className="flex items-start justify-between gap-2">
            <div className="flex items-center gap-2">
              <span
                className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                  activeModality === "external"
                    ? "bg-[#8B1E24] dark:bg-[#C93B44] text-white"
                    : "bg-white dark:bg-[#1E293B] text-[#8B1E24] dark:text-[#F87171] border border-[#CBD5E1] dark:border-[#334155]"
                }`}
              >
                <ExternalLink className="w-4 h-4" aria-hidden="true" />
              </span>
              <span className="text-sm font-bold text-[#1E3A5F] dark:text-[#F1F5F9]">
                Ya la probé en otra IA
              </span>
            </div>
            {activeModality === "external" && (
              <CheckCircle2
                className="w-4 h-4 text-[#8B1E24] dark:text-[#F87171] shrink-0 mt-0.5"
                aria-hidden="true"
              />
            )}
          </div>
          <p className="text-xs text-slate-600 dark:text-[#CBD5E1] leading-relaxed">
            Si utilizaste ChatGPT, Gemini, Claude u otra herramienta, registra
            aquí el resultado de tu experiencia.
          </p>
        </button>
      </div>

      {/* Opción 1: Probar con la IA */}
      {activeModality === "direct" && (
        <div className="space-y-4 pt-2 border-t border-[#E2E8F0] dark:border-[#334155]">
          <div className="space-y-1.5">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <label
                htmlFor="executed-prompt-input"
                className="text-xs font-semibold text-[#1E3A5F] dark:text-[#93C5FD]"
              >
                Instrucción que se enviará a la IA
              </label>
              {promptDiffersFromBlocks && (
                <button
                  type="button"
                  onClick={() =>
                    onUpdateExecutionMeta({ executedPrompt: undefined })
                  }
                  className="inline-flex items-center gap-1 text-xs font-medium text-[#1E3A5F] dark:text-[#60A5FA] hover:text-[#8B1E24] dark:hover:text-[#F87171] underline"
                >
                  <RefreshCw className="w-3 h-3" aria-hidden="true" />
                  <span>Sincronizar con bloques</span>
                </button>
              )}
            </div>
            <textarea
              id="executed-prompt-input"
              rows={4}
              value={effectivePrompt}
              onChange={(e) => {
                onClearValidationError();
                onUpdateExecutionMeta({ executedPrompt: e.target.value });
              }}
              placeholder="Completa los bloques en la columna izquierda o escribe aquí la instrucción que deseas probar..."
              className="w-full px-3.5 py-2.5 font-mono text-xs sm:text-sm text-[#0F172A] dark:text-[#F1F5F9] bg-[#F5F7FA] dark:bg-[#0F172A] border border-[#CBD5E1] dark:border-[#334155] rounded-lg placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:bg-white dark:focus:bg-[#0F172A] focus:border-[#1E3A5F] dark:focus:border-[#60A5FA] focus:outline-none transition-colors resize-y leading-relaxed"
            />
          </div>

          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="text-xs text-slate-600 dark:text-[#CBD5E1]">
              {geminiAvailable === false ? (
                <span className="text-amber-700 dark:text-amber-300 font-medium">
                  El servicio integrado no está disponible ahora. Puedes usar «Ya
                  la probé en otra IA».
                </span>
              ) : (
                <span>
                  Servicio conectado:{" "}
                  <strong className="text-[#1E3A5F] dark:text-[#93C5FD]">
                    {backendModelInfo.provider || "Google Gemini"}
                    {backendModelInfo.model ? ` (${backendModelInfo.model})` : ""}
                  </strong>
                </span>
              )}
            </div>

            <div className="flex items-center gap-2">
              {draftResponse && (
                <button
                  type="button"
                  onClick={() =>
                    onUpdateResponse("", "live_gemini", {
                      provider: undefined,
                      model: undefined,
                    })
                  }
                  className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-slate-600 dark:text-[#CBD5E1] hover:text-[#8B1E24] dark:hover:text-[#F87171] bg-white dark:bg-[#0F172A] border border-[#CBD5E1] dark:border-[#334155] rounded-lg transition-colors"
                >
                  <Trash2 className="w-3.5 h-3.5" aria-hidden="true" />
                  <span>Limpiar salida</span>
                </button>
              )}

              <button
                type="button"
                onClick={handleTestLive}
                disabled={
                  isTestingLive ||
                  !effectivePrompt.trim() ||
                  geminiAvailable === false
                }
                className="inline-flex items-center gap-2 px-4 py-2 bg-[#8B1E24] dark:bg-[#C93B44] hover:bg-[#70161B] dark:hover:bg-[#B02E36] disabled:bg-slate-300 dark:disabled:bg-slate-700 disabled:text-slate-500 dark:disabled:text-slate-400 disabled:cursor-not-allowed text-white text-xs sm:text-sm font-semibold rounded-lg transition-colors whitespace-nowrap shrink-0 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#1E3A5F] dark:focus-visible:outline-[#60A5FA]"
              >
                {isTestingLive ? (
                  <>
                    <Loader2
                      className="w-4 h-4 animate-spin"
                      aria-hidden="true"
                    />
                    <span>Ejecutando...</span>
                  </>
                ) : (
                  <>
                    <Play className="w-4 h-4" aria-hidden="true" />
                    <span>Ejecutar prueba</span>
                  </>
                )}
              </button>
            </div>
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
              <div className="space-y-1">
                <p>{apiError}</p>
                <button
                  type="button"
                  onClick={() => handleSelectModality("external")}
                  className="font-semibold text-[#8B1E24] dark:text-[#FCA5A5] underline"
                >
                  Cambiar a «Ya la probé en otra IA»
                </button>
              </div>
            </div>
          )}

          <div className="space-y-2 pt-1">
            <h3 className="text-sm font-bold text-[#1E3A5F] dark:text-[#F1F5F9]">
              <span className="font-mono text-xs text-[#8B1E24] dark:text-[#F87171] mr-1.5">
                2.
              </span>
              Observo la respuesta de la IA
            </h3>
            <AiResponseRenderer
              title="Respuesta generada por la IA"
              responseText={draftResponse}
              provider={
                draftSourceMode === "live_gemini"
                  ? draftProvider || backendModelInfo.provider || "Google Gemini"
                  : draftProvider
              }
              model={
                draftSourceMode === "live_gemini"
                  ? draftModel || backendModelInfo.model
                  : draftModel
              }
              sourceMode={draftSourceMode}
              isLoading={isTestingLive}
              errorMessage={apiError}
              emptyMessage="Haz clic en «Ejecutar prueba» para enviar tu instrucción y observar la respuesta de la IA."
              maxHeightClass="max-h-[420px]"
            />
          </div>
        </div>
      )}

      {/* Opción 2: Ya la probé en otra IA */}
      {activeModality === "external" && (
        <div className="space-y-4 pt-2 border-t border-[#E2E8F0] dark:border-[#334155]">
          {hasAssembledPrompt ? (
            <p className="text-xs text-slate-600 dark:text-[#CBD5E1] bg-[#F5F7FA] dark:bg-[#0F172A] border border-[#E2E8F0] dark:border-[#334155] rounded-lg px-3 py-2">
              Tu instrucción armada en el constructor se guardará
              automáticamente junto con esta prueba externa.
            </p>
          ) : (
            <div className="space-y-1">
              <label
                htmlFor="external-prompt-fallback"
                className="block text-xs font-semibold text-[#1E3A5F] dark:text-[#93C5FD]"
              >
                Instrucción que utilizaste
              </label>
              <textarea
                id="external-prompt-fallback"
                rows={3}
                value={draftExecutedPrompt ?? ""}
                onChange={(e) => {
                  onClearValidationError();
                  onUpdateExecutionMeta({
                    executedPrompt: e.target.value,
                    sourceMode: "manual",
                  });
                }}
                placeholder="Escribe o pega aquí la instrucción que probaste (o ármala en los bloques de la izquierda)..."
                className="w-full px-3.5 py-2 text-xs sm:text-sm text-[#0F172A] dark:text-[#F1F5F9] bg-[#F5F7FA] dark:bg-[#0F172A] border border-[#CBD5E1] dark:border-[#334155] rounded-lg placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:bg-white dark:focus:bg-[#0F172A] focus:border-[#1E3A5F] dark:focus:border-[#60A5FA] focus:outline-none transition-colors resize-y"
              />
            </div>
          )}

          {/* Campo 1. ¿Qué herramienta utilizaste? */}
          <div className="space-y-2">
            <p className="text-xs sm:text-sm font-semibold text-[#0F172A] dark:text-[#F1F5F9]">
              1. ¿Qué herramienta utilizaste?
            </p>
            <div className="flex flex-wrap gap-2">
              {EXTERNAL_TOOL_OPTIONS.map((tool) => {
                const selected = !isCustomTool && draftProvider === tool;
                return (
                  <button
                    key={tool}
                    type="button"
                    aria-pressed={selected}
                    onClick={() => handleSelectExternalTool(tool)}
                    className={`px-3 py-1.5 text-xs font-medium rounded-lg border transition-colors ${
                      selected
                        ? "bg-[#1E3A5F] dark:bg-[#2B4F7E] text-white border-[#1E3A5F] dark:border-[#60A5FA]"
                        : "bg-white dark:bg-[#0F172A] text-[#1E293B] dark:text-[#CBD5E1] border-[#CBD5E1] dark:border-[#334155] hover:border-[#8B1E24] dark:hover:border-[#60A5FA]"
                    }`}
                  >
                    {tool}
                  </button>
                );
              })}

              <button
                type="button"
                aria-pressed={isCustomTool}
                onClick={() => handleSelectExternalTool("Otra")}
                className={`px-3 py-1.5 text-xs font-medium rounded-lg border transition-colors ${
                  isCustomTool
                    ? "bg-[#8B1E24] dark:bg-[#C93B44] text-white border-[#8B1E24] dark:border-[#C93B44]"
                    : "bg-white dark:bg-[#0F172A] text-[#1E293B] dark:text-[#CBD5E1] border-[#CBD5E1] dark:border-[#334155] hover:border-[#8B1E24] dark:hover:border-[#60A5FA]"
                }`}
              >
                Otra
              </button>
            </div>

            {isCustomTool && (
              <div className="pt-1">
                <label htmlFor="external-other-tool-input" className="sr-only">
                  Nombre de la herramienta externa
                </label>
                <input
                  id="external-other-tool-input"
                  type="text"
                  value={draftProvider ?? ""}
                  onChange={(e) => {
                    onClearValidationError();
                    onUpdateExecutionMeta({
                      provider: e.target.value,
                      sourceMode: "manual",
                    });
                  }}
                  placeholder="Escribe el nombre de la herramienta (ej. Perplexity, DeepSeek...)"
                  className="w-full px-3 py-2 text-xs sm:text-sm text-[#0F172A] dark:text-[#F1F5F9] bg-[#F5F7FA] dark:bg-[#0F172A] border border-[#CBD5E1] dark:border-[#334155] rounded-lg placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:bg-white dark:focus:bg-[#0F172A] focus:border-[#1E3A5F] dark:focus:border-[#60A5FA] focus:outline-none"
                />
              </div>
            )}
          </div>

          {/* Campo 2. ¿Qué modelo utilizaste? (Opcional) */}
          <div className="space-y-1">
            <label
              htmlFor="external-model-input"
              className="block text-xs sm:text-sm font-semibold text-[#0F172A] dark:text-[#F1F5F9]"
            >
              2. ¿Qué modelo utilizaste?{" "}
              <span className="font-normal text-slate-500 dark:text-slate-400">
                (Opcional)
              </span>
            </label>
            <input
              id="external-model-input"
              type="text"
              value={draftModel ?? ""}
              onChange={(e) => {
                onClearValidationError();
                onUpdateExecutionMeta({
                  model: e.target.value,
                  sourceMode: "manual",
                });
              }}
              placeholder="Escribe el modelo si lo conoces"
              className="w-full px-3 py-2 text-xs sm:text-sm text-[#0F172A] dark:text-[#F1F5F9] bg-[#F5F7FA] dark:bg-[#0F172A] border border-[#CBD5E1] dark:border-[#334155] rounded-lg placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:bg-white dark:focus:bg-[#0F172A] focus:border-[#1E3A5F] dark:focus:border-[#60A5FA] focus:outline-none"
            />
          </div>

          {/* Campo 3. ¿Qué respuesta obtuviste? */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between gap-2">
              <label
                htmlFor="ai-response-textarea"
                className="text-xs sm:text-sm font-semibold text-[#0F172A] dark:text-[#F1F5F9]"
              >
                3. ¿Qué respuesta obtuviste?
              </label>
              {draftResponse && (
                <button
                  type="button"
                  onClick={() => onUpdateResponse("", "manual")}
                  className="text-xs text-slate-500 dark:text-slate-400 hover:text-[#8B1E24] dark:hover:text-[#F87171] underline"
                >
                  Limpiar
                </button>
              )}
            </div>
            <textarea
              id="ai-response-textarea"
              rows={6}
              value={draftResponse}
              onChange={(e) => {
                onClearValidationError();
                onUpdateResponse(e.target.value, "manual");
              }}
              placeholder="Copia y pega aquí la respuesta que generó la IA"
              className="w-full px-3.5 py-2.5 text-sm text-[#0F172A] dark:text-[#F1F5F9] bg-[#F5F7FA] dark:bg-[#0F172A] border border-[#CBD5E1] dark:border-[#334155] rounded-lg placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:bg-white dark:focus:bg-[#0F172A] focus:border-[#1E3A5F] dark:focus:border-[#60A5FA] focus:outline-none transition-colors resize-y leading-relaxed"
            />
          </div>

          {draftResponse.trim() && (
            <div className="space-y-2 pt-1">
              <h3 className="text-sm font-bold text-[#1E3A5F] dark:text-[#F1F5F9]">
                <span className="font-mono text-xs text-[#8B1E24] dark:text-[#F87171] mr-1.5">
                  2.
                </span>
                Observo la respuesta de la IA
              </h3>
              <AiResponseRenderer
                title="Respuesta generada por la IA"
                responseText={draftResponse}
                provider={draftProvider || "Prueba externa"}
                model={draftModel}
                sourceMode="manual"
                compact
                maxHeightClass="max-h-72"
              />
            </div>
          )}
        </div>
      )}

      {canCompareDraftWithSaved && (
        <div className="flex flex-wrap items-center justify-between gap-2 p-3 rounded-lg bg-[#1E3A5F]/5 dark:bg-[#60A5FA]/10 border border-[#1E3A5F]/20 dark:border-[#60A5FA]/30">
          <span className="text-xs text-[#1E3A5F] dark:text-[#E2E8F0]">
            Ya tienes{" "}
            {versionsCount === 1
              ? "1 prueba guardada"
              : `${versionsCount} pruebas guardadas`}
            . Compara esta respuesta con tu intento anterior.
          </span>
          <button
            type="button"
            onClick={onOpenComparator}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold bg-[#1E3A5F] dark:bg-[#2B4F7E] hover:bg-[#152B47] dark:hover:bg-[#356199] text-white rounded-md transition-colors whitespace-nowrap shrink-0"
          >
            <Columns2 className="w-3.5 h-3.5" aria-hidden="true" />
            <span>Comparar ejecuciones</span>
          </button>
        </div>
      )}
    </div>
  );
}
