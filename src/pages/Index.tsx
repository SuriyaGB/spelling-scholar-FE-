import { useState, useCallback, useRef, useEffect } from "react";
import { motion } from "framer-motion";
import { Loader2, Send, ArrowRight, Volume2, Volume1, VolumeX } from "lucide-react";
import { useCheer } from "@/hooks/use-cheer";
import { LevelSelector } from "@/components/LevelSelector";
import { SupportCard } from "@/components/SupportCard";
import { CoachingResult } from "@/components/CoachingResult";
import { DebugPanel } from "@/components/DebugPanel";
import { ThemePicker, type ThemeKey } from "@/components/ThemePicker";
import { type PracticeMode } from "@/components/PracticeModeSwitch";
import { CustomListPanel } from "@/components/CustomListPanel";
import { ForeignOriginPanel } from "@/components/ForeignOriginPanel";
import { ChannelsDashboard } from "@/components/ChannelsDashboard";
import { ArrowLeft, GraduationCap, List as ListIcon, Globe } from "lucide-react";
import { fetchNextWord, submitSpellingAttempt, fetchPronunciationAudio } from "@/lib/api";
import type {
  WordData,
  CoachingResponse,
  SupportsUsed,
  SessionContext,
  CustomListSummary,
  ForeignOriginSummary,
  ForeignOriginDetail,
  NextWordParams,
} from "@/lib/api";
import { cn } from "@/lib/utils";
import beePng from "@/assets/bee.png";

const DEFAULT_PROFILE = {
  childId: "c1",
  age: 10,
  grade: "5",
  spellingLevel: "competition",
};

export default function Index() {
  const [theme, setTheme] = useState<ThemeKey>("default");
  const { soundEnabled, toggleSound, playCheer } = useCheer();
  const [level, setLevel] = useState(1);
  const [word, setWord] = useState<WordData | null>(null);
  const [attempt, setAttempt] = useState("");
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<CoachingResponse | null>(null);
  const [audioLoading, setAudioLoading] = useState(false);
  const [audioError, setAudioError] = useState<string | null>(null);
  const audioUrlRef = useRef<string | null>(null);

  const [defOpen, setDefOpen] = useState(false);
  const [exOpen, setExOpen] = useState(false);
  const [origOpen, setOrigOpen] = useState(false);

  const supportsViewed = useRef<SupportsUsed>({ definitionViewed: false, exampleViewed: false, originViewed: false });

  const [session, setSession] = useState<SessionContext>({
    mode: "practice",
    previousAttemptsOnThisWord: 0,
    previousMissPatterns: [],
    recentlyPracticedWords: [],
  });

  // Channel / mode state. activeChannel = null means show the dashboard.
  const [activeChannel, setActiveChannel] = useState<PracticeMode | null>(null);
  const [practiceMode, setPracticeMode] = useState<PracticeMode>("standard");
  const [selectedCustomList, setSelectedCustomList] = useState<CustomListSummary | null>(null);
  const [customPracticeActive, setCustomPracticeActive] = useState(false);

  // Foreign origin state
  const [selectedForeignOrigin, setSelectedForeignOrigin] = useState<ForeignOriginSummary | null>(null);
  const [selectedForeignOriginDetails, setSelectedForeignOriginDetails] = useState<ForeignOriginDetail | null>(null);
  const [foreignPracticeActive, setForeignPracticeActive] = useState(false);

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme === "default" ? "" : theme);
  }, [theme]);

  const inputRef = useRef<HTMLInputElement>(null);

  const resetWordState = () => {
    setWord(null);
    setResult(null);
    setAttempt("");
    setDefOpen(false);
    setExOpen(false);
    setOrigOpen(false);
    setAudioError(null);
    setError(null);
    if (audioUrlRef.current) {
      URL.revokeObjectURL(audioUrlRef.current);
      audioUrlRef.current = null;
    }
    supportsViewed.current = { definitionViewed: false, exampleViewed: false, originViewed: false };
    setSession((s) => ({ ...s, previousAttemptsOnThisWord: 0 }));
  };

  const loadWord = useCallback(async (params: NextWordParams) => {
    setLoading(true);
    setError(null);
    setResult(null);
    setAttempt("");
    setDefOpen(false);
    setExOpen(false);
    setOrigOpen(false);
    setAudioError(null);
    if (audioUrlRef.current) {
      URL.revokeObjectURL(audioUrlRef.current);
      audioUrlRef.current = null;
    }
    supportsViewed.current = { definitionViewed: false, exampleViewed: false, originViewed: false };
    setSession((s) => ({ ...s, previousAttemptsOnThisWord: 0 }));
    try {
      const w = await fetchNextWord(params);
      setWord(w);
    } catch {
      setError("Could not load word. Check your connection.");
    } finally {
      setLoading(false);
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, []);

  const handleLevelChange = (lvl: number) => {
    setLevel(lvl);
    loadWord({ level: lvl });
  };

  const handleSelectChannel = (mode: PracticeMode) => {
    setPracticeMode(mode);
    setActiveChannel(mode);
    resetWordState();
    setCustomPracticeActive(false);
    setForeignPracticeActive(false);
  };

  const handleBackToDashboard = () => {
    setActiveChannel(null);
    setCustomPracticeActive(false);
    setForeignPracticeActive(false);
    resetWordState();
  };

  const handleStartCustomPractice = () => {
    if (!selectedCustomList) return;
    setCustomPracticeActive(true);
    loadWord({ customListId: selectedCustomList.id });
  };

  const handleStartForeignPractice = () => {
    if (!selectedForeignOrigin) {
      setError("Please select an origin first.");
      return;
    }
    if (selectedForeignOrigin.wordCount === 0) {
      setError("This origin has no words available.");
      return;
    }
    setForeignPracticeActive(true);
    loadWord({ foreignOrigin: selectedForeignOrigin.origin });
  };

  const handleSubmit = async () => {
    if (!word || !attempt.trim()) return;
    setSubmitting(true);
    setError(null);
    try {
      const res = await submitSpellingAttempt({
        targetWord: word.word,
        childAttempt: attempt.trim().toLowerCase(),
        childProfile: DEFAULT_PROFILE,
        supportsUsed: { ...supportsViewed.current },
        sessionContext: session,
      });
      setResult(res);
      if (res.correctness?.isCorrect) playCheer();
      setSession((s) => ({
        ...s,
        previousAttemptsOnThisWord: s.previousAttemptsOnThisWord + 1,
        recentlyPracticedWords: [...s.recentlyPracticedWords.slice(-9), word.word],
      }));
    } catch {
      setError("Could not submit. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleNextWord = () => {
    if (practiceMode === "custom" && customPracticeActive && selectedCustomList) {
      loadWord({ customListId: selectedCustomList.id });
    } else if (practiceMode === "foreignOrigin" && foreignPracticeActive && selectedForeignOrigin) {
      loadWord({ foreignOrigin: selectedForeignOrigin.origin });
    } else {
      loadWord({ level });
    }
  };

  const playPronunciation = async () => {
    if (!word || audioLoading) return;
    setAudioLoading(true);
    setAudioError(null);
    try {
      const url = await fetchPronunciationAudio(word.word);
      if (audioUrlRef.current) URL.revokeObjectURL(audioUrlRef.current);
      audioUrlRef.current = url;
      const audio = new Audio(url);
      await audio.play();
    } catch {
      setAudioError("Could not play audio.");
    } finally {
      setAudioLoading(false);
    }
  };

  const toggleDef = () => {
    setDefOpen((v) => !v);
    supportsViewed.current.definitionViewed = true;
  };
  const toggleEx = () => {
    setExOpen((v) => !v);
    supportsViewed.current.exampleViewed = true;
  };
  const toggleOrig = () => {
    setOrigOpen((v) => !v);
    supportsViewed.current.originViewed = true;
  };

  const hasWord = !!word && !loading;
  const submitted = !!result;

  const showStandardFlow = practiceMode === "standard";
  const showCustomSetup = practiceMode === "custom" && !customPracticeActive;
  const showForeignSetup = practiceMode === "foreignOrigin" && !foreignPracticeActive;
  const showPractice =
    showStandardFlow ||
    (practiceMode === "custom" && customPracticeActive) ||
    (practiceMode === "foreignOrigin" && foreignPracticeActive);

  return (
    <div className="min-h-screen">
      <div className="mx-auto max-w-lg px-4 py-6 sm:py-10">
        {/* Header */}
        <div className="flex items-start justify-between mb-6">
          <div className="flex-1" />
          <div className="text-center flex items-center justify-center gap-2">
            <img src={beePng} alt="Spelling bee mascot" className="h-20 w-auto -mr-2" />
            <div>
              <h1 className="text-3xl font-display text-foreground tracking-tight">Spelling Coach</h1>
              <p className="text-sm text-muted-foreground mt-1">Practice one word at a time</p>
            </div>
          </div>
          <div className="flex-1 flex items-center justify-end gap-1">
            <button
              onClick={toggleSound}
              className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
              title={soundEnabled ? "Mute cheer sound" : "Unmute cheer sound"}
            >
              {soundEnabled ? <Volume1 className="h-4 w-4" /> : <VolumeX className="h-4 w-4" />}
            </button>
            <ThemePicker current={theme} onChange={setTheme} />
          </div>
        </div>

        {/* Practice Mode Switch */}
        <div className="mb-4">
          <PracticeModeSwitch mode={practiceMode} onChange={handleModeChange} />
        </div>

        {/* Custom List Setup */}
        {showCustomSetup && (
          <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="mb-6">
            <CustomListPanel
              selectedList={selectedCustomList}
              onSelectList={setSelectedCustomList}
              onStartPractice={handleStartCustomPractice}
            />
          </motion.div>
        )}

        {/* Foreign Origin Setup */}
        {showForeignSetup && (
          <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="mb-6">
            <ForeignOriginPanel
              selectedOrigin={selectedForeignOrigin}
              onSelectOrigin={setSelectedForeignOrigin}
              onDetailsLoaded={setSelectedForeignOriginDetails}
              onStartPractice={handleStartForeignPractice}
            />
            {error && (
              <p className="mt-3 text-xs text-destructive text-center">{error}</p>
            )}
          </motion.div>
        )}

        {/* Active custom list banner */}
        {practiceMode === "custom" && customPracticeActive && selectedCustomList && (
          <div className="mb-4 flex items-center justify-between rounded-xl border border-primary/30 bg-primary/5 px-4 py-2.5">
            <div>
              <p className="text-sm font-semibold text-foreground">{selectedCustomList.name}</p>
              <p className="text-[10px] text-muted-foreground">
                Level {selectedCustomList.level} · {selectedCustomList.wordCount} words
              </p>
            </div>
            <button
              onClick={() => {
                setCustomPracticeActive(false);
                resetWordState();
              }}
              className="text-xs font-medium text-primary hover:underline"
            >
              Change List
            </button>
          </div>
        )}

        {/* Active foreign origin banner */}
        {practiceMode === "foreignOrigin" && foreignPracticeActive && selectedForeignOrigin && (
          <div className="mb-4 flex items-center justify-between rounded-xl border border-primary/30 bg-primary/5 px-4 py-2.5">
            <div>
              <p className="text-sm font-semibold text-foreground">
                Practicing {selectedForeignOrigin.origin} origin words
              </p>
              <p className="text-[10px] text-muted-foreground">
                {selectedForeignOrigin.wordCount} words available
              </p>
            </div>
            <button
              onClick={() => {
                setForeignPracticeActive(false);
                resetWordState();
              }}
              className="text-xs font-medium text-primary hover:underline"
            >
              Change Origin
            </button>
          </div>
        )}

        {/* Standard: Level Selector */}
        {showStandardFlow && (
          <div className="mb-6">
            <LevelSelector selected={level} onSelect={handleLevelChange} />
          </div>
        )}

        {/* Start prompt (standard mode only) */}
        {showStandardFlow && !word && !loading && !error && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-16">
            <p className="text-muted-foreground mb-4">Choose a level above to begin.</p>
          </motion.div>
        )}

        {/* Loading */}
        {showPractice && loading && (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="h-6 w-6 animate-spin text-primary" />
          </div>
        )}

        {/* Error */}
        {showPractice && error && (
          <div className="rounded-xl bg-destructive/10 border border-destructive/30 p-4 text-center text-sm text-destructive mb-4">
            {error}
            <button onClick={handleNextWord} className="block mx-auto mt-2 underline text-xs">
              Retry
            </button>
          </div>
        )}

        {/* Word Practice Area */}
        {showPractice && hasWord && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
            {/* Pronounce Word Button */}
            <div className="flex flex-col items-center gap-2">
              <button
                onClick={playPronunciation}
                disabled={audioLoading}
                className={cn(
                  "flex items-center justify-center gap-2 rounded-xl px-6 py-4 font-semibold text-lg transition-all",
                  "bg-secondary text-secondary-foreground hover:bg-secondary/90 disabled:opacity-50 disabled:cursor-not-allowed",
                  "shadow-md hover:shadow-lg",
                )}
              >
                {audioLoading ? <Loader2 className="h-6 w-6 animate-spin" /> : <Volume2 className="h-6 w-6" />}
                {audioLoading ? "Loading…" : "Hear the Word"}
              </button>
              {audioError && <p className="text-xs text-destructive">{audioError}</p>}
            </div>

            {/* Word metadata bar */}
            <div className="flex items-center justify-center gap-2 flex-wrap">
              <span className="text-xs rounded-full bg-primary/10 text-primary px-2.5 py-1 font-medium">
                Level {word.level}
              </span>
              <span
                className={cn(
                  "text-xs rounded-full px-2.5 py-1 font-medium",
                  word.difficulty === "easy"
                    ? "bg-success/10 text-success"
                    : word.difficulty === "medium"
                      ? "bg-warning/10 text-warning"
                      : "bg-destructive/10 text-destructive",
                )}
              >
                {word.difficulty}
              </span>
              <span className="text-xs rounded-full bg-chip-accent text-chip-accent-foreground px-2.5 py-1 font-medium">
                {word.partOfSpeech}
              </span>
            </div>

            {/* Support Buttons */}
            <div className="space-y-2">
              {!submitted && <p className="text-xs text-muted-foreground text-center">Need a hint? Tap for clues:</p>}
              {submitted && <p className="text-xs text-muted-foreground text-center">Review word details:</p>}
              <SupportCard
                type="definition"
                content={word.definition}
                isOpen={defOpen}
                onToggle={toggleDef}
              />
              <SupportCard
                type="example"
                content={word.exampleSentence}
                isOpen={exOpen}
                onToggle={toggleEx}
              />
              <SupportCard type="origin" content={word.origin} isOpen={origOpen} onToggle={toggleOrig} />
            </div>

            {/* Input Area */}
            {!submitted && (
              <div className="space-y-3 pt-2">
                <input
                  ref={inputRef}
                  type="text"
                  value={attempt}
                  onChange={(e) => setAttempt(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
                  placeholder="Type your spelling…"
                  autoCapitalize="none"
                  autoCorrect="off"
                  spellCheck={false}
                  className="w-full rounded-xl border-2 border-border bg-card px-4 py-4 text-center text-2xl font-display tracking-widest placeholder:text-muted-foreground/40 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                />
                <button
                  onClick={handleSubmit}
                  disabled={!attempt.trim() || submitting}
                  className={cn(
                    "w-full flex items-center justify-center gap-2 rounded-xl py-3.5 font-semibold text-base transition-all",
                    "bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-40 disabled:cursor-not-allowed",
                  )}
                >
                  {submitting ? <Loader2 className="h-5 w-5 animate-spin" /> : <Send className="h-5 w-5" />}
                  {submitting ? "Checking…" : "Submit"}
                </button>
              </div>
            )}

            {/* Results */}
            {submitted && result && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
                {word && (
                  <div className="rounded-xl border-2 border-border bg-card p-4 text-center space-y-1">
                    <p className="text-xs text-muted-foreground font-medium uppercase tracking-wide">Your spelling</p>
                    <p
                      className={cn(
                        "text-2xl font-display tracking-widest",
                        result.correctness.isCorrect ? "text-success" : "text-destructive line-through decoration-2",
                      )}
                    >
                      {attempt}
                    </p>
                    {!result.correctness.isCorrect && (
                      <>
                        <p className="text-xs text-muted-foreground font-medium uppercase tracking-wide pt-2">
                          Correct spelling
                        </p>
                        <p className="text-2xl font-display tracking-widest text-success">{word.word}</p>
                      </>
                    )}
                  </div>
                )}
                <CoachingResult result={result} />
                <button
                  onClick={handleNextWord}
                  className="w-full flex items-center justify-center gap-2 rounded-xl py-3.5 font-semibold text-base bg-primary text-primary-foreground hover:bg-primary/90 transition-all"
                >
                  <ArrowRight className="h-5 w-5" /> Next Word
                </button>
              </motion.div>
            )}
          </motion.div>
        )}

        {/* Debug Panel */}
        <DebugPanel
          level={level}
          wordData={word}
          supports={supportsViewed.current}
          response={result}
          practiceMode={practiceMode}
          selectedCustomList={selectedCustomList}
          customPracticeActive={customPracticeActive}
          selectedForeignOrigin={selectedForeignOrigin}
          selectedForeignOriginDetails={selectedForeignOriginDetails}
          foreignPracticeActive={foreignPracticeActive}
        />
      </div>
    </div>
  );
}
