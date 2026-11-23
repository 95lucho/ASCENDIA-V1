import { useEffect } from "react";
import { Award, X } from "lucide-react";

interface CreditsModalProps {
  open: boolean;
  onClose: () => void;
}

export function CreditsModal({ open, onClose }: CreditsModalProps) {
  useEffect(() => {
    if (!open) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="credits-modal-title"
      className="fixed inset-0 z-50 bg-[#0F172A]/60 dark:bg-black/70 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div
        className="bg-white dark:bg-[#1E293B] border border-[#CBD5E1] dark:border-[#334155] rounded-xl max-w-lg w-full overflow-hidden shadow-lg"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between gap-4 px-6 py-4 border-b border-[#E2E8F0] dark:border-[#334155] bg-[#F5F7FA] dark:bg-[#0F172A]">
          <div className="flex items-center gap-2.5">
            <Award
              className="w-4 h-4 text-[#8B1E24] dark:text-[#F87171]"
              aria-hidden="true"
            />
            <h2
              id="credits-modal-title"
              className="text-base font-bold text-[#1E3A5F] dark:text-[#F1F5F9]"
            >
              Créditos
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Cerrar créditos"
            className="p-1.5 text-slate-600 dark:text-[#CBD5E1] hover:text-[#1E3A5F] dark:hover:text-[#F1F5F9] hover:bg-white dark:hover:bg-[#1E293B] rounded-lg transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#1E3A5F] dark:focus-visible:outline-[#60A5FA]"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-6 space-y-4">
          <div className="space-y-1">
            <p className="font-display text-lg font-bold text-[#1E3A5F] dark:text-[#F1F5F9]">
              Luis Enrique Justiniano Mercado
            </p>
            <p className="text-sm font-semibold text-[#8B1E24] dark:text-[#F87171]">
              Creador de ASCENDIA
            </p>
            <p className="text-sm font-medium text-[#1E293B] dark:text-[#CBD5E1]">
              Estudiante de Ciencias de la Educación – UAGRM.
            </p>
          </div>

          <div className="pt-3 border-t border-[#E2E8F0] dark:border-[#334155]">
            <p className="text-sm text-[#1E293B] dark:text-[#CBD5E1] leading-relaxed">
              Responsable de la concepción, diseño y desarrollo tecnológico de
              ASCENDIA, incluyendo la arquitectura de la aplicación web,
              programación de sus funcionalidades, diseño de interfaces y
              experiencia de usuario.
            </p>
          </div>

          <div className="pt-2 flex items-center justify-between gap-4 text-xs text-slate-500 dark:text-slate-400">
            <span>ASCENDIA · UAGRM</span>
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-[#1E3A5F] dark:bg-[#2B4F7E] hover:bg-[#152B47] dark:hover:bg-[#356199] text-white text-xs font-semibold rounded-lg transition-colors"
            >
              Cerrar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
