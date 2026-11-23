import { useCallback, useEffect, useState } from "react";
import { ChallengeBankView } from "./components/ChallengeBankView";
import { ChallengeCompletionModal } from "./components/ChallengeCompletionModal";
import { ConstructorToolView } from "./components/ConstructorToolView";
import { CreditsModal } from "./components/CreditsModal";
import { Navbar } from "./components/Navbar";
import { OnboardingView } from "./components/OnboardingView";
import { PortfolioView } from "./components/PortfolioView";
import { SaoGuideModal } from "./components/SaoGuideModal";
import { WorkbenchView } from "./components/WorkbenchView";
import { CHALLENGES } from "./data/challenges";
import { useLabStorage } from "./hooks/useLabStorage";
import { useTheme } from "./hooks/useTheme";
import { ChallengeActivityResult, LabView } from "./types/lab";
import {
  getUnlockRequirementMessage,
  isChallengeUnlocked,
} from "./utils/progression";

function parseRequestedChallengeFromUrl(): string | null {
  if (typeof window === "undefined") return null;

  const params = new URLSearchParams(window.location.search);
  const queryChallenge = params.get("reto") || params.get("challenge");
  if (queryChallenge && CHALLENGES.some((c) => c.id === queryChallenge)) {
    return queryChallenge;
  }

  const hash = window.location.hash.replace(/^#\/?/, "").trim();
  if (!hash) return null;

  const segments = hash.split("/").filter(Boolean);
  for (const seg of segments) {
    if (CHALLENGES.some((c) => c.id === seg)) {
      return seg;
    }
  }
  return null;
}

export default function App() {
  const [activeView, setActiveView] = useState<LabView>("inicio");
  const [creditsOpen, setCreditsOpen] = useState(false);
  const { theme, toggleTheme } = useTheme();
  const {
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
  } = useLabStorage();

  const [guideOpen, setGuideOpen] = useState<boolean>(() => !state.hasSeenGuide);
  const [completedModalChallengeId, setCompletedModalChallengeId] = useState<
    string | null
  >(null);
  const [latestModalResult, setLatestModalResult] =
    useState<ChallengeActivityResult | null>(null);
  const [retryNonce, setRetryNonce] = useState(0);
  const [blockedAccessNotice, setBlockedAccessNotice] = useState<string | null>(
    null
  );

  useEffect(() => {
    if (!state.hasSeenGuide) {
      setGuideOpen(true);
    }
  }, [state.hasSeenGuide]);

  const evaluateDirectChallengeRoute = useCallback(() => {
    const requestedId = parseRequestedChallengeFromUrl();
    if (!requestedId) return;

    const targetDef = CHALLENGES.find((c) => c.id === requestedId);
    if (!targetDef) return;

    if (isChallengeUnlocked(requestedId, state.challenges)) {
      setBlockedAccessNotice(null);
      setActiveChallengeId(requestedId);
      setActiveView("mesa");
    } else {
      const reqMsg =
        getUnlockRequirementMessage(requestedId) ??
        "Completa los retos del nivel anterior para desbloquearlo.";
      setBlockedAccessNotice(
        `No es posible acceder directamente a ${targetDef.orderLabel} porque está bloqueado. ${reqMsg}.`
      );
      setActiveView("retos");
      if (window.location.hash) {
        window.history.replaceState(null, "", "#retos");
      }
    }
  }, [state.challenges, setActiveChallengeId]);

  useEffect(() => {
    evaluateDirectChallengeRoute();
    window.addEventListener("hashchange", evaluateDirectChallengeRoute);
    window.addEventListener("popstate", evaluateDirectChallengeRoute);
    return () => {
      window.removeEventListener("hashchange", evaluateDirectChallengeRoute);
      window.removeEventListener("popstate", evaluateDirectChallengeRoute);
    };
  }, [evaluateDirectChallengeRoute]);

  const candidateChallenge =
    CHALLENGES.find((c) => c.id === state.activeChallengeId) ?? CHALLENGES[0];
  const activeChallenge = isChallengeUnlocked(
    candidateChallenge.id,
    state.challenges
  )
    ? candidateChallenge
    : CHALLENGES[0];
  const activeProgress = state.challenges[activeChallenge.id];

  const handleOpenChallenge = (challengeId: string) => {
    if (!isChallengeUnlocked(challengeId, state.challenges)) {
      const targetDef = CHALLENGES.find((c) => c.id === challengeId);
      const reqMsg =
        getUnlockRequirementMessage(challengeId) ??
        "Completa los retos requeridos antes de continuar.";
      setBlockedAccessNotice(
        `${targetDef?.orderLabel ?? "Este reto"} está bloqueado. ${reqMsg}.`
      );
      setActiveView("retos");
      return;
    }
    setBlockedAccessNotice(null);
    setActiveChallengeId(challengeId);
    setActiveView("mesa");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleNavigate = (view: LabView) => {
    setActiveView(view);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleSkipGuide = () => {
    setHasSeenGuide(true);
    setGuideOpen(false);
  };

  const handleCompleteGuide = () => {
    setHasSeenGuide(true);
    setGuideOpen(false);
    setActiveView("retos");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#F5F7FA] dark:bg-[#0F172A] text-[#0F172A] dark:text-[#F1F5F9] transition-colors">
      <Navbar
        activeView={activeView}
        onNavigate={handleNavigate}
        studentName={state.studentName}
        onStudentNameChange={setStudentName}
        onOpenCredits={() => setCreditsOpen(true)}
        onOpenGuide={() => setGuideOpen(true)}
        theme={theme}
        onToggleTheme={toggleTheme}
      />

      <main className="flex-1 w-full max-w-[1360px] mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeView === "inicio" && (
          <OnboardingView
            diagnostic={state.diagnostic}
            studentName={state.studentName}
            onUpdateDiagnostic={updateDiagnostic}
            onGoToChallenges={() => handleNavigate("retos")}
            onOpenGuide={() => setGuideOpen(true)}
          />
        )}

        {activeView === "retos" && (
          <ChallengeBankView
            challengesProgress={state.challenges}
            blockedNotice={blockedAccessNotice}
            onDismissBlockedNotice={() => setBlockedAccessNotice(null)}
            onSelectChallenge={handleOpenChallenge}
            onOpenConstructor={() => handleNavigate("constructor")}
          />
        )}

        {activeView === "constructor" && state.constructorDraft && (
          <ConstructorToolView
            draft={state.constructorDraft}
            onUpdateDraft={updateConstructorDraft}
            onResetDraft={resetConstructorDraft}
            onGoToChallenges={() => handleNavigate("retos")}
            onGoToFreeChallenge={() => handleOpenChallenge("reto-libre")}
          />
        )}

        {activeView === "mesa" && activeProgress && (
          <WorkbenchView
            key={`${activeChallenge.id}-${retryNonce}`}
            challenge={activeChallenge}
            progress={activeProgress}
            allChallengesProgress={state.challenges}
            onSelectChallenge={(id) => {
              if (isChallengeUnlocked(id, state.challenges)) {
                setBlockedAccessNotice(null);
                setActiveChallengeId(id);
              }
            }}
            onBackToBank={() => handleNavigate("retos")}
            onUpdateBlocks={(blocks) =>
              updateDraftBlocks(activeChallenge.id, blocks)
            }
            onUpdateResponse={(resp, mode, meta) =>
              updateDraftResponse(activeChallenge.id, resp, mode, meta)
            }
            onUpdateExecutionMeta={(meta) =>
              updateDraftExecutionMeta(activeChallenge.id, meta)
            }
            onUpdateEvaluation={(ev) =>
              updateDraftEvaluation(activeChallenge.id, ev)
            }
            onUpdateCustomMeta={(meta) =>
              updateCustomMeta(activeChallenge.id, meta)
            }
            onResetBlocks={() => resetDraftBlocks(activeChallenge.id)}
            onSaveIteration={() => saveIterationAndRefine(activeChallenge.id)}
            onCompleteChallenge={(saveCurrent) => {
              markChallengeCompleted(activeChallenge.id, saveCurrent);
              if (!activeChallenge.esLibre) {
                setLatestModalResult(null);
                setCompletedModalChallengeId(activeChallenge.id);
              }
            }}
            onReopenChallenge={() => reopenChallenge(activeChallenge.id)}
            onLoadVersion={(ver) =>
              loadVersionIntoDraft(activeChallenge.id, ver)
            }
            onGoToPortfolio={() => handleNavigate("bitacora")}
            onSaveActivityState={(activityState) =>
              updateChallengeActivityState(activeChallenge.id, activityState)
            }
            onAttemptActivityEvaluated={(activityState, result) => {
              saveChallengeActivityAttempt(
                activeChallenge.id,
                activityState,
                result
              );
              if (result.approved && !activeChallenge.esLibre) {
                setLatestModalResult(result);
                setCompletedModalChallengeId(activeChallenge.id);
              }
            }}
            onResetStructuredActivity={() => {
              prepareChallengeRetry(activeChallenge.id);
              setRetryNonce((n) => n + 1);
            }}
          />
        )}

        {activeView === "bitacora" && (
          <PortfolioView
            state={state}
            onOpenChallenge={handleOpenChallenge}
            onResetAll={resetAllData}
          />
        )}
      </main>

      <footer className="border-t-2 border-[#1E3A5F] dark:border-[#2B4F7E] bg-white dark:bg-[#1E293B] transition-colors">
        <div className="max-w-[1360px] mx-auto px-4 sm:px-6 lg:px-8 py-4 flex flex-wrap items-center justify-between gap-4 text-xs text-slate-600 dark:text-[#CBD5E1]">
          <span>
            <strong className="font-semibold text-[#1E3A5F] dark:text-[#F1F5F9]">
              ASCENDIA
            </strong>
            <span aria-hidden="true" className="mx-2">
              ·
            </span>
            Formación universitaria en formulación y evaluación de prompts
          </span>
          <div className="flex items-center gap-4">
            <button
              type="button"
              onClick={() => setGuideOpen(true)}
              className="font-semibold text-[#1E3A5F] dark:text-[#60A5FA] hover:text-[#8B1E24] dark:hover:text-[#F87171] underline underline-offset-2 transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#1E3A5F] dark:focus-visible:outline-[#60A5FA] rounded"
            >
              Guía de SAÓ
            </button>
            <button
              type="button"
              onClick={() => setCreditsOpen(true)}
              className="font-semibold text-[#8B1E24] dark:text-[#F87171] hover:text-[#1E3A5F] dark:hover:text-[#60A5FA] underline underline-offset-2 transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#1E3A5F] dark:focus-visible:outline-[#60A5FA] rounded"
            >
              Créditos
            </button>
          </div>
        </div>
      </footer>

      <SaoGuideModal
        open={guideOpen}
        studentName={state.studentName}
        onStudentNameChange={setStudentName}
        onSkip={handleSkipGuide}
        onComplete={handleCompleteGuide}
      />

      <CreditsModal
        open={creditsOpen}
        onClose={() => setCreditsOpen(false)}
      />

      <ChallengeCompletionModal
        completedChallengeId={completedModalChallengeId}
        latestResult={latestModalResult}
        challengesProgress={state.challenges}
        onContinueNext={(nextChallengeId) => {
          setCompletedModalChallengeId(null);
          setLatestModalResult(null);
          if (isChallengeUnlocked(nextChallengeId, state.challenges)) {
            setActiveChallengeId(nextChallengeId);
            setActiveView("mesa");
            window.scrollTo({ top: 0, behavior: "smooth" });
          } else {
            handleNavigate("retos");
          }
        }}
        onRetry={(challengeId) => {
          setCompletedModalChallengeId(null);
          setLatestModalResult(null);
          prepareChallengeRetry(challengeId);
          setRetryNonce((n) => n + 1);
          window.scrollTo({ top: 0, behavior: "smooth" });
        }}
        onGoToBank={() => {
          setCompletedModalChallengeId(null);
          setLatestModalResult(null);
          handleNavigate("retos");
        }}
        onClose={() => {
          setCompletedModalChallengeId(null);
          setLatestModalResult(null);
        }}
      />
    </div>
  );
}
