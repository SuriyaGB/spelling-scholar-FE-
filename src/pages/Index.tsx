import { useState, useCallback, useRef } from "react";
import { motion } from "framer-motion";
import { Loader2, Send, ArrowRight, Volume2 } from "lucide-react";
import { LevelSelector } from "@/components/LevelSelector";
import { SupportCard } from "@/components/SupportCard";
import { CoachingResult } from "@/components/CoachingResult";
import { DebugPanel } from "@/components/DebugPanel";
import { fetchNextWord, submitSpellingAttempt, fetchPronunciationAudio } from "@/lib/api";
import type { WordData, CoachingResponse, SupportsUsed, SessionContext } from "@/lib/api";
import { cn } from "@/lib/utils";

const DEFAULT_PROFILE = {
  childId: "c1",
  age: 10,
  grade: "5",
  spellingLevel: "competition",
};

export default function Index() {
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

  // Track if support was opened at any point before submission
  const supportsViewed = useRef<SupportsUsed>({ definitionViewed: false, exampleViewed: false, originViewed: false });

  const [session, setSession] = useState<SessionContext>({
    mode: "practice",
    previousAttemptsOnThisWord: 0,
    previousMissPatterns: [],
    recentlyPracticedWords: [],
  });

  const inputRef = useRef<HTMLInputElement>(null);

  const loadWord = useCallback(async (lvl: number) => {
    setLoading(true);
    setError(null);
    setResult(null);
    setAttempt("");
    setDefOpen(false);
    setExOpen(false);
    setOrigOpen(false);
    setAudioError(null);
    if (audioUrlRef.current) { URL.revokeObjectURL(audioUrlRef.current); audioUrlRef.current = null; }
    supportsViewed.current = { definitionViewed: false, exampleViewed: false, originViewed: false };
    setSession((s) => ({ ...s, previousAttemptsOnThisWord: 0 }));
    try {
      const w = await fetchNextWord(lvl);
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
    loadWord(lvl);
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

  const handleNextWord = () => loadWord(level);

  const toggleDef = () => { setDefOpen((v) => !v); supportsViewed.current.definitionViewed = true; };
  const toggleEx = () => { setExOpen((v) => !v); supportsViewed.current.exampleViewed = true; };
  const toggleOrig = () => { setOrigOpen((v) => !v); supportsViewed.current.originViewed = true; };

  const hasWord = !!word && !loading;
  const submitted = !!result;

  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-lg px-4 py-6 sm:py-10">
        {/* Header */}
        <div className="text-center mb-6">
          <h1 className="text-3xl font-display text-foreground tracking-tight">Spelling Coach</h1>
          <p className="text-sm text-muted-foreground mt-1">Practice one word at a time</p>
        </div>

        {/* Level Selector */}
        <div className="mb-6">
          <LevelSelector selected={level} onSelect={handleLevelChange} />
        </div>

        {/* Start prompt */}
        {!word && !loading && !error && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-16">
            <p className="text-muted-foreground mb-4">Choose a level above to begin.</p>
          </motion.div>
        )}

        {/* Loading */}
        {loading && (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="h-6 w-6 animate-spin text-primary" />
          </div>
        )}

        {/* Error */}
        {error && (
          <div className="rounded-xl bg-destructive/10 border border-destructive/30 p-4 text-center text-sm text-destructive mb-4">
            {error}
            <button onClick={() => loadWord(level)} className="block mx-auto mt-2 underline text-xs">
              Retry
            </button>
          </div>
        )}

        {/* Word Practice Area */}
        {hasWord && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
            {/* Word metadata bar */}
            <div className="flex items-center justify-center gap-2 flex-wrap">
              <span className="text-xs rounded-full bg-primary/10 text-primary px-2.5 py-1 font-medium">
                Level {word.level}
              </span>
              <span className={cn(
                "text-xs rounded-full px-2.5 py-1 font-medium",
                word.difficulty === "easy" ? "bg-success/10 text-success"
                  : word.difficulty === "medium" ? "bg-warning/10 text-warning"
                  : "bg-destructive/10 text-destructive"
              )}>
                {word.difficulty}
              </span>
              <span className="text-xs rounded-full bg-chip-accent text-chip-accent-foreground px-2.5 py-1 font-medium">
                {word.partOfSpeech}
              </span>
              {word.pronunciation && (
                <button className="text-xs flex items-center gap-1 text-muted-foreground hover:text-foreground transition-colors" title="Audio coming soon">
                  <Volume2 className="h-3 w-3" /> {word.pronunciation}
                </button>
              )}
            </div>

            {/* Support Buttons */}
            {!submitted && (
              <div className="space-y-2">
                <p className="text-xs text-muted-foreground text-center">Need a hint? Tap for clues:</p>
                <SupportCard type="definition" content={word.definition} isOpen={defOpen} onToggle={toggleDef} />
                <SupportCard type="example" content={word.exampleSentence} isOpen={exOpen} onToggle={toggleEx} />
                <SupportCard type="origin" content={word.origin} isOpen={origOpen} onToggle={toggleOrig} />
              </div>
            )}

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
                    "bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-40 disabled:cursor-not-allowed"
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
        />
      </div>
    </div>
  );
}
