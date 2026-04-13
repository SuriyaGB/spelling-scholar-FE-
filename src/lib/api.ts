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
    likelyWrongWordInterpretation: boolean;
    usedMeaningDisambiguationWell: boolean;
  };
  wordTeaching: {
    formTeaching: {
      summary: string;
      patterns: string[];
      chunks: string[];
      chunkReason: string;
      sayAloudFocus: string;
    };
    conceptTeaching: {
      summary: string;
      meaningFocus: string;
      originFocus: string;
      morphologyFocus: string;
      originLabels: string[];
      morphologyLabels: string[];
    };
  };
  errorRelevance: {
    mostRelevantToError: string;
    confidence: number;
    reason: string;
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

export interface CustomListSummary {
  id: string;
  name: string;
  level: string;
  wordCount: number;
}

export interface ImportCustomListRequest {
  listName: string;
  words: string[];
  overwriteList: boolean;
}

export interface ImportCustomListResponse {
  list: CustomListSummary;
  importedCount: number;
  skippedExistingCount: number;
  words: WordData[];
}

export interface CustomListsResponse {
  lists: CustomListSummary[];
}

export async function fetchNextWord(level?: number, customListId?: string): Promise<WordData> {
  const params = new URLSearchParams();
  if (level != null && !customListId) params.set("level", String(level));
  if (customListId) params.set("customListId", customListId);
  const res = await fetch(`${BASE_URL}/api/words/next?${params}`);
  if (!res.ok) throw new Error("Failed to fetch word");
  return res.json();
}

export async function fetchCustomLists(): Promise<CustomListsResponse> {
  const res = await fetch(`${BASE_URL}/api/custom-lists`);
  if (!res.ok) throw new Error("Failed to fetch custom lists");
  return res.json();
}

export async function fetchCustomListWords(listId: string): Promise<WordData[]> {
  const res = await fetch(`${BASE_URL}/api/custom-lists/${encodeURIComponent(listId)}`);
  if (!res.ok) throw new Error("Failed to fetch custom list words");
  return res.json();
}

export async function importCustomWordList(payload: ImportCustomListRequest): Promise<ImportCustomListResponse> {
  const res = await fetch(`${BASE_URL}/api/words/import-custom`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error("Failed to import custom list");
  return res.json();
}

export async function fetchPronunciationAudio(word: string): Promise<string> {
  const res = await fetch(`${BASE_URL}/api/words/${encodeURIComponent(word)}/pronunciation`);
  if (!res.ok) throw new Error("Failed to fetch pronunciation");
  const blob = await res.blob();
  return URL.createObjectURL(blob);
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
