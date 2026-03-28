const BASE_URL = import.meta.env.VITE_API_BASE_URL || "";

export interface WordData {
  word: string;
  level: string;
  gradeBand: string;
  difficulty: string;
  origin: string;
  definition: string;
  exampleSentence: string;
  partOfSpeech: string;
  pronunciation: string;
  patterns: string[];
}

export interface SupportsUsed {
  definitionViewed: boolean;
  exampleViewed: boolean;
  originViewed: boolean;
}

export interface ChildProfile {
  childId: string;
  age: number;
  grade: string;
  spellingLevel: string;
}

export interface SessionContext {
  mode: string;
  previousAttemptsOnThisWord: number;
  previousMissPatterns: string[];
  recentlyPracticedWords: string[];
}

export interface CoachingRequest {
  targetWord: string;
  childAttempt: string;
  childProfile: ChildProfile;
  supportsUsed: SupportsUsed;
  sessionContext: SessionContext;
}

export interface CoachingResponse {
  correctness: {
    isCorrect: boolean;
    reinforceSuccess: boolean;
  };
  missAnalysis: {
    summary: string;
    errorTypes: string[];
    primaryErrorFocus: string;
  };
  teachingDecision: {
    strategy: string;
    primaryFocus: string;
    secondaryFocuses: string[];
    confidence: number;
    rationale: string;
  };
  coachingText: {
    shortFeedback: string;
    fullExplanation: string;
    memoryTip: string;
    sayAloudTip: string;
  };
  wordBreakdown: {
    displayChunks: string[];
    chunkReason: string;
  };
  conceptLabels: {
    originLabels: string[];
    patternLabels: string[];
    morphologyLabels: string[];
  };
  nextStep: {
    practiceFocus: string;
    shouldReviewSoon: boolean;
    suggestedSimilarWordTypes: string[];
  };
}

export async function checkHealth(): Promise<{ status: string }> {
  const res = await fetch(`${BASE_URL}/api/health`);
  if (!res.ok) throw new Error("Health check failed");
  return res.json();
}

export async function fetchNextWord(level: number): Promise<WordData> {
  const res = await fetch(`${BASE_URL}/api/words/next?level=${level}`);
  if (!res.ok) throw new Error("Failed to fetch word");
  return res.json();
}

export async function submitSpellingAttempt(body: CoachingRequest): Promise<CoachingResponse> {
  const res = await fetch(`${BASE_URL}/api/spelling-coach`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error("Failed to submit attempt");
  return res.json();
}
