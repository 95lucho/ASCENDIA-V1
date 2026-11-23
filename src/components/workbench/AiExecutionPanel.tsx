import { useEffect, useState } from "react";
import { AlertTriangle, Loader2, Play } from "lucide-react";

interface AiExecutionPanelProps {
  challengeId: string;
  challengeTitle: string;
  currentVersionNumber: number;
  assembledPrompt: string;
  draftResponse: string;
  draftSourceMode: "live_gemini" | "manual";
  onUpdateResponse: (
    response: string,
    sourceMode?: "live_gemini" | "manual"
  ) => void;
  onClearValidationError: () => void;
}

export function AiExecutionPanel({
  challengeId,
  challengeTitle,
  currentVersionNumber,
  assembledPrompt,
  draftResponse,
  draftSourceMode,
  onUpdateResponse,
  onClearValidationError,
}: AiExecutionPanelProps) {
  const [isTestingLive, setIsTestingLive] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);
  const [geminiAvailable, setGeminiAvailable] = useState<boolean | null>(null);

  useEffect(() => {
    let cancelled = false;
    fetch("./api/health")
      .then(async (res) => {
        const contentType = res.headers.get("content-type") ?? "";
        if (!res.ok || !contentType.includes("application/json")) {
          return { geminiAvailable: false };
        }
        return (await res.json()) as { geminiAvailable?: boolean };
      })
      .then((data) => {
        if (!cancelled) {
          setGeminiAvailable(Boolean(data?.geminiAvailable));
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
  }, [challengeId]);

  const handleTestLive = async () => {
    if (!assembledPrompt.trim()) {
      setApiError(
        "Completa al menos un bloque del prompt antes de enviarlo a prueba."
      );
      return;
    }

    if (geminiAvailable === false) {
      setApiError(
        "Este entorno funciona en modo sin API. Copia tu prompt, pruébalo en una IA externa y pega la respuesta abajo."
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
          prompt: assembledPrompt,
          challengeTitle,
          version: currentVersionNumber,
        }),
      });

      const contentType = response.headers.get("content-type") ?? "";
      if (!contentType.includes("application/json")) {
        setGeminiAvailable(false);
        setApiError(
          "No hay un servidor de API activo en este despliegue estático. Copia el prompt, pruébalo en tu IA externa favorita y pega la respuesta abajo."
        );
        return;
      }

      const data = (await response.json()) as { text?: string; error?: string };

      if (!response.ok || !data.text) {
        setApiError(
          data.error ||
            "No fue posible obtener respuesta en vivo. Puedes pegar manualmente la respuesta de otra IA abajo."
        );
        return;
      }

      onClearValidationError();
      onUpdateResponse(data.text, "live_gemini");
    } catch {
      setGeminiAvailable(false);
      setApiError(
        "No fue posible conectar con el servidor de IA. Puedes continuar sin problemas en modo manual pegando una respuesta externa abajo."
      );
    } finally {
      setIsTestingLive(false);
    }
  };

  const liveDisabled =
    isTestingLive || !assembledPrompt.trim() || geminiAvailable === false;

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-[#E2E8F0] dark:border-[#334155]">
        <div>
          <h2 className="text-lg font-bold text-[#1E3A5F] dark:text-[#F1F5F9]">
            Prueba y Salida de la IA
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            {geminiAvailable === false
              ? "Modo manual (sin servidor/API): copia el prompt ensamblado, pruébalo en tu IA externa y pega el resultado."
              : "Prueba en vivo con Gemini o pega manualmente la salida de cualquier sistema de IA."}
          </p>
        </div>

        <button
          type="button"
          onClick={handleTestLive}
          disabled={liveDisabled}
          title={
            geminiAvailable === false
              ? "Modo sin API activo: utiliza Copiar Prompt y pega la respuesta manualmente"
              : "Enviar el prompt ensamblado para obtener una respuesta en vivo"
          }
          className="inline-flex items-center gap-2 px-4 py-2 bg-[#8B1E24] dark:bg-[#C93B44] hover:bg-[#70161B] dark:hover:bg-[#B02E36] disabled:bg-slate-300 dark:disabled:bg-slate-700 disabled:text-slate-500 dark:disabled:text-slate-400 disabled:cursor-not-allowed text-white text-xs sm:text-sm font-semibold rounded-lg transition-colors whitespace-nowrap shrink-0 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#1E3A5F] dark:focus-visible:outline-[#60A5FA]"
        >
          {isTestingLive ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" aria-hidden="true" />
              <span>Consultando...</span>
            </>
          ) : (
            <>
              <Play className="w-4 h-4" aria-hidden="true" />
              <span>
                {geminiAvailable === false
                  ? "Modo sin API (Manual)"
                  : "Probar con IA en vivo"}
              </span>
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
            {draftResponse.trim() && (
              <span>
                Origen:{" "}
                {draftSourceMode === "live_gemini"
                  ? "IA en vivo"
                  : "Pegado manual"}
              </span>
            )}
            {draftResponse && (
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
          value={draftResponse}
          onChange={(e) => {
            onClearValidationError();
            onUpdateResponse(e.target.value, "manual");
          }}
          placeholder="Aquí aparecerá la respuesta de la IA en vivo, o puedes pegar manualmente la respuesta obtenida en otra herramienta de IA para analizarla."
          className="w-full px-3.5 py-2.5 text-sm text-[#0F172A] dark:text-[#F1F5F9] bg-[#F5F7FA] dark:bg-[#0F172A] border border-[#CBD5E1] dark:border-[#334155] rounded-lg placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:bg-white dark:focus:bg-[#0F172A] focus:border-[#1E3A5F] dark:focus:border-[#60A5FA] focus:outline-none transition-colors resize-y leading-relaxed"
        />
      </div>
    </div>
  );
}
