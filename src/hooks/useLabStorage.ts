import { useCallback, useEffect, useRef, useState } from "react";
import { CHALLENGES, EMPTY_BLOCKS } from "../data/challenges";
import {
  ChallengeActivityResult,
  ChallengeProgress,
  ChallengeStatus,
  ComplianceRating,
  ConstructorDraft,
  CriticalEvaluation,
  CustomChallengeMeta,
  FitRating,
  HallucinationRating,
  IterationVersion,
  LabStorageState,
  PromptBlocks,
} from "../types/lab";
import { assemblePrompt } from "../utils/promptBuilder";
import {
  hasChallengeProgressStarted,
  isChallengeUnlocked,
} from "../utils/progression";

const STORAGE_KEY = "laboratorio_prompts_state_v1";
export const LAB_SCHEMA_VERSION = 2;

const VALID_COMPLIANCE: ReadonlySet<string> = new Set(["si", "parcial", "no", ""]);
const VALID_HALLUCINATION: ReadonlySet<string> = new Set([
  "si",
  "parcial",
  "no",
  "ninguno",
  "menores",
  "graves",
  "",
]);
const VALID_FIT: ReadonlySet<string> = new Set([
  "si",
  "parcial",
  "no",
  "adecuado",
  "ajustar",
  "",
]);

function createEmptyConstructorDraft(): ConstructorDraft {
  return {
    blocks: { ...EMPTY_BLOCKS },
    response: "",
    sourceMode: "manual",
  };
}

function sanitizeBlocks(raw: unknown): PromptBlocks {
  if (!raw || typeof raw !== "object") {
    return { ...EMPTY_BLOCKS };
  }
  const obj = raw as Record<string, unknown>;
  return {
    rol: typeof obj.rol === "string" ? obj.rol : "",
    contexto: typeof obj.contexto === "string" ? obj.contexto : "",
    tarea: typeof obj.tarea === "string" ? obj.tarea : "",
    restricciones: typeof obj.restricciones === "string" ? obj.restricciones : "",
    formato: typeof obj.formato === "string" ? obj.formato : "",
  };
}

function createEmptyEvaluation(criteriaCount: number): CriticalEvaluation {
  return {
    cumplioRestricciones: "",
    alucinacionesOSesgos: "",
    nivelYFormatoAdecuados: "",
    criteriosVerificados: Array.from({ length: criteriaCount }, () => false),
    notasReflexion: "",
    aspectosPositivos: "",
    erroresOLimitaciones: "",
    informacionAVerificar: "",
    cambiosInstruccion: "",
    justificacionModificaciones: "",
  };
}

function sanitizeEvaluation(
  raw: unknown,
  criteriaCount: number
): CriticalEvaluation {
  const base = createEmptyEvaluation(criteriaCount);
  if (!raw || typeof raw !== "object") return base;
  const obj = raw as Record<string, unknown>;

  const cumplio =
    typeof obj.cumplioRestricciones === "string" &&
    VALID_COMPLIANCE.has(obj.cumplioRestricciones)
      ? (obj.cumplioRestricciones as ComplianceRating | "")
      : "";
  const aluc =
    typeof obj.alucinacionesOSesgos === "string" &&
    VALID_HALLUCINATION.has(obj.alucinacionesOSesgos)
      ? (obj.alucinacionesOSesgos as HallucinationRating | "")
      : "";
  const fit =
    typeof obj.nivelYFormatoAdecuados === "string" &&
    VALID_FIT.has(obj.nivelYFormatoAdecuados)
      ? (obj.nivelYFormatoAdecuados as FitRating | "")
      : "";

  const verified = Array.isArray(obj.criteriosVerificados)
    ? Array.from({ length: criteriaCount }, (_, idx) =>
        Boolean(
          obj.criteriosVerificados &&
            (obj.criteriosVerificados as unknown[])[idx]
        )
      )
    : base.criteriosVerificados;

  return {
    cumplioRestricciones: cumplio,
    alucinacionesOSesgos: aluc,
    nivelYFormatoAdecuados: fit,
    criteriosVerificados: verified,
    notasReflexion:
      typeof obj.notasReflexion === "string" ? obj.notasReflexion : "",
    aspectosPositivos:
      typeof obj.aspectosPositivos === "string" ? obj.aspectosPositivos : "",
    erroresOLimitaciones:
      typeof obj.erroresOLimitaciones === "string"
        ? obj.erroresOLimitaciones
        : "",
    informacionAVerificar:
      typeof obj.informacionAVerificar === "string"
        ? obj.informacionAVerificar
        : "",
    cambiosInstruccion:
      typeof obj.cambiosInstruccion === "string" ? obj.cambiosInstruccion : "",
    justificacionModificaciones:
      typeof obj.justificacionModificaciones === "string"
        ? obj.justificacionModificaciones
        : "",
  };
}

function sanitizeVersions(
  raw: unknown,
  challengeId: string,
  criteriaCount: number
): IterationVersion[] {
  if (!Array.isArray(raw)) return [];
  const valid: IterationVersion[] = [];

  for (let i = 0; i < raw.length; i++) {
    const item = raw[i];
    if (!item || typeof item !== "object") continue;
    const obj = item as Record<string, unknown>;
    const blocks = sanitizeBlocks(obj.blocks);
    const versionNumber =
      typeof obj.versionNumber === "number" && Number.isFinite(obj.versionNumber)
        ? obj.versionNumber
        : valid.length + 1;

    valid.push({
      id:
        typeof obj.id === "string" && obj.id.trim()
          ? obj.id
          : `${challengeId}-v${versionNumber}-${i}`,
      versionNumber,
      createdAt:
        typeof obj.createdAt === "string" && obj.createdAt
          ? obj.createdAt
          : new Date().toISOString(),
      blocks,
      assembledPrompt:
        typeof obj.assembledPrompt === "string"
          ? obj.assembledPrompt
          : assemblePrompt(blocks),
      executedPrompt:
        typeof obj.executedPrompt === "string" ? obj.executedPrompt : undefined,
      aiResponse: typeof obj.aiResponse === "string" ? obj.aiResponse : "",
      sourceMode: obj.sourceMode === "live_gemini" ? "live_gemini" : "manual",
      aiProvider:
        typeof obj.aiProvider === "string" ? obj.aiProvider : undefined,
      aiModel: typeof obj.aiModel === "string" ? obj.aiModel : undefined,
      evaluation: sanitizeEvaluation(obj.evaluation, criteriaCount),
    });
  }

  return valid;
}

function sanitizeActivityResult(
  raw: unknown
): ChallengeActivityResult | undefined {
  if (!raw || typeof raw !== "object") return undefined;
  const obj = raw as Record<string, unknown>;
  if (
    typeof obj.approved !== "boolean" ||
    typeof obj.score !== "number" ||
    typeof obj.maxScore !== "number"
  ) {
    return undefined;
  }
  return {
    approved: obj.approved,
    score: obj.score,
    maxScore: obj.maxScore,
    resultLabel:
      typeof obj.resultLabel === "string"
        ? obj.resultLabel
        : `${obj.score} de ${obj.maxScore}`,
    competence: typeof obj.competence === "string" ? obj.competence : "",
    saoMessage: typeof obj.saoMessage === "string" ? obj.saoMessage : "",
    feedbackSummary:
      typeof obj.feedbackSummary === "string" ? obj.feedbackSummary : "",
    evaluatedAt:
      typeof obj.evaluatedAt === "string" && obj.evaluatedAt
        ? obj.evaluatedAt
        : new Date().toISOString(),
  };
}

function sanitizeActivityState(
  raw: unknown
): Record<string, unknown> | undefined {
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) return undefined;
  return raw as Record<string, unknown>;
}

function sanitizeConstructorDraft(raw: unknown): ConstructorDraft {
  if (!raw || typeof raw !== "object") {
    return createEmptyConstructorDraft();
  }
  const obj = raw as Record<string, unknown>;
  return {
    blocks: sanitizeBlocks(obj.blocks),
    executedPrompt:
      typeof obj.executedPrompt === "string" ? obj.executedPrompt : undefined,
    response: typeof obj.response === "string" ? obj.response : "",
    sourceMode: obj.sourceMode === "live_gemini" ? "live_gemini" : "manual",
    provider: typeof obj.provider === "string" ? obj.provider : undefined,
    model: typeof obj.model === "string" ? obj.model : undefined,
  };
}

function createInitialChallengeProgress(challengeId: string): ChallengeProgress {
  const def = CHALLENGES.find((c) => c.id === challengeId);
  const criteriaCount = def ? def.criterios.length : 3;
  return {
    challengeId,
    completed: false,
    draftBlocks: { ...EMPTY_BLOCKS },
    draftResponse: "",
    draftSourceMode: "manual",
    draftEvaluation: createEmptyEvaluation(criteriaCount),
    versions: [],
  };
}

function createInitialState(): LabStorageState {
  const challenges: Record<string, ChallengeProgress> = {};
  for (const ch of CHALLENGES) {
    challenges[ch.id] = createInitialChallengeProgress(ch.id);
  }
  return {
    schemaVersion: LAB_SCHEMA_VERSION,
    studentName: "",
    hasSeenGuide: false,
    diagnostic: {
      selectedIds: [],
      validated: false,
      isPerfect: false,
    },
    activeChallengeId: CHALLENGES[0].id,
    challenges,
    constructorDraft: createEmptyConstructorDraft(),
  };
}

export function migrateLabStorageState(
  rawParsed: unknown
): LabStorageState {
  const fallback = createInitialState();
  if (!rawParsed || typeof rawParsed !== "object") return fallback;

  const parsed = rawParsed as Partial<LabStorageState>;
  const mergedChallenges: Record<string, ChallengeProgress> = {
    ...fallback.challenges,
  };

  if (parsed.challenges && typeof parsed.challenges === "object") {
    for (const ch of CHALLENGES) {
      const saved = parsed.challenges[ch.id];
      if (saved && typeof saved === "object") {
        const base = createInitialChallengeProgress(ch.id);
        const customMeta =
          saved.customMeta && typeof saved.customMeta === "object"
            ? {
                title:
                  typeof saved.customMeta.title === "string"
                    ? saved.customMeta.title
                    : "",
                objetivo:
                  typeof saved.customMeta.objetivo === "string"
                    ? saved.customMeta.objetivo
                    : "",
              }
            : undefined;

        mergedChallenges[ch.id] = {
          ...base,
          challengeId: ch.id,
          completed: Boolean(saved.completed),
          completedAt:
            typeof saved.completedAt === "string"
              ? saved.completedAt
              : undefined,
          customMeta,
          draftBlocks: sanitizeBlocks(saved.draftBlocks),
          draftExecutedPrompt:
            typeof saved.draftExecutedPrompt === "string"
              ? saved.draftExecutedPrompt
              : undefined,
          draftResponse:
            typeof saved.draftResponse === "string" ? saved.draftResponse : "",
          draftSourceMode:
            saved.draftSourceMode === "live_gemini" ? "live_gemini" : "manual",
          draftProvider:
            typeof saved.draftProvider === "string"
              ? saved.draftProvider
              : undefined,
          draftModel:
            typeof saved.draftModel === "string" ? saved.draftModel : undefined,
          draftEvaluation: sanitizeEvaluation(
            saved.draftEvaluation,
            ch.criterios.length
          ),
          versions: sanitizeVersions(
            saved.versions,
            ch.id,
            ch.criterios.length
          ),
          activityState: sanitizeActivityState(saved.activityState),
          activityResult: sanitizeActivityResult(saved.activityResult),
        };
      }
    }
  }

  const selectedIds = Array.isArray(parsed.diagnostic?.selectedIds)
    ? parsed.diagnostic.selectedIds.filter(
        (id): id is string => typeof id === "string"
      )
    : [];

  return {
    schemaVersion: LAB_SCHEMA_VERSION,
    lastSavedAt:
      typeof parsed.lastSavedAt === "string" ? parsed.lastSavedAt : undefined,
    studentName:
      typeof parsed.studentName === "string" ? parsed.studentName : "",
    hasSeenGuide:
      typeof parsed.hasSeenGuide === "boolean" ? parsed.hasSeenGuide : false,
    diagnostic: {
      selectedIds,
      validated: Boolean(parsed.diagnostic?.validated),
      isPerfect: Boolean(parsed.diagnostic?.isPerfect),
    },
    activeChallengeId:
      typeof parsed.activeChallengeId === "string" &&
      mergedChallenges[parsed.activeChallengeId] &&
      isChallengeUnlocked(parsed.activeChallengeId, mergedChallenges)
        ? parsed.activeChallengeId
        : fallback.activeChallengeId,
    challenges: mergedChallenges,
    constructorDraft: sanitizeConstructorDraft(parsed.constructorDraft),
  };
}

function loadStateFromStorage(): LabStorageState {
  const fallback = createInitialState();
  if (typeof window === "undefined") return fallback;

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return fallback;
    const parsed = JSON.parse(raw) as unknown;
    return migrateLabStorageState(parsed);
  } catch {
    return fallback;
  }
}

export function getChallengeStatus(
  progress?: ChallengeProgress,
  isUnlocked = true
): ChallengeStatus {
  if (progress?.completed) return "Completado";
  if (!isUnlocked) return "Bloqueado";
  return hasChallengeProgressStarted(progress) ? "En progreso" : "Disponible";
}

export function useLabStorage() {
  const [state, setState] = useState<LabStorageState>(() =>
    loadStateFromStorage()
  );
  const stateRef = useRef<LabStorageState>(state);
  stateRef.current = state;

  useEffect(() => {
    try {
      const payload: LabStorageState = {
        ...state,
        schemaVersion: LAB_SCHEMA_VERSION,
        lastSavedAt: new Date().toISOString(),
      };
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
    } catch {
      // Ignorar errores de cuota o modo privado en localStorage
    }
  }, [state]);

  const setStudentName = useCallback((studentName: string) => {
    setState((prev) => ({ ...prev, studentName }));
  }, []);

  const setHasSeenGuide = useCallback((hasSeenGuide: boolean) => {
    setState((prev) => ({ ...prev, hasSeenGuide }));
  }, []);

  const setActiveChallengeId = useCallback((activeChallengeId: string) => {
    setState((prev) => {
      if (
        !prev.challenges[activeChallengeId] ||
        !isChallengeUnlocked(activeChallengeId, prev.challenges)
      ) {
        return prev;
      }
      return { ...prev, activeChallengeId };
    });
  }, []);

  const updateDiagnostic = useCallback(
    (selectedIds: string[], validated: boolean, isPerfect: boolean) => {
      setState((prev) => ({
        ...prev,
        diagnostic: { selectedIds, validated, isPerfect },
      }));
    },
    []
  );

  const updateChallengeProgress = useCallback(
    (
      challengeId: string,
      updater: (current: ChallengeProgress) => ChallengeProgress
    ) => {
      setState((prev) => {
        const current =
          prev.challenges[challengeId] ??
          createInitialChallengeProgress(challengeId);
        return {
          ...prev,
          challenges: {
            ...prev.challenges,
            [challengeId]: updater(current),
          },
        };
      });
    },
    []
  );

  const updateDraftBlocks = useCallback(
    (challengeId: string, blocks: PromptBlocks) => {
      updateChallengeProgress(challengeId, (curr) => ({
        ...curr,
        draftBlocks: blocks,
      }));
    },
    [updateChallengeProgress]
  );

  const updateDraftResponse = useCallback(
    (
      challengeId: string,
      draftResponse: string,
      draftSourceMode?: "live_gemini" | "manual",
      meta?: { provider?: string; model?: string; executedPrompt?: string }
    ) => {
      updateChallengeProgress(challengeId, (curr) => ({
        ...curr,
        draftResponse,
        draftSourceMode: draftSourceMode ?? curr.draftSourceMode,
        draftProvider:
          meta && "provider" in meta ? meta.provider : curr.draftProvider,
        draftModel: meta && "model" in meta ? meta.model : curr.draftModel,
        draftExecutedPrompt:
          meta && "executedPrompt" in meta
            ? meta.executedPrompt
            : curr.draftExecutedPrompt,
      }));
    },
    [updateChallengeProgress]
  );

  const updateDraftExecutionMeta = useCallback(
    (
      challengeId: string,
      meta: {
        executedPrompt?: string;
        provider?: string;
        model?: string;
        sourceMode?: "live_gemini" | "manual";
      }
    ) => {
      updateChallengeProgress(challengeId, (curr) => ({
        ...curr,
        draftExecutedPrompt:
          "executedPrompt" in meta
            ? meta.executedPrompt
            : curr.draftExecutedPrompt,
        draftProvider:
          "provider" in meta ? meta.provider : curr.draftProvider,
        draftModel: "model" in meta ? meta.model : curr.draftModel,
        draftSourceMode: meta.sourceMode ?? curr.draftSourceMode,
      }));
    },
    [updateChallengeProgress]
  );

  const updateDraftEvaluation = useCallback(
    (challengeId: string, draftEvaluation: CriticalEvaluation) => {
      updateChallengeProgress(challengeId, (curr) => ({
        ...curr,
        draftEvaluation,
      }));
    },
    [updateChallengeProgress]
  );

  const updateCustomMeta = useCallback(
    (challengeId: string, customMeta: CustomChallengeMeta) => {
      updateChallengeProgress(challengeId, (curr) => ({
        ...curr,
        customMeta,
      }));
    },
    [updateChallengeProgress]
  );

  const resetDraftBlocks = useCallback(
    (challengeId: string) => {
      updateChallengeProgress(challengeId, (curr) => ({
        ...curr,
        draftBlocks: { ...EMPTY_BLOCKS },
      }));
    },
    [updateChallengeProgress]
  );

  const saveIterationAndRefine = useCallback(
    (challengeId: string): IterationVersion | null => {
      const currentProgress =
        stateRef.current.challenges[challengeId] ??
        createInitialChallengeProgress(challengeId);
      const nextNumber = currentProgress.versions.length + 1;
      const assembled = assemblePrompt(currentProgress.draftBlocks);
      const executed =
        currentProgress.draftExecutedPrompt?.trim() || assembled;

      const version: IterationVersion = {
        id: `${challengeId}-v${nextNumber}-${Date.now()}`,
        versionNumber: nextNumber,
        createdAt: new Date().toISOString(),
        blocks: { ...currentProgress.draftBlocks },
        assembledPrompt: assembled,
        executedPrompt: executed,
        aiResponse: currentProgress.draftResponse,
        sourceMode: currentProgress.draftSourceMode,
        aiProvider: currentProgress.draftProvider?.trim() || undefined,
        aiModel: currentProgress.draftModel?.trim() || undefined,
        evaluation: {
          ...currentProgress.draftEvaluation,
          criteriosVerificados: [
            ...currentProgress.draftEvaluation.criteriosVerificados,
          ],
        },
      };

      updateChallengeProgress(challengeId, (curr) => {
        const criteriaCount = curr.draftEvaluation.criteriosVerificados.length;
        return {
          ...curr,
          versions: [...curr.versions, version],
          draftExecutedPrompt: undefined,
          draftResponse: "",
          draftSourceMode: "manual",
          draftProvider: undefined,
          draftModel: undefined,
          draftEvaluation: {
            ...createEmptyEvaluation(criteriaCount),
            criteriosVerificados: [...curr.draftEvaluation.criteriosVerificados],
          },
        };
      });

      return version;
    },
    [updateChallengeProgress]
  );

  const markChallengeCompleted = useCallback(
    (challengeId: string, saveCurrentDraftAsVersion: boolean) => {
      updateChallengeProgress(challengeId, (curr) => {
        let versions = curr.versions;
        if (saveCurrentDraftAsVersion) {
          const assembled = assemblePrompt(curr.draftBlocks);
          const executed = curr.draftExecutedPrompt?.trim() || assembled;
          if (
            executed.trim().length > 0 ||
            curr.draftResponse.trim().length > 0
          ) {
            const nextNumber = curr.versions.length + 1;
            const version: IterationVersion = {
              id: `${challengeId}-v${nextNumber}-${Date.now()}`,
              versionNumber: nextNumber,
              createdAt: new Date().toISOString(),
              blocks: { ...curr.draftBlocks },
              assembledPrompt: assembled,
              executedPrompt: executed,
              aiResponse: curr.draftResponse,
              sourceMode: curr.draftSourceMode,
              aiProvider: curr.draftProvider?.trim() || undefined,
              aiModel: curr.draftModel?.trim() || undefined,
              evaluation: {
                ...curr.draftEvaluation,
                criteriosVerificados: [
                  ...curr.draftEvaluation.criteriosVerificados,
                ],
              },
            };
            versions = [...curr.versions, version];
          }
        }
        return {
          ...curr,
          versions,
          completed: true,
          completedAt: curr.completedAt ?? new Date().toISOString(),
        };
      });
    },
    [updateChallengeProgress]
  );

  const updateChallengeActivityState = useCallback(
    (challengeId: string, activityState: Record<string, unknown>) => {
      updateChallengeProgress(challengeId, (curr) => ({
        ...curr,
        activityState,
      }));
    },
    [updateChallengeProgress]
  );

  const saveChallengeActivityAttempt = useCallback(
    (
      challengeId: string,
      activityState: Record<string, unknown>,
      result: ChallengeActivityResult
    ) => {
      updateChallengeProgress(challengeId, (curr) => {
        // Si el reto ya estaba aprobado previamente, no degradar ni borrar el
        // resultado aprobado anterior cuando el estudiante practica un reintento.
        const preservePreviousApproved =
          curr.completed && !result.approved && curr.activityResult?.approved;

        return {
          ...curr,
          activityState,
          activityResult: preservePreviousApproved
            ? curr.activityResult
            : result,
          completed: curr.completed || result.approved,
          completedAt:
            curr.completed || result.approved
              ? curr.completedAt ?? result.evaluatedAt
              : curr.completedAt,
        };
      });
    },
    [updateChallengeProgress]
  );

  const reopenChallenge = useCallback(
    (challengeId: string) => {
      updateChallengeProgress(challengeId, (curr) => ({
        ...curr,
        completed: false,
      }));
    },
    [updateChallengeProgress]
  );

  const prepareChallengeRetry = useCallback(
    (challengeId: string) => {
      updateChallengeProgress(challengeId, (curr) => {
        const criteriaCount = curr.draftEvaluation.criteriosVerificados.length;
        return {
          ...curr,
          // Conserva completed, completedAt, activityResult aprobado y versions
          activityState: undefined,
          draftExecutedPrompt: undefined,
          draftResponse: "",
          draftSourceMode: "manual",
          draftProvider: undefined,
          draftModel: undefined,
          draftEvaluation: {
            ...createEmptyEvaluation(criteriaCount),
            criteriosVerificados: [...curr.draftEvaluation.criteriosVerificados],
          },
        };
      });
    },
    [updateChallengeProgress]
  );

  const loadVersionIntoDraft = useCallback(
    (challengeId: string, version: IterationVersion) => {
      updateChallengeProgress(challengeId, (curr) => ({
        ...curr,
        draftBlocks: { ...version.blocks },
        draftExecutedPrompt: version.executedPrompt,
        draftResponse: version.aiResponse,
        draftSourceMode: version.sourceMode,
        draftProvider: version.aiProvider,
        draftModel: version.aiModel,
        draftEvaluation: {
          ...version.evaluation,
          criteriosVerificados: [...version.evaluation.criteriosVerificados],
        },
      }));
    },
    [updateChallengeProgress]
  );

  const updateConstructorDraft = useCallback(
    (updater: (current: ConstructorDraft) => ConstructorDraft) => {
      setState((prev) => ({
        ...prev,
        constructorDraft: updater(
          prev.constructorDraft ?? createEmptyConstructorDraft()
        ),
      }));
    },
    []
  );

  const resetConstructorDraft = useCallback(() => {
    setState((prev) => ({
      ...prev,
      constructorDraft: createEmptyConstructorDraft(),
    }));
  }, []);

  const resetAllData = useCallback(() => {
    const fresh = createInitialState();
    setState(fresh);
  }, []);

  return {
    state,
    setStudentName,
    setHasSeenGuide,
    setActiveChallengeId,
    updateDiagnostic,
    updateDraftBlocks,
    updateDraftResponse,
    updateDraftExecutionMeta,
    updateDraftEvaluation,
    updateCustomMeta,
    resetDraftBlocks,
    saveIterationAndRefine,
    markChallengeCompleted,
    updateChallengeActivityState,
    saveChallengeActivityAttempt,
    reopenChallenge,
    prepareChallengeRetry,
    loadVersionIntoDraft,
    updateConstructorDraft,
    resetConstructorDraft,
    resetAllData,
  };
}
