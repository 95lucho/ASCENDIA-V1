import { useMemo } from "react";
import { ArrowLeft, Blocks } from "lucide-react";
import { CHALLENGES } from "../data/challenges";
import { ConstructorDraft, PromptBlocks } from "../types/lab";
import { assemblePrompt, evaluateCompleteness } from "../utils/promptBuilder";
import { AiExecutionPanel } from "./workbench/AiExecutionPanel";
import { PromptBlockBuilder } from "./workbench/PromptBlockBuilder";

interface ConstructorToolViewProps {
  draft: ConstructorDraft;
  onUpdateDraft: (updater: (current: ConstructorDraft) => ConstructorDraft) => void;
  onResetDraft: () => void;
  onGoToChallenges: () => void;
  onGoToFreeChallenge: () => void;
}

const CONSTRUCTOR_REFERENCE_CHALLENGE = CHALLENGES[CHALLENGES.length - 1];

export function ConstructorToolView({
  draft,
  onUpdateDraft,
  onResetDraft,
  onGoToChallenges,
  onGoToFreeChallenge,
}: ConstructorToolViewProps) {
  const assembledPrompt = useMemo(
    () => assemblePrompt(draft.blocks),
    [draft.blocks]
  );

  const completeness = useMemo(
    () => evaluateCompleteness(draft.blocks),
    [draft.blocks]
  );

  const handleBlockChange = (key: keyof PromptBlocks, value: string) => {
    onUpdateDraft((curr) => ({
      ...curr,
      blocks: {
        ...curr.blocks,
        [key]: value,
      },
    }));
  };

  return (
    <div className="space-y-6">
      <section className="bg-white dark:bg-[#1E293B] border border-[#CBD5E1] dark:border-[#334155] border-t-4 border-t-[#1E3A5F] dark:border-t-[#60A5FA] rounded-xl p-5 sm:p-6 transition-colors">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <button
            type="button"
            onClick={onGoToChallenges}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 dark:text-[#CBD5E1] hover:text-[#1E3A5F] dark:hover:text-[#60A5FA]"
          >
            <ArrowLeft className="w-3.5 h-3.5" aria-hidden="true" />
            <span>Volver al Banco de Retos</span>
          </button>

          <button
            type="button"
            onClick={onGoToFreeChallenge}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-[#1E3A5F] dark:text-[#F1F5F9] bg-[#F5F7FA] dark:bg-[#0F172A] hover:bg-slate-200/70 dark:hover:bg-[#334155]/60 border border-[#CBD5E1] dark:border-[#334155] rounded-lg transition-colors"
          >
            <span>Ir al Reto Libre</span>
          </button>
        </div>

        <div className="mt-4 flex items-start gap-3">
          <span className="w-10 h-10 rounded-xl bg-[#1E3A5F]/10 dark:bg-[#2B4F7E]/30 text-[#1E3A5F] dark:text-[#60A5FA] flex items-center justify-center shrink-0">
            <Blocks className="w-5 h-5" aria-hidden="true" />
          </span>
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-[#1E3A5F] dark:text-[#F1F5F9]">
              Constructor Guiado por Bloques
            </h1>
            <p className="mt-1 text-sm text-slate-600 dark:text-[#CBD5E1] max-w-3xl">
              Herramienta independiente para aprender a formular instrucciones
              estructuradas mediante propósito, contexto, tarea, restricciones y
              formato de salida.
            </p>
          </div>
        </div>
      </section>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        <PromptBlockBuilder
          challenge={CONSTRUCTOR_REFERENCE_CHALLENGE}
          currentVersionNumber={1}
          draftBlocks={draft.blocks}
          versions={[]}
          assembledPrompt={assembledPrompt}
          completeness={completeness}
          onBlockChange={handleBlockChange}
          onResetBlocks={onResetDraft}
          onLoadVersion={() => {}}
        />

        <section className="lg:col-span-6 bg-white dark:bg-[#1E293B] border border-[#CBD5E1] dark:border-[#334155] border-t-4 border-t-[#8B1E24] dark:border-t-[#F87171] rounded-xl p-5 sm:p-6 transition-colors">
          <AiExecutionPanel
            challengeId="constructor-tool"
            challengeTitle="Constructor Guiado por Bloques"
            currentVersionNumber={1}
            versionsCount={0}
            assembledPrompt={assembledPrompt}
            draftExecutedPrompt={draft.executedPrompt}
            draftResponse={draft.response}
            draftSourceMode={draft.sourceMode}
            draftProvider={draft.provider}
            draftModel={draft.model}
            onUpdateResponse={(response, sourceMode, meta) =>
              onUpdateDraft((curr) => ({
                ...curr,
                response,
                sourceMode: sourceMode ?? curr.sourceMode,
                provider:
                  meta && "provider" in meta ? meta.provider : curr.provider,
                model: meta && "model" in meta ? meta.model : curr.model,
                executedPrompt:
                  meta && "executedPrompt" in meta
                    ? meta.executedPrompt
                    : curr.executedPrompt,
              }))
            }
            onUpdateExecutionMeta={(meta) =>
              onUpdateDraft((curr) => ({
                ...curr,
                executedPrompt:
                  "executedPrompt" in meta
                    ? meta.executedPrompt
                    : curr.executedPrompt,
                provider: "provider" in meta ? meta.provider : curr.provider,
                model: "model" in meta ? meta.model : curr.model,
                sourceMode: meta.sourceMode ?? curr.sourceMode,
              }))
            }
            onClearValidationError={() => {}}
            onOpenComparator={() => {}}
          />
        </section>
      </div>
    </div>
  );
}
