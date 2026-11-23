import { useEffect } from "react";
import { X } from "lucide-react";
import { IterationVersion } from "../../types/lab";
import { formatDateTimeEs } from "../../utils/promptBuilder";

interface VersionComparatorModalProps {
  open: boolean;
  versions: IterationVersion[];
  leftIdx: number;
  rightIdx: number;
  onChangeLeftIdx: (idx: number) => void;
  onChangeRightIdx: (idx: number) => void;
  onClose: () => void;
}

export function VersionComparatorModal({
  open,
  versions,
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

  const leftCompareVer = versions[leftIdx];
  const rightCompareVer = versions[rightIdx];

  if (!open || !leftCompareVer || !rightCompareVer) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Comparador de versiones de prompt"
      className="fixed inset-0 z-50 bg-slate-900/50 dark:bg-black/75 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div
        className="bg-white dark:bg-[#1E293B] border border-[#CBD5E1] dark:border-[#334155] rounded-xl max-w-5xl w-full max-h-[90vh] flex flex-col overflow-hidden shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between gap-4 px-6 py-4 border-b border-[#E2E8F0] dark:border-[#334155]">
          <div>
            <h3 className="text-lg font-bold text-[#1E3A5F] dark:text-[#F1F5F9]">
              Comparación de iteraciones
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Contrasta la evolución entre versiones de tu prompt y sus hallazgos
              críticos.
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

        <div className="p-6 overflow-y-auto grid grid-cols-1 md:grid-cols-2 gap-6">
          {[
            {
              ver: leftCompareVer,
              selectedIdx: leftIdx,
              onChangeIdx: onChangeLeftIdx,
              label: "Versión base",
            },
            {
              ver: rightCompareVer,
              selectedIdx: rightIdx,
              onChangeIdx: onChangeRightIdx,
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
                  aria-label={col.label}
                  value={col.selectedIdx}
                  onChange={(e) => col.onChangeIdx(Number(e.target.value))}
                  className="text-xs font-semibold text-[#1E3A5F] dark:text-[#F1F5F9] bg-white dark:bg-[#1E293B] border border-[#E2E8F0] dark:border-[#334155] rounded px-2 py-1"
                >
                  {versions.map((v, idx) => (
                    <option key={v.id} value={idx}>
                      Versión {v.versionNumber} ({formatDateTimeEs(v.createdAt)})
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
  );
}
