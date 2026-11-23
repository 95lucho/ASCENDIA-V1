export type LabView = "inicio" | "retos" | "mesa" | "bitacora";

export type ChallengeLevel = "Básico" | "Intermedio" | "Avanzado" | "Libre";

export type ChallengeStatus = "Pendiente" | "En iteración" | "Completado";

export interface PromptBlocks {
  rol: string;
  contexto: string;
  tarea: string;
  restricciones: string;
  formato: string;
}

export interface ChallengeDefinition {
  id: string;
  orderLabel: string;
  title: string;
  level: ChallengeLevel;
  contexto: string;
  objetivo: string;
  bloquesClave: string[];
  criterios: string[];
  placeholders: PromptBlocks;
  esLibre?: boolean;
}

export type ComplianceRating = "si" | "parcial" | "no";
export type HallucinationRating = "ninguno" | "menores" | "graves";
export type FitRating = "adecuado" | "ajustar";

export interface CriticalEvaluation {
  cumplioRestricciones: ComplianceRating | "";
  alucinacionesOSesgos: HallucinationRating | "";
  nivelYFormatoAdecuados: FitRating | "";
  criteriosVerificados: boolean[];
  notasReflexion: string;
}

export interface IterationVersion {
  id: string;
  versionNumber: number;
  createdAt: string;
  blocks: PromptBlocks;
  assembledPrompt: string;
  aiResponse: string;
  sourceMode: "live_gemini" | "manual";
  evaluation: CriticalEvaluation;
}

export interface CustomChallengeMeta {
  title: string;
  objetivo: string;
}

export interface ChallengeProgress {
  challengeId: string;
  completed: boolean;
  completedAt?: string;
  customMeta?: CustomChallengeMeta;
  draftBlocks: PromptBlocks;
  draftResponse: string;
  draftSourceMode: "live_gemini" | "manual";
  draftEvaluation: CriticalEvaluation;
  versions: IterationVersion[];
}

export interface DiagnosticState {
  selectedIds: string[];
  validated: boolean;
  isPerfect: boolean;
}

export interface LabStorageState {
  studentName: string;
  hasSeenGuide: boolean;
  diagnostic: DiagnosticState;
  activeChallengeId: string;
  challenges: Record<string, ChallengeProgress>;
}

export interface CompletenessCheck {
  state: "completo" | "parcial" | "incompleto";
  label: string;
  detail: string;
  filledCount: number;
  missingEssentials: string[];
}
