import { useCallback, useEffect, useState } from "react";
import { CHALLENGES, EMPTY_BLOCKS } from "../data/challenges";
import {
  ChallengeProgress,
  ChallengeStatus,
  CriticalEvaluation,
  CustomChallengeMeta,
  IterationVersion,
  LabStorageState,
  PromptBlocks,
} from "../types/lab";
import { assemblePrompt } from "../utils/promptBuilder";

const STORAGE_KEY = "laboratorio_prompts_state_v1";

function createEmptyEvaluation(criteriaCount: number): CriticalEvaluation {
  return {
    cumplioRestricciones: "",
    alucinacionesOSesgos: "",
    nivelYFormatoAdecuados: "",
    criteriosVerificados: Array.from({ length: criteriaCount }, () => false),
    notasReflexion: "",
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
    const parsed = JSON.parse(raw) as Partial<LabStorageState>;

    const mergedChallenges: Record<string, ChallengeProgress> = {
      ...fallback.challenges,
    };

    if (parsed.challenges && typeof parsed.challenges === "object") {
      for (const ch of CHALLENGES) {
        const saved = parsed.challenges[ch.id];
        if (saved) {
          const base = createInitialChallengeProgress(ch.id);
          mergedChallenges[ch.id] = {
            ...base,
            ...saved,
            draftBlocks: { ...base.draftBlocks, ...(saved.draftBlocks || {}) },
            draftEvaluation: {
              ...base.draftEvaluation,
              ...(saved.draftEvaluation || {}),
              criteriosVerificados:
                saved.draftEvaluation?.criteriosVerificados?.length ===
                ch.criterios.length
                  ? saved.draftEvaluation.criteriosVerificados
                  : base.draftEvaluation.criteriosVerificados,
            },
            versions: Array.isArray(saved.versions) ? saved.versions : [],
          };
        }
      }
    }

    return {
      studentName: typeof parsed.studentName === "string" ? parsed.studentName : "",
      hasSeenGuide:
        typeof parsed.hasSeenGuide === "boolean" ? parsed.hasSeenGuide : false,
      diagnostic: {
        selectedIds: Array.isArray(parsed.diagnostic?.selectedIds)
          ? parsed.diagnostic.selectedIds
          : [],
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

  useEffect(() => {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch {
      // Ignorar errores de cuota de almacenamiento
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
      let createdVersion: IterationVersion | null = null;
      updateChallengeProgress(challengeId, (curr) => {
        const nextNumber = curr.versions.length + 1;
        const version: IterationVersion = {
          id: `${challengeId}-v${nextNumber}-${Date.now()}`,
          versionNumber: nextNumber,
          createdAt: new Date().toISOString(),
          blocks: { ...curr.draftBlocks },
          assembledPrompt: assemblePrompt(curr.draftBlocks),
          aiResponse: curr.draftResponse,
          sourceMode: curr.draftSourceMode,
          evaluation: {
            ...curr.draftEvaluation,
            criteriosVerificados: [...curr.draftEvaluation.criteriosVerificados],
          },
        };
        createdVersion = version;
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
      return createdVersion;
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
