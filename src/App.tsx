import { useEffect, useState } from "react";
import { ChallengeBankView } from "./components/ChallengeBankView";
import { CreditsModal } from "./components/CreditsModal";
import { Navbar } from "./components/Navbar";
import { OnboardingView } from "./components/OnboardingView";
import { PortfolioView } from "./components/PortfolioView";
import { SaoGuideModal } from "./components/SaoGuideModal";
import { WorkbenchView } from "./components/WorkbenchView";
import { CHALLENGES } from "./data/challenges";
import { useLabStorage } from "./hooks/useLabStorage";
import { useTheme } from "./hooks/useTheme";
import { LabView } from "./types/lab";

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
    updateDraftEvaluation,
    updateCustomMeta,
    resetDraftBlocks,
    saveIterationAndRefine,
    markChallengeCompleted,
    reopenChallenge,
    loadVersionIntoDraft,
    resetAllData,
  } = useLabStorage();

  const [guideOpen, setGuideOpen] = useState<boolean>(() => !state.hasSeenGuide);

  useEffect(() => {
    if (!state.hasSeenGuide) {
      setGuideOpen(true);
    }
  }, [state.hasSeenGuide]);

  const activeChallenge =
    CHALLENGES.find((c) => c.id === state.activeChallengeId) ?? CHALLENGES[0];
  const activeProgress = state.challenges[activeChallenge.id];

  const handleOpenChallenge = (challengeId: string) => {
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
            onSelectChallenge={handleOpenChallenge}
          />
        )}

        {activeView === "mesa" && activeProgress && (
          <WorkbenchView
            challenge={activeChallenge}
            progress={activeProgress}
            onSelectChallenge={(id) => setActiveChallengeId(id)}
            onBackToBank={() => handleNavigate("retos")}
            onUpdateBlocks={(blocks) =>
              updateDraftBlocks(activeChallenge.id, blocks)
            }
            onUpdateResponse={(resp, mode) =>
              updateDraftResponse(activeChallenge.id, resp, mode)
            }
            onUpdateEvaluation={(ev) =>
              updateDraftEvaluation(activeChallenge.id, ev)
            }
            onUpdateCustomMeta={(meta) =>
              updateCustomMeta(activeChallenge.id, meta)
            }
            onResetBlocks={() => resetDraftBlocks(activeChallenge.id)}
            onSaveIteration={() => saveIterationAndRefine(activeChallenge.id)}
            onCompleteChallenge={(saveCurrent) =>
              markChallengeCompleted(activeChallenge.id, saveCurrent)
            }
            onReopenChallenge={() => reopenChallenge(activeChallenge.id)}
            onLoadVersion={(ver) =>
              loadVersionIntoDraft(activeChallenge.id, ver)
            }
            onGoToPortfolio={() => handleNavigate("bitacora")}
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

      <footer className="border-t border-[#CBD5E1] dark:border-[#334155] bg-white dark:bg-[#1E293B] transition-colors">
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
              Guía de SAO
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
    </div>
  );
}
