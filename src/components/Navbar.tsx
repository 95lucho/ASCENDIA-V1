import { useEffect, useRef, useState } from "react";
import {
  Award,
  Blocks,
  BookOpen,
  Check,
  ChevronDown,
  Compass,
  FolderKanban,
  Home,
  Menu,
  Moon,
  Pencil,
  Sparkles,
  Sun,
  User,
  Wrench,
  X,
} from "lucide-react";
import { ThemeMode } from "../hooks/useTheme";
import { LabView } from "../types/lab";
import { SaoAvatar } from "./SaoAvatar";

interface NavbarProps {
  activeView: LabView;
  onNavigate: (view: LabView) => void;
  studentName: string;
  onStudentNameChange: (value: string) => void;
  onOpenCredits: () => void;
  onOpenGuide: () => void;
  theme: ThemeMode;
  onToggleTheme: () => void;
}

const NAV_ITEMS: {
  id: LabView;
  label: string;
  subtitle: string;
  icon: typeof Home;
}[] = [
  {
    id: "inicio",
    label: "Inicio / Diagnóstico",
    subtitle: "Ciclo de 5 pasos y diagnóstico inicial",
    icon: Home,
  },
  {
    id: "retos",
    label: "Banco de Retos",
    subtitle: "6 retos progresivos y Reto Libre",
    icon: BookOpen,
  },
  {
    id: "mesa",
    label: "Actividad del Reto",
    subtitle: "Espacio del reto activo o Reto Libre",
    icon: Wrench,
  },
  {
    id: "bitacora",
    label: "Portafolio de Iteraciones",
    subtitle: "Historial de resultados y exportación",
    icon: FolderKanban,
  },
];

export function Navbar({
  activeView,
  onNavigate,
  studentName,
  onStudentNameChange,
  onOpenCredits,
  onOpenGuide,
  theme,
  onToggleTheme,
}: NavbarProps) {
  const [isEditingName, setIsEditingName] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  const dropdownRef = useRef<HTMLDivElement>(null);
  const menuButtonRef = useRef<HTMLButtonElement>(null);
  const nameInputRef = useRef<HTMLInputElement>(null);

  const trimmedName = studentName.trim();
  const isDark = theme === "dark";

  // Cerrar menú al hacer clic fuera o presionar Escape
  useEffect(() => {
    if (!menuOpen) return;

    const handlePointerDown = (event: MouseEvent | TouchEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setMenuOpen(false);
      }
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setMenuOpen(false);
        menuButtonRef.current?.focus();
      }
    };

    document.addEventListener("mousedown", handlePointerDown);
    document.addEventListener("touchstart", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
      document.removeEventListener("touchstart", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [menuOpen]);

  const startEditingName = () => {
    setMenuOpen(false);
    setIsEditingName(true);
    requestAnimationFrame(() => {
      nameInputRef.current?.focus();
      nameInputRef.current?.select();
    });
  };

  const handleSelectView = (view: LabView) => {
    setMenuOpen(false);
    onNavigate(view);
  };

  const handleOpenGuideFromMenu = () => {
    setMenuOpen(false);
    onOpenGuide();
  };

  const handleOpenCreditsFromMenu = () => {
    setMenuOpen(false);
    onOpenCredits();
  };

  return (
    <header className="sticky top-0 z-40 bg-white dark:bg-[#1E293B] border-b border-[#CBD5E1] dark:border-[#334155] transition-colors">
      {/* Cinta superior institucional UAGRM */}
      <div
        aria-hidden="true"
        className="h-1 w-full bg-gradient-to-r from-[#1E3A5F] via-[#1E3A5F] to-[#8B1E24]"
      />
      <div className="max-w-[1360px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="min-h-16 py-2 sm:py-0 flex items-center justify-between gap-3">
          {/* Izquierda: Identidad ASCENDIA + SAÓ, estudiante activo y estado de guardado */}
          <div className="flex flex-wrap sm:flex-nowrap items-center gap-x-3 gap-y-1.5 min-w-0">
            <div className="flex items-center gap-2 shrink-0">
              <button
                type="button"
                onClick={onOpenGuide}
                title="Abrir Guía de SAÓ"
                aria-label="Abrir Guía de SAÓ"
                className="w-8 h-7 sm:w-9 sm:h-8 flex items-center justify-center rounded-md hover:bg-[#F5F7FA] dark:hover:bg-[#0F172A] transition-colors shrink-0 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#1E3A5F] dark:focus-visible:outline-[#60A5FA]"
              >
                <SaoAvatar className="w-8 sm:w-9" />
              </button>
              <button
                type="button"
                onClick={() => onNavigate("inicio")}
                className="font-display text-base sm:text-lg font-bold tracking-tight text-[#1E3A5F] dark:text-[#F1F5F9] whitespace-nowrap shrink-0 hover:text-[#8B1E24] dark:hover:text-[#F87171] transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#1E3A5F] dark:focus-visible:outline-[#60A5FA] rounded"
              >
                ASCENDIA
              </button>
            </div>

            <span
              aria-hidden="true"
              className="hidden sm:block h-5 w-px bg-[#CBD5E1] dark:bg-[#334155] shrink-0"
            />

            {/* Estudiante activo + estado de guardado */}
            <div className="flex items-center gap-2 min-w-0">
              {isEditingName || !trimmedName ? (
                <div className="flex items-center gap-1.5 border border-[#CBD5E1] dark:border-[#334155] bg-[#F5F7FA] dark:bg-[#0F172A] focus-within:bg-white dark:focus-within:bg-[#0F172A] focus-within:border-[#1E3A5F] dark:focus-within:border-[#60A5FA] rounded-lg px-2.5 py-1 sm:py-1.5 transition-colors">
                  <User
                    className="w-3.5 h-3.5 text-[#1E3A5F] dark:text-[#60A5FA] shrink-0"
                    aria-hidden="true"
                  />
                  <label htmlFor="student-code-input" className="sr-only">
                    Nombre o código del estudiante
                  </label>
                  <input
                    ref={nameInputRef}
                    id="student-code-input"
                    type="text"
                    value={studentName}
                    onChange={(e) => onStudentNameChange(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && trimmedName) {
                        setIsEditingName(false);
                      }
                      if (e.key === "Escape" && trimmedName) {
                        setIsEditingName(false);
                      }
                    }}
                    onBlur={() => {
                      if (trimmedName) setIsEditingName(false);
                    }}
                    placeholder="Tu nombre / código"
                    maxLength={60}
                    autoFocus={isEditingName}
                    className="w-28 sm:w-44 bg-transparent text-xs sm:text-sm text-[#0F172A] dark:text-[#F1F5F9] placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none"
                  />
                  {trimmedName && (
                    <button
                      type="button"
                      onClick={() => setIsEditingName(false)}
                      aria-label="Confirmar nombre"
                      className="text-xs font-semibold text-[#1E3A5F] dark:text-[#60A5FA] hover:text-[#8B1E24] dark:hover:text-[#F87171] whitespace-nowrap shrink-0"
                    >
                      Listo
                    </button>
                  )}
                </div>
              ) : (
                <button
                  type="button"
                  onClick={startEditingName}
                  title="Cambiar nombre del estudiante"
                  className="inline-flex items-center gap-1.5 px-2.5 py-1 sm:py-1.5 bg-[#F5F7FA] dark:bg-[#0F172A] hover:bg-slate-200/70 dark:hover:bg-[#334155]/60 border border-[#CBD5E1] dark:border-[#334155] rounded-lg text-xs sm:text-sm font-medium text-[#1E3A5F] dark:text-[#F1F5F9] transition-colors max-w-[140px] sm:max-w-[210px] min-w-0 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#1E3A5F] dark:focus-visible:outline-[#60A5FA]"
                >
                  <User
                    className="w-3.5 h-3.5 text-[#1E3A5F] dark:text-[#60A5FA] shrink-0"
                    aria-hidden="true"
                  />
                  <span className="truncate">{trimmedName}</span>
                  <Pencil
                    className="w-3 h-3 text-slate-500 dark:text-slate-400 shrink-0"
                    aria-hidden="true"
                  />
                </button>
              )}

              <span className="inline-flex items-center gap-1 text-[11px] sm:text-xs font-medium text-emerald-700 dark:text-emerald-400 whitespace-nowrap shrink-0">
                <Check className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
                <span className="hidden md:inline">Progreso guardado</span>
                <span className="md:hidden">Guardado</span>
              </span>
            </div>
          </div>

          {/* Derecha: Botón visible de Modo Claro/Oscuro + Botón único de Menú */}
          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={onToggleTheme}
              aria-pressed={isDark}
              aria-label={
                isDark ? "Cambiar a Modo Claro" : "Cambiar a Modo Oscuro"
              }
              title={isDark ? "Cambiar a Modo Claro" : "Cambiar a Modo Oscuro"}
              className="inline-flex items-center gap-1.5 px-2.5 sm:px-3 py-2 rounded-lg border border-[#CBD5E1] dark:border-[#334155] bg-[#F5F7FA] dark:bg-[#0F172A] hover:border-[#1E3A5F] dark:hover:border-[#60A5FA] hover:bg-slate-200/60 dark:hover:bg-[#334155]/60 text-xs font-semibold text-[#1E3A5F] dark:text-[#F1F5F9] transition-colors whitespace-nowrap shrink-0 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#1E3A5F] dark:focus-visible:outline-[#60A5FA]"
            >
              {isDark ? (
                <>
                  <Sun
                    className="w-4 h-4 text-amber-400 shrink-0"
                    aria-hidden="true"
                  />
                  <span className="hidden sm:inline">Modo Claro</span>
                </>
              ) : (
                <>
                  <Moon
                    className="w-4 h-4 text-[#1E3A5F] shrink-0"
                    aria-hidden="true"
                  />
                  <span className="hidden sm:inline">Modo Oscuro</span>
                </>
              )}
            </button>

            <div ref={dropdownRef} className="relative shrink-0">
              <button
                ref={menuButtonRef}
                type="button"
                onClick={() => setMenuOpen((prev) => !prev)}
                aria-expanded={menuOpen}
                aria-haspopup="menu"
                aria-controls="ascendia-main-menu"
                className={`inline-flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs sm:text-sm font-semibold border transition-colors whitespace-nowrap shrink-0 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#1E3A5F] dark:focus-visible:outline-[#60A5FA] ${
                  menuOpen
                    ? "bg-[#8B1E24] dark:bg-[#C93B44] text-white border-[#8B1E24] dark:border-[#C93B44]"
                    : "bg-[#1E3A5F] dark:bg-[#2B4F7E] text-white border-[#1E3A5F] dark:border-[#60A5FA]/60 hover:bg-[#152B47] dark:hover:bg-[#356199]"
                }`}
              >
                {menuOpen ? (
                  <X className="w-4 h-4 shrink-0" aria-hidden="true" />
                ) : (
                  <Menu className="w-4 h-4 shrink-0" aria-hidden="true" />
                )}
                <span>Menú</span>
                <ChevronDown
                  className={`w-4 h-4 shrink-0 transition-transform duration-150 ${
                    menuOpen ? "rotate-180" : ""
                  }`}
                  aria-hidden="true"
                />
              </button>

            {menuOpen && (
              <div
                id="ascendia-main-menu"
                role="menu"
                aria-label="Menú principal de ASCENDIA"
                className="absolute right-0 mt-2 w-72 sm:w-80 max-w-[calc(100vw-2rem)] bg-white dark:bg-[#1E293B] border border-[#CBD5E1] dark:border-[#334155] rounded-xl shadow-xl py-2 z-50"
              >
                {/* Grupo 1: Vistas principales */}
                <div className="px-3 py-1.5">
                  <p className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                    Navegación del Laboratorio
                  </p>
                </div>

                <div className="px-1.5 space-y-0.5">
                  {NAV_ITEMS.map((item) => {
                    const Icon = item.icon;
                    const isActive = activeView === item.id;
                    return (
                      <button
                        key={item.id}
                        type="button"
                        role="menuitem"
                        aria-current={isActive ? "page" : undefined}
                        onClick={() => handleSelectView(item.id)}
                        className={`w-full flex items-start gap-3 px-3 py-2.5 rounded-lg text-left transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#1E3A5F] dark:focus-visible:outline-[#60A5FA] ${
                          isActive
                            ? "bg-[#1E3A5F]/10 dark:bg-[#2B4F7E]/30 text-[#1E3A5F] dark:text-[#60A5FA]"
                            : "text-[#0F172A] dark:text-[#F1F5F9] hover:bg-[#F5F7FA] dark:hover:bg-[#0F172A]"
                        }`}
                      >
                        <Icon
                          className={`w-4 h-4 mt-0.5 shrink-0 ${
                            isActive
                              ? "text-[#8B1E24] dark:text-[#F87171]"
                              : "text-[#1E3A5F] dark:text-[#60A5FA]"
                          }`}
                          aria-hidden="true"
                        />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between gap-2">
                            <span className="text-sm font-semibold truncate">
                              {item.label}
                            </span>
                            {isActive && (
                              <span className="text-[11px] font-bold text-[#8B1E24] dark:text-[#F87171] shrink-0">
                                Activa
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-slate-500 dark:text-slate-400 truncate">
                            {item.subtitle}
                          </p>
                        </div>
                      </button>
                    );
                  })}
                </div>

                <div className="my-2 border-t border-[#E2E8F0] dark:border-[#334155]" />

                {/* Grupo 2: Herramientas, Apariencia, Perfil y Créditos */}
                <div className="px-3 py-1">
                  <p className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                    Herramientas y Perfil
                  </p>
                </div>

                <div className="px-1.5 space-y-0.5">
                  <button
                    type="button"
                    role="menuitem"
                    aria-current={activeView === "constructor" ? "page" : undefined}
                    onClick={() => handleSelectView("constructor")}
                    className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left text-sm font-medium transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#1E3A5F] dark:focus-visible:outline-[#60A5FA] ${
                      activeView === "constructor"
                        ? "bg-[#1E3A5F]/10 dark:bg-[#2B4F7E]/30 text-[#1E3A5F] dark:text-[#60A5FA]"
                        : "text-[#0F172A] dark:text-[#F1F5F9] hover:bg-[#F5F7FA] dark:hover:bg-[#0F172A]"
                    }`}
                  >
                    <Blocks
                      className="w-4 h-4 text-[#1E3A5F] dark:text-[#60A5FA] shrink-0"
                      aria-hidden="true"
                    />
                    <span className="flex-1">Constructor por Bloques</span>
                  </button>

                  <button
                    type="button"
                    role="menuitem"
                    onClick={handleOpenGuideFromMenu}
                    className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left text-sm font-medium text-[#0F172A] dark:text-[#F1F5F9] hover:bg-[#F5F7FA] dark:hover:bg-[#0F172A] transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#1E3A5F] dark:focus-visible:outline-[#60A5FA]"
                  >
                    <Sparkles
                      className="w-4 h-4 text-[#8B1E24] dark:text-[#F87171] shrink-0"
                      aria-hidden="true"
                    />
                    <span className="flex-1">Guía de SAÓ</span>
                    <Compass
                      className="w-3.5 h-3.5 text-slate-400 dark:text-slate-500 shrink-0"
                      aria-hidden="true"
                    />
                  </button>

                  <button
                    type="button"
                    role="menuitem"
                    onClick={startEditingName}
                    className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left text-sm font-medium text-[#0F172A] dark:text-[#F1F5F9] hover:bg-[#F5F7FA] dark:hover:bg-[#0F172A] transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#1E3A5F] dark:focus-visible:outline-[#60A5FA]"
                  >
                    <Pencil
                      className="w-4 h-4 text-[#1E3A5F] dark:text-[#60A5FA] shrink-0"
                      aria-hidden="true"
                    />
                    <span className="flex-1">Cambiar Nombre</span>
                  </button>

                  <button
                    type="button"
                    role="menuitem"
                    onClick={handleOpenCreditsFromMenu}
                    className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left text-sm font-medium text-[#0F172A] dark:text-[#F1F5F9] hover:bg-[#F5F7FA] dark:hover:bg-[#0F172A] transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#1E3A5F] dark:focus-visible:outline-[#60A5FA]"
                  >
                    <Award
                      className="w-4 h-4 text-[#8B1E24] dark:text-[#F87171] shrink-0"
                      aria-hidden="true"
                    />
                    <span className="flex-1">Créditos</span>
                  </button>
                </div>
              </div>
            )}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
