import { useEffect, useMemo, useState } from "react";
import {
  ChallengeActivityResult,
  ChallengeDefinition,
  ChallengeProgress,
  CriticalEvaluation,
  CustomChallengeMeta,
  IterationVersion,
  PromptBlocks,
} from "../types/lab";
import { assemblePrompt, evaluateCompleteness } from "../utils/promptBuilder";
import { resolveChallengeStatus } from "../utils/progression";
import { Challenge1IdentifyParts } from "./challenges/Challenge1IdentifyParts";
import { Challenge2DetectEffective } from "./challenges/Challenge2DetectEffective";
import { Challenge3FindErrors } from "./challenges/Challenge3FindErrors";
import { Challenge4AnalyzeResponse } from "./challenges/Challenge4AnalyzeResponse";
import { Challenge5SolveCase } from "./challenges/Challenge5SolveCase";
import { Challenge6AuditExperience } from "./challenges/Challenge6AuditExperience";
import { AiExecutionPanel } from "./workbench/AiExecutionPanel";
import { ChallengeHeader } from "./workbench/ChallengeHeader";
import { CriticalEvaluationPanel } from "./workbench/CriticalEvaluationPanel";
import { PromptBlockBuilder } from "./workbench/PromptBlockBuilder";
import { VersionComparatorModal } from "./workbench/VersionComparatorModal";

interface WorkbenchViewProps {
  challenge: ChallengeDefinition;
  progress: ChallengeProgress;
  allChallengesProgress: Record<string, ChallengeProgress>;
  onSelectChallenge: (id: string) => void;
  onBackToBank: () => void;
  onUpdateBlocks: (blocks: PromptBlocks) => void;
  onUpdateResponse: (
    response: string,
    sourceMode?: "live_gemini" | "manual",
    meta?: { provider?: string; model?: string; executedPrompt?: string }
  ) => void;
  onUpdateExecutionMeta: (meta: {
    executedPrompt?: string;
    provider?: string;
    model?: string;
    sourceMode?: "live_gemini" | "manual";
  }) => void;
  onUpdateEvaluation: (evaluation: CriticalEvaluation) => void;
  onUpdateCustomMeta: (meta: CustomChallengeMeta) => void;
  onResetBlocks: () => void;
  onSaveIteration: () => IterationVersion | null;
  onCompleteChallenge: (saveCurrentDraft: boolean) => void;
  onReopenChallenge: () => void;
  onLoadVersion: (version: IterationVersion) => void;
  onGoToPortfolio: () => void;
  onSaveActivityState: (activityState: Record<string, unknown>) => void;
  onAttemptActivityEvaluated: (
    activityState: Record<string, unknown>,
    result: ChallengeActivityResult
  ) => void;
  onResetStructuredActivity: () => void;
}

export function WorkbenchView({
  challenge,
  progress,
  allChallengesProgress,
  onSelectChallenge,
  onBackToBank,
  onUpdateBlocks,
  onUpdateResponse,
  onUpdateExecutionMeta,
  onUpdateEvaluation,
  onUpdateCustomMeta,
  onResetBlocks,
  onSaveIteration,
  onCompleteChallenge,
  onReopenChallenge,
  onLoadVersion,
  onGoToPortfolio,
  onSaveActivityState,
  onAttemptActivityEvaluated,
  onResetStructuredActivity,
}: WorkbenchViewProps) {
  const [validationError, setValidationError] = useState<string | null>(null);
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);
  const [showCompareModal, setShowCompareModal] = useState(false);
  const [compareLeftIdx, setCompareLeftIdx] = useState(0);
  const [compareRightIdx, setCompareRightIdx] = useState(1);

  // Limpiar mensajes transitorios y modales al cambiar de reto
  useEffect(() => {
    setValidationError(null);
    setActionSuccess(null);
    setShowCompareModal(false);
  }, [challenge.id]);

  const currentVersionNumber = progress.versions.length + 1;
  const status = resolveChallengeStatus(challenge.id, allChallengesProgress);

  const assembledPrompt = useMemo(
    () => assemblePrompt(progress.draftBlocks),
    [progress.draftBlocks]
  );

  const effectiveDraftPrompt =
    progress.draftExecutedPrompt?.trim() || assembledPrompt;

  const completeness = useMemo(
    () => evaluateCompleteness(progress.draftBlocks),
    [progress.draftBlocks]
  );

  const verifiedCriteriaCount =
    progress.draftEvaluation.criteriosVerificados.filter(Boolean).length;

  const displayTitle =
    challenge.esLibre && progress.customMeta?.title
      ? progress.customMeta.title
      : challenge.title;
  const displayObjetivo =
    challenge.esLibre && progress.customMeta?.objetivo
      ? progress.customMeta.objetivo
      : challenge.objetivo;

  const currentDraftAsVersion: IterationVersion | null = useMemo(() => {
    if (!progress.draftResponse.trim()) return null;
    return {
      id: `${challenge.id}-draft`,
      versionNumber: currentVersionNumber,
      createdAt: new Date().toISOString(),
      blocks: progress.draftBlocks,
      assembledPrompt,
      executedPrompt: effectiveDraftPrompt,
      aiResponse: progress.draftResponse,
      sourceMode: progress.draftSourceMode,
      aiProvider: progress.draftProvider,
      aiModel: progress.draftModel,
      evaluation: progress.draftEvaluation,
    };
  }, [
    challenge.id,
    currentVersionNumber,
    progress.draftBlocks,
    assembledPrompt,
    effectiveDraftPrompt,
    progress.draftResponse,
    progress.draftSourceMode,
    progress.draftProvider,
    progress.draftModel,
    progress.draftEvaluation,
  ]);

  const handleBlockChange = (key: keyof PromptBlocks, value: string) => {
    setValidationError(null);
    setActionSuccess(null);
    onUpdateBlocks({
      ...progress.draftBlocks,
      [key]: value,
    });
  };

  const validateEvaluationForm = (): string | null => {
    if (!effectiveDraftPrompt.trim()) {
      return "Primero escribe o arma tu instrucción antes de guardar en la bitácora.";
    }
    if (!progress.draftResponse.trim()) {
      return "Primero prueba tu instrucción con la IA (o pega la respuesta externa) para poder evaluarla.";
    }
    const ev = progress.draftEvaluation;
    if (
      !ev.cumplioRestricciones ||
      !ev.alucinacionesOSesgos ||
      !ev.nivelYFormatoAdecuados
    ) {
      return "Responde las 3 preguntas sencillas sobre la respuesta de la IA.";
    }

    if (!(ev.cambiosInstruccion ?? "").trim()) {
      return "Escribe brevemente qué cambiarías en tu instrucción para obtener una mejor respuesta.";
    }

    if (!ev.notasReflexion.trim()) {
      return "Escribe brevemente qué aprendiste de esta prueba para guardarlo en tu bitácora.";
    }

    return null;
  };

  const handleSaveIteration = () => {
    const err = validateEvaluationForm();
    if (err) {
      setValidationError(err);
      return;
    }
    setValidationError(null);
    const saved = onSaveIteration();
    if (saved) {
      setActionSuccess(
        `Prueba ${saved.versionNumber} guardada en tu bitácora. Ya puedes mejorar tu instrucción para la prueba ${
          saved.versionNumber + 1
        }.`
      );
    }
  };

  const handleMarkComplete = () => {
    const hasSavedVersion = progress.versions.length > 0;
    const hasCurrentDraft =
      effectiveDraftPrompt.trim().length > 0 &&
      progress.draftResponse.trim().length > 0;

    if (hasCurrentDraft) {
      const err = validateEvaluationForm();
      if (err) {
        setValidationError(err);
        return;
      }
      setValidationError(null);
      onCompleteChallenge(true);
      setActionSuccess(
        "Evaluación guardada en tu bitácora y reto marcado como Completado."
      );
      return;
    }

    if (hasSavedVersion) {
      setValidationError(null);
      onCompleteChallenge(false);
      setActionSuccess("Reto marcado como Completado.");
      return;
    }

    setValidationError(
      "Prueba tu instrucción, evalúa el resultado y registra lo que aprendiste antes de completar el reto."
    );
  };

  const openComparator = () => {
    const totalComparable =
      progress.versions.length + (currentDraftAsVersion ? 1 : 0);
    if (totalComparable >= 2) {
      setCompareLeftIdx(0);
      setCompareRightIdx(totalComparable - 1);
      setShowCompareModal(true);
    }
  };

  const updateEvalField = <K extends keyof CriticalEvaluation>(
    field: K,
    value: CriticalEvaluation[K]
  ) => {
    setValidationError(null);
    setActionSuccess(null);
    onUpdateEvaluation({
      ...progress.draftEvaluation,
      [field]: value,
    });
  };

  const renderStructuredChallenge = () => {
    switch (challenge.id) {
      case "reto-1":
        return (
          <Challenge1IdentifyParts
            challenge={challenge}
            progress={progress}
            onSaveDraftState={onSaveActivityState}
            onAttemptEvaluated={onAttemptActivityEvaluated}
            onResetActivity={onResetStructuredActivity}
          />
        );
      case "reto-2":
        return (
          <Challenge2DetectEffective
            challenge={challenge}
            progress={progress}
            onSaveDraftState={onSaveActivityState}
            onAttemptEvaluated={onAttemptActivityEvaluated}
            onResetActivity={onResetStructuredActivity}
          />
        );
      case "reto-3":
        return (
          <Challenge3FindErrors
            challenge={challenge}
            progress={progress}
            onSaveDraftState={onSaveActivityState}
            onAttemptEvaluated={onAttemptActivityEvaluated}
            onResetActivity={onResetStructuredActivity}
          />
        );
      case "reto-4":
        return (
          <Challenge4AnalyzeResponse
            challenge={challenge}
            progress={progress}
            onSaveDraftState={onSaveActivityState}
            onAttemptEvaluated={onAttemptActivityEvaluated}
            onResetActivity={onResetStructuredActivity}
          />
        );
      case "reto-5":
        return (
          <Challenge5SolveCase
            challenge={challenge}
            progress={progress}
            onSaveDraftState={onSaveActivityState}
            onAttemptEvaluated={onAttemptActivityEvaluated}
            onResetActivity={onResetStructuredActivity}
          />
        );
      case "reto-6":
        return (
          <Challenge6AuditExperience
            challenge={challenge}
            progress={progress}
            onSaveDraftState={onSaveActivityState}
            onAttemptEvaluated={onAttemptActivityEvaluated}
            onResetActivity={onResetStructuredActivity}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      <ChallengeHeader
        challenge={challenge}
        progress={progress}
        allChallengesProgress={allChallengesProgress}
        status={status}
        displayTitle={displayTitle}
        displayObjetivo={displayObjetivo}
        verifiedCriteriaCount={verifiedCriteriaCount}
        onSelectChallenge={onSelectChallenge}
        onBackToBank={onBackToBank}
        onUpdateCustomMeta={onUpdateCustomMeta}
        onOpenComparator={openComparator}
      />

      {challenge.esLibre ? (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          <PromptBlockBuilder
            challenge={challenge}
            currentVersionNumber={currentVersionNumber}
            draftBlocks={progress.draftBlocks}
            versions={progress.versions}
            assembledPrompt={assembledPrompt}
            completeness={completeness}
            onBlockChange={handleBlockChange}
            onResetBlocks={() => {
              setValidationError(null);
              setActionSuccess(null);
              onResetBlocks();
            }}
            onLoadVersion={(ver) => {
              setValidationError(null);
              setActionSuccess(
                `Se cargó la Versión ${ver.versionNumber} en el borrador actual para revisión o ajuste.`
              );
              onLoadVersion(ver);
            }}
          />

          <section className="lg:col-span-6 bg-white dark:bg-[#1E293B] border border-[#CBD5E1] dark:border-[#334155] border-t-4 border-t-[#8B1E24] dark:border-t-[#F87171] rounded-xl p-5 sm:p-6 space-y-6 transition-colors">
            <AiExecutionPanel
              challengeId={challenge.id}
              challengeTitle={displayTitle}
              currentVersionNumber={currentVersionNumber}
              versionsCount={progress.versions.length}
              assembledPrompt={assembledPrompt}
              draftExecutedPrompt={progress.draftExecutedPrompt}
              draftResponse={progress.draftResponse}
              draftSourceMode={progress.draftSourceMode}
              draftProvider={progress.draftProvider}
              draftModel={progress.draftModel}
              onUpdateResponse={onUpdateResponse}
              onUpdateExecutionMeta={onUpdateExecutionMeta}
              onClearValidationError={() => setValidationError(null)}
              onOpenComparator={openComparator}
            />

            <CriticalEvaluationPanel
              evaluation={progress.draftEvaluation}
              currentVersionNumber={currentVersionNumber}
              completed={progress.completed}
              validationError={validationError}
              actionSuccess={actionSuccess}
              onUpdateField={updateEvalField}
              onSaveIteration={handleSaveIteration}
              onMarkComplete={handleMarkComplete}
              onReopenChallenge={() => {
                setValidationError(null);
                setActionSuccess(null);
                onReopenChallenge();
              }}
              onGoToPortfolio={onGoToPortfolio}
            />
          </section>
        </div>
      ) : (
        renderStructuredChallenge()
      )}

      <VersionComparatorModal
        open={showCompareModal}
        versions={progress.versions}
        currentDraft={currentDraftAsVersion}
        leftIdx={compareLeftIdx}
        rightIdx={compareRightIdx}
        onChangeLeftIdx={setCompareLeftIdx}
        onChangeRightIdx={setCompareRightIdx}
        onClose={() => setShowCompareModal(false)}
      />
    </div>
  );
}
