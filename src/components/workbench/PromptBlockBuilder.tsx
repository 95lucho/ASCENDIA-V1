import { useState } from "react";
import {
  AlertCircle,
  AlertTriangle,
  Check,
  CheckCircle2,
  Copy,
  RotateCcw,
} from "lucide-react";
import {
  ChallengeDefinition,
  CompletenessCheck,
  IterationVersion,
  PromptBlocks,
} from "../../types/lab";

interface PromptBlockBuilderProps {
  challenge: ChallengeDefinition;
  currentVersionNumber: number;
  draftBlocks: PromptBlocks;
  versions: IterationVersion[];
  assembledPrompt: string;
  completeness: CompletenessCheck;
  onBlockChange: (key: keyof PromptBlocks, value: string) => void;
  onResetBlocks: () => void;
  onLoadVersion: (version: IterationVersion) => void;
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

export function PromptBlockBuilder({
  challenge,
  currentVersionNumber,
  draftBlocks,
  versions,
  assembledPrompt,
  completeness,
  onBlockChange,
  onResetBlocks,
  onLoadVersion,
}: PromptBlockBuilderProps) {
  const [copiedPrompt, setCopiedPrompt] = useState(false);
  const [copyError, setCopyError] = useState(false);

  const handleCopyPrompt = async () => {
    if (!assembledPrompt.trim()) return;
    setCopyError(false);
    try {
      await navigator.clipboard.writeText(assembledPrompt);
      setCopiedPrompt(true);
      setTimeout(() => setCopiedPrompt(false), 2000);
    } catch {
      setCopiedPrompt(false);
      setCopyError(true);
    }
  };

  return (
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
            Redacta cada dimensión por separado para evitar instrucciones ambiguas.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {versions.length > 0 && (
            <select
              aria-label="Cargar una versión guardada"
              defaultValue=""
              onChange={(e) => {
                const idx = Number(e.target.value);
                if (!Number.isNaN(idx) && versions[idx]) {
                  onLoadVersion(versions[idx]);
                }
                e.target.value = "";
              }}
              className="text-xs text-slate-700 dark:text-[#F1F5F9] bg-[#F5F7FA] dark:bg-[#0F172A] border border-[#CBD5E1] dark:border-[#334155] rounded-md px-2 py-1.5 focus:outline-none focus:border-[#1E3A5F] dark:focus:border-[#60A5FA]"
            >
              <option value="" disabled>
                Cargar v1–v{versions.length}...
              </option>
              {versions.map((v, idx) => (
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
              value={draftBlocks[field.key]}
              onChange={(e) => onBlockChange(field.key, e.target.value)}
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

        {copyError && (
          <p className="mb-2 text-xs text-amber-700 dark:text-amber-300">
            No se pudo acceder al portapapeles automático. Selecciona el texto
            inferior y cópialo manualmente.
          </p>
        )}

        <div className="bg-[#F5F7FA] dark:bg-[#0F172A] border border-[#E2E8F0] dark:border-[#334155] rounded-lg p-4 max-h-64 overflow-y-auto">
          {assembledPrompt ? (
            <pre className="font-mono text-xs text-[#1E293B] dark:text-[#E2E8F0] whitespace-pre-wrap leading-relaxed select-all">
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
  );
}
