export type LabView = "inicio" | "retos" | "mesa" | "constructor" | "bitacora";

export type ChallengeLevel = "Básico" | "Intermedio" | "Avanzado" | "Libre";

export type ChallengeStatus =
  | "Disponible"
  | "En progreso"
  | "Completado"
  | "Bloqueado";

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
  secuencia?: string[];
  competencia?: string;
}

export type SimpleEvaluationRating = "si" | "parcial" | "no";
export type ComplianceRating = SimpleEvaluationRating;
export type HallucinationRating =
  | SimpleEvaluationRating
  | "ninguno"
  | "menores"
  | "graves";
export type FitRating = SimpleEvaluationRating | "adecuado" | "ajustar";

export interface CriticalEvaluation {
  cumplioRestricciones: ComplianceRating | "";
  alucinacionesOSesgos: HallucinationRating | "";
  nivelYFormatoAdecuados: FitRating | "";
  criteriosVerificados: boolean[];
  notasReflexion: string;
  aspectosPositivos?: string;
  erroresOLimitaciones?: string;
  informacionAVerificar?: string;
  cambiosInstruccion?: string;
  justificacionModificaciones?: string;
}

export interface IterationVersion {
  id: string;
  versionNumber: number;
  createdAt: string;
  blocks: PromptBlocks;
  assembledPrompt: string;
  executedPrompt?: string;
  aiResponse: string;
  sourceMode: "live_gemini" | "manual";
  aiProvider?: string;
  aiModel?: string;
  evaluation: CriticalEvaluation;
}

export interface CustomChallengeMeta {
  title: string;
  objetivo: string;
}

export interface ChallengeActivityResult {
  approved: boolean;
  score: number;
  maxScore: number;
  resultLabel: string;
  competence: string;
  saoMessage: string;
  feedbackSummary: string;
  evaluatedAt: string;
}

export interface ChallengeProgress {
  challengeId: string;
  completed: boolean;
  completedAt?: string;
  customMeta?: CustomChallengeMeta;
  draftBlocks: PromptBlocks;
  draftExecutedPrompt?: string;
  draftResponse: string;
  draftSourceMode: "live_gemini" | "manual";
  draftProvider?: string;
  draftModel?: string;
  draftEvaluation: CriticalEvaluation;
  versions: IterationVersion[];
  activityState?: Record<string, unknown>;
  activityResult?: ChallengeActivityResult;
}

export interface ConstructorDraft {
  blocks: PromptBlocks;
  executedPrompt?: string;
  response: string;
  sourceMode: "live_gemini" | "manual";
  provider?: string;
  model?: string;
}

export interface DiagnosticState {
  selectedIds: string[];
  validated: boolean;
  isPerfect: boolean;
}

export interface LabStorageState {
  schemaVersion: number;
  lastSavedAt?: string;
  studentName: string;
  hasSeenGuide: boolean;
  diagnostic: DiagnosticState;
  activeChallengeId: string;
  challenges: Record<string, ChallengeProgress>;
  constructorDraft?: ConstructorDraft;
}

export interface CompletenessCheck {
  state: "completo" | "parcial" | "incompleto";
  label: string;
  detail: string;
  filledCount: number;
  missingEssentials: string[];
}
