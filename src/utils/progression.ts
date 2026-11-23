import { ChallengeProgress, ChallengeStatus } from "../types/lab";

export const BASIC_CHALLENGE_IDS = ["reto-1", "reto-2"] as const;
export const INTERMEDIATE_CHALLENGE_IDS = ["reto-3", "reto-4"] as const;
export const ADVANCED_CHALLENGE_IDS = ["reto-5", "reto-6"] as const;
export const FREE_CHALLENGE_ID = "reto-libre";

export const STRUCTURED_CHALLENGE_IDS: readonly string[] = [
  ...BASIC_CHALLENGE_IDS,
  ...INTERMEDIATE_CHALLENGE_IDS,
  ...ADVANCED_CHALLENGE_IDS,
];

export function isBasicLevelCompleted(
  challenges: Record<string, ChallengeProgress>
): boolean {
  return BASIC_CHALLENGE_IDS.every((id) => Boolean(challenges[id]?.completed));
}

export function isIntermediateLevelCompleted(
  challenges: Record<string, ChallengeProgress>
): boolean {
  return (
    isBasicLevelCompleted(challenges) &&
    INTERMEDIATE_CHALLENGE_IDS.every((id) => Boolean(challenges[id]?.completed))
  );
}

export function isFormativeSequenceCompleted(
  challenges: Record<string, ChallengeProgress>
): boolean {
  return STRUCTURED_CHALLENGE_IDS.every((id) =>
    Boolean(challenges[id]?.completed)
  );
}

export function isChallengeUnlocked(
  challengeId: string,
  challenges: Record<string, ChallengeProgress>
): boolean {
  if (challengeId === FREE_CHALLENGE_ID) {
    return true;
  }

  if ((BASIC_CHALLENGE_IDS as readonly string[]).includes(challengeId)) {
    return true;
  }

  // Compatibilidad retroactiva: si un usuario ya había completado un reto
  // previamente, conserva el acceso para consultarlo o practicar de nuevo.
  if (challenges[challengeId]?.completed) {
    return true;
  }

  if ((INTERMEDIATE_CHALLENGE_IDS as readonly string[]).includes(challengeId)) {
    return isBasicLevelCompleted(challenges);
  }

  if ((ADVANCED_CHALLENGE_IDS as readonly string[]).includes(challengeId)) {
    return isIntermediateLevelCompleted(challenges);
  }

  return false;
}

export function getUnlockRequirementMessage(challengeId: string): string | null {
  if ((INTERMEDIATE_CHALLENGE_IDS as readonly string[]).includes(challengeId)) {
    return "Aprueba Reto 01 y Reto 02 (Nivel Básico) para desbloquear";
  }
  if ((ADVANCED_CHALLENGE_IDS as readonly string[]).includes(challengeId)) {
    return "Aprueba Reto 03 y Reto 04 (Nivel Intermedio) para desbloquear";
  }
  return null;
}

export function hasChallengeProgressStarted(
  progress?: ChallengeProgress
): boolean {
  if (!progress) return false;
  if (progress.versions.length > 0) return true;
  if (progress.activityResult) return true;
  if (
    progress.activityState &&
    Object.keys(progress.activityState).length > 0
  ) {
    return true;
  }
  return (
    Object.values(progress.draftBlocks).some((v) => v.trim().length > 0) ||
    progress.draftResponse.trim().length > 0
  );
}

export function resolveChallengeStatus(
  challengeId: string,
  challenges: Record<string, ChallengeProgress>
): ChallengeStatus {
  const progress = challenges[challengeId];
  if (progress?.completed) return "Completado";
  if (!isChallengeUnlocked(challengeId, challenges)) return "Bloqueado";
  return hasChallengeProgressStarted(progress) ? "En progreso" : "Disponible";
}

export interface NextChallengeResolution {
  nextChallengeId: string | null;
  isFinalStructuredChallenge: boolean;
  unlockedNewLevel: "Intermedio" | "Avanzado" | null;
}

export function getNextChallengeAfterCompletion(
  completedChallengeId: string,
  challenges: Record<string, ChallengeProgress>
): NextChallengeResolution {
  const currentIdx = STRUCTURED_CHALLENGE_IDS.indexOf(completedChallengeId);
  if (currentIdx === -1) {
    return {
      nextChallengeId: null,
      isFinalStructuredChallenge: false,
      unlockedNewLevel: null,
    };
  }

  if (completedChallengeId === "reto-6") {
    return {
      nextChallengeId: null,
      isFinalStructuredChallenge: true,
      unlockedNewLevel: null,
    };
  }

  // Buscar el siguiente reto desbloqueado en orden secuencial
  for (let i = currentIdx + 1; i < STRUCTURED_CHALLENGE_IDS.length; i++) {
    const candidateId = STRUCTURED_CHALLENGE_IDS[i];
    if (isChallengeUnlocked(candidateId, challenges)) {
      let unlockedNewLevel: "Intermedio" | "Avanzado" | null = null;
      if (candidateId === "reto-3" && completedChallengeId === "reto-2") {
        unlockedNewLevel = "Intermedio";
      } else if (
        candidateId === "reto-5" &&
        completedChallengeId === "reto-4"
      ) {
        unlockedNewLevel = "Avanzado";
      }
      return {
        nextChallengeId: candidateId,
        isFinalStructuredChallenge: false,
        unlockedNewLevel,
      };
    }
  }

  // Si el siguiente nivel aún requiere completar el otro reto del nivel actual,
  // dirigir al reto pendiente desbloqueado.
  for (const candidateId of STRUCTURED_CHALLENGE_IDS) {
    if (
      candidateId !== completedChallengeId &&
      isChallengeUnlocked(candidateId, challenges) &&
      !challenges[candidateId]?.completed
    ) {
      return {
        nextChallengeId: candidateId,
        isFinalStructuredChallenge: false,
        unlockedNewLevel: null,
      };
    }
  }

  return {
    nextChallengeId: null,
    isFinalStructuredChallenge: false,
    unlockedNewLevel: null,
  };
}
