import { useCallback, useEffect, useRef, useState } from "react";
import { CHALLENGES, EMPTY_BLOCKS } from "../data/challenges";
import {
  ChallengeProgress,
  ChallengeStatus,
  ComplianceRating,
  CriticalEvaluation,
  CustomChallengeMeta,
  FitRating,
  HallucinationRating,
  IterationVersion,
  LabStorageState,
  PromptBlocks,
} from "../types/lab";
import { assemblePrompt } from "../utils/promptBuilder";

const STORAGE_KEY = "laboratorio_prompts_state_v1";
export const LAB_SCHEMA_VERSION = 1;

const VALID_COMPLIANCE: ReadonlySet<string> = new Set(["si", "parcial", "no", ""]);
const VALID_HALLUCINATION: ReadonlySet<string> = new Set([
  "ninguno",
  "menores",
  "graves",
  "",
]);
const VALID_FIT: ReadonlySet<string> = new Set(["adecuado", "ajustar", ""]);

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
        Boolean(obj.criteriosVerificados && (obj.criteriosVerificados as unknown[])[idx])
      )
    : base.criteriosVerificados;

  return {
    cumplioRestricciones: cumplio,
    alucinacionesOSesgos: aluc,
    nivelYFormatoAdecuados: fit,
    criteriosVerificados: verified,
    notasReflexion:
      typeof obj.notasReflexion === "string" ? obj.notasReflexion : "",
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
      aiResponse: typeof obj.aiResponse === "string" ? obj.aiResponse : "",
      sourceMode: obj.sourceMode === "live_gemini" ? "live_gemini" : "manual",
      evaluation: sanitizeEvaluation(obj.evaluation, criteriaCount),
    });
  }

  return valid;
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
  };
}

function loadStateFromStorage(): LabStorageState {
  const fallback = createInitialState();
  if (typeof window === "undefined") return fallback;

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return fallback;

    const parsed = JSON.parse(raw) as Partial<LabStorageState> | null;
    if (!parsed || typeof parsed !== "object") return fallback;

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
            draftResponse:
              typeof saved.draftResponse === "string" ? saved.draftResponse : "",
            draftSourceMode:
              saved.draftSourceMode === "live_gemini" ? "live_gemini" : "manual",
            draftEvaluation: sanitizeEvaluation(
              saved.draftEvaluation,
              ch.criterios.length
            ),
            versions: sanitizeVersions(
              saved.versions,
              ch.id,
              ch.criterios.length
            ),
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
      studentName: typeof parsed.studentName === "string" ? parsed.studentName : "",
      hasSeenGuide:
        typeof parsed.hasSeenGuide === "boolean" ? parsed.hasSeenGuide : false,
      diagnostic: {
        selectedIds,
        validated: Boolean(parsed.diagnostic?.validated),
        isPerfect: Boolean(parsed.diagnostic?.isPerfect),
      },
      activeChallengeId:
        typeof parsed.activeChallengeId === "string" &&
        mergedChallenges[parsed.activeChallengeId]
          ? parsed.activeChallengeId
          : fallback.activeChallengeId,
      challenges: mergedChallenges,
    };
  } catch {
    return fallback;
  }
}

export function getChallengeStatus(progress?: ChallengeProgress): ChallengeStatus {
  if (!progress) return "Pendiente";
  if (progress.completed) return "Completado";
  if (progress.versions.length > 0) return "En iteración";
  const hasAnyDraft =
    Object.values(progress.draftBlocks).some((v) => v.trim().length > 0) ||
    progress.draftResponse.trim().length > 0;
  return hasAnyDraft ? "En iteración" : "Pendiente";
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
    setState((prev) => ({ ...prev, activeChallengeId }));
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
      draftSourceMode?: "live_gemini" | "manual"
    ) => {
      updateChallengeProgress(challengeId, (curr) => ({
        ...curr,
        draftResponse,
        draftSourceMode: draftSourceMode ?? curr.draftSourceMode,
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
      const version: IterationVersion = {
        id: `${challengeId}-v${nextNumber}-${Date.now()}`,
        versionNumber: nextNumber,
        createdAt: new Date().toISOString(),
        blocks: { ...currentProgress.draftBlocks },
        assembledPrompt: assemblePrompt(currentProgress.draftBlocks),
        aiResponse: currentProgress.draftResponse,
        sourceMode: currentProgress.draftSourceMode,
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
          // Conserva los bloques para facilitar el refinamiento en la versión siguiente,
          // pero limpia la respuesta y notas de evaluación para la nueva prueba.
          draftResponse: "",
          draftSourceMode: "manual",
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
          if (assembled.trim().length > 0 || curr.draftResponse.trim().length > 0) {
            const nextNumber = curr.versions.length + 1;
            const version: IterationVersion = {
              id: `${challengeId}-v${nextNumber}-${Date.now()}`,
              versionNumber: nextNumber,
              createdAt: new Date().toISOString(),
              blocks: { ...curr.draftBlocks },
              assembledPrompt: assembled,
              aiResponse: curr.draftResponse,
              sourceMode: curr.draftSourceMode,
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
          completedAt: new Date().toISOString(),
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

  const loadVersionIntoDraft = useCallback(
    (challengeId: string, version: IterationVersion) => {
      updateChallengeProgress(challengeId, (curr) => ({
        ...curr,
        draftBlocks: { ...version.blocks },
        draftResponse: version.aiResponse,
        draftSourceMode: version.sourceMode,
        draftEvaluation: {
          ...version.evaluation,
          criteriosVerificados: [...version.evaluation.criteriosVerificados],
        },
      }));
    },
    [updateChallengeProgress]
  );

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
    updateDraftEvaluation,
    updateCustomMeta,
    resetDraftBlocks,
    saveIterationAndRefine,
    markChallengeCompleted,
    reopenChallenge,
    loadVersionIntoDraft,
    resetAllData,
  };
}
