import { useEffect, useMemo, useState } from "react";
import { getChallengeStatus } from "../hooks/useLabStorage";
import {
  ChallengeDefinition,
  ChallengeProgress,
  CriticalEvaluation,
  CustomChallengeMeta,
  IterationVersion,
  PromptBlocks,
} from "../types/lab";
import { assemblePrompt, evaluateCompleteness } from "../utils/promptBuilder";
import { AiExecutionPanel } from "./workbench/AiExecutionPanel";
import { ChallengeHeader } from "./workbench/ChallengeHeader";
import { CriticalEvaluationPanel } from "./workbench/CriticalEvaluationPanel";
import { PromptBlockBuilder } from "./workbench/PromptBlockBuilder";
import { VersionComparatorModal } from "./workbench/VersionComparatorModal";

interface WorkbenchViewProps {
  challenge: ChallengeDefinition;
  progress: ChallengeProgress;
  onSelectChallenge: (id: string) => void;
  onBackToBank: () => void;
  onUpdateBlocks: (blocks: PromptBlocks) => void;
  onUpdateResponse: (
    response: string,
    sourceMode?: "live_gemini" | "manual"
  ) => void;
  onUpdateEvaluation: (evaluation: CriticalEvaluation) => void;
  onUpdateCustomMeta: (meta: CustomChallengeMeta) => void;
  onResetBlocks: () => void;
  onSaveIteration: () => IterationVersion | null;
  onCompleteChallenge: (saveCurrentDraft: boolean) => void;
  onReopenChallenge: () => void;
  onLoadVersion: (version: IterationVersion) => void;
  onGoToPortfolio: () => void;
}

export function WorkbenchView({
  challenge,
  progress,
  onSelectChallenge,
  onBackToBank,
  onUpdateBlocks,
  onUpdateResponse,
  onUpdateEvaluation,
  onUpdateCustomMeta,
  onResetBlocks,
  onSaveIteration,
  onCompleteChallenge,
  onReopenChallenge,
  onLoadVersion,
  onGoToPortfolio,
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
  const status = getChallengeStatus(progress);

  const assembledPrompt = useMemo(
    () => assemblePrompt(progress.draftBlocks),
    [progress.draftBlocks]
  );

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

  const handleBlockChange = (key: keyof PromptBlocks, value: string) => {
    setValidationError(null);
    setActionSuccess(null);
    onUpdateBlocks({
      ...progress.draftBlocks,
      [key]: value,
    });
  };

  const validateEvaluationForm = (
    requireAllCriteria: boolean
  ): string | null => {
    if (!assembledPrompt.trim()) {
      return "Debes redactar al menos los bloques esenciales del prompt en la columna izquierda.";
    }
    if (!progress.draftResponse.trim()) {
      return "Debes probar el prompt en vivo o pegar la respuesta obtenida de la IA antes de registrar la evaluación.";
    }
    const ev = progress.draftEvaluation;
    if (
      !ev.cumplioRestricciones ||
      !ev.alucinacionesOSesgos ||
      !ev.nivelYFormatoAdecuados
    ) {
      return "Responde las 3 preguntas de diagnóstico crítico sobre la salida obtenida.";
    }
    if (ev.notasReflexion.trim().length < 10) {
      return "Escribe una reflexión en la bitácora (mínimo 10 caracteres) indicando qué hallaste o qué ajustarás.";
    }
    if (requireAllCriteria && !ev.criteriosVerificados.every(Boolean)) {
      return `Para marcar el reto como completado, verifica y marca los ${challenge.criterios.length} criterios de evaluación del reto.`;
    }
    return null;
  };

  const handleSaveIteration = () => {
    const err = validateEvaluationForm(false);
    if (err) {
      setValidationError(err);
      return;
    }
    setValidationError(null);
    const saved = onSaveIteration();
    if (saved) {
      setActionSuccess(
        `Versión ${saved.versionNumber} guardada en bitácora. Ahora estás refinando la Versión ${
          saved.versionNumber + 1
        }.`
      );
    }
  };

  const handleMarkComplete = () => {
    const hasSavedVersion = progress.versions.length > 0;
    const hasCurrentDraft =
      assembledPrompt.trim().length > 0 &&
      progress.draftResponse.trim().length > 0;

    if (hasCurrentDraft) {
      const err = validateEvaluationForm(true);
      if (err) {
        setValidationError(err);
        return;
      }
      setValidationError(null);
      onCompleteChallenge(true);
      setActionSuccess("Reto verificado y marcado como Completado.");
      return;
    }

    if (hasSavedVersion) {
      if (!progress.draftEvaluation.criteriosVerificados.every(Boolean)) {
        setValidationError(
          `Verifica y marca los ${challenge.criterios.length} criterios de evaluación antes de completar el reto.`
        );
        return;
      }
      setValidationError(null);
      onCompleteChallenge(false);
      setActionSuccess("Reto marcado como Completado.");
      return;
    }

    setValidationError(
      "Completa al menos una iteración con respuesta y evaluación crítica antes de cerrar el reto."
    );
  };

  const openComparator = () => {
    if (progress.versions.length >= 2) {
      setCompareLeftIdx(0);
      setCompareRightIdx(progress.versions.length - 1);
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

  const toggleCriterion = (index: number) => {
    setValidationError(null);
    setActionSuccess(null);
    const next = [...progress.draftEvaluation.criteriosVerificados];
    next[index] = !next[index];
    updateEvalField("criteriosVerificados", next);
  };

  return (
    <div className="space-y-6">
      <ChallengeHeader
        challenge={challenge}
        progress={progress}
        status={status}
        displayTitle={displayTitle}
        displayObjetivo={displayObjetivo}
        verifiedCriteriaCount={verifiedCriteriaCount}
        onSelectChallenge={onSelectChallenge}
        onBackToBank={onBackToBank}
        onUpdateCustomMeta={onUpdateCustomMeta}
        onOpenComparator={openComparator}
      />

      {/* Mesa de trabajo en 2 columnas equilibradas */}
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

        <section className="lg:col-span-6 bg-white dark:bg-[#1E293B] border border-[#CBD5E1] dark:border-[#334155] rounded-xl p-5 sm:p-6 space-y-6 transition-colors">
          <AiExecutionPanel
            challengeId={challenge.id}
            challengeTitle={displayTitle}
            currentVersionNumber={currentVersionNumber}
            assembledPrompt={assembledPrompt}
            draftResponse={progress.draftResponse}
            draftSourceMode={progress.draftSourceMode}
            onUpdateResponse={onUpdateResponse}
            onClearValidationError={() => setValidationError(null)}
          />

          <CriticalEvaluationPanel
            challenge={challenge}
            evaluation={progress.draftEvaluation}
            currentVersionNumber={currentVersionNumber}
            completed={progress.completed}
            validationError={validationError}
            actionSuccess={actionSuccess}
            onUpdateField={updateEvalField}
            onToggleCriterion={toggleCriterion}
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

      <VersionComparatorModal
        open={showCompareModal}
        versions={progress.versions}
        leftIdx={compareLeftIdx}
        rightIdx={compareRightIdx}
        onChangeLeftIdx={setCompareLeftIdx}
        onChangeRightIdx={setCompareRightIdx}
        onClose={() => setShowCompareModal(false)}
      />
    </div>
  );
}
