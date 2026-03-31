import { useState } from "react";
import { Bug } from "lucide-react";
import type { WordData, SupportsUsed, CoachingResponse } from "@/lib/api";

interface DebugPanelProps {
  level: number;
  wordData: WordData | null;
  supports: SupportsUsed;
  response: CoachingResponse | null;
}

export function DebugPanel({ level, wordData, supports, response }: DebugPanelProps) {
  const [open, setOpen] = useState(false);

  return (
    <div className="mt-6">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors"
      >
        <Bug className="h-3 w-3" />
        {open ? "Hide" : "Show"} Debug
      </button>
      {open && (
        <div className="mt-2 rounded-lg bg-foreground/5 p-3 text-xs font-mono space-y-2 overflow-x-auto">
          <div><strong>Level:</strong> {level}</div>
          <div>
            <strong>Word Meta:</strong>
            <pre className="mt-1 whitespace-pre-wrap">{JSON.stringify(wordData, null, 2)}</pre>
          </div>
          <div>
            <strong>Supports Sent:</strong>
            <pre className="mt-1">{JSON.stringify(supports, null, 2)}</pre>
          </div>
          {response && (
            <>
              <div>
                <strong>Error Relevance:</strong>
                <pre className="mt-1 whitespace-pre-wrap">
                  {JSON.stringify({
                    mostRelevantToError: response.errorRelevance?.mostRelevantToError,
                    confidence: response.errorRelevance?.confidence,
                  }, null, 2)}
                </pre>
              </div>
              <div>
                <strong>Form Teaching:</strong>
                <pre className="mt-1 whitespace-pre-wrap">{JSON.stringify(response.wordTeaching?.formTeaching, null, 2)}</pre>
              </div>
              <div>
                <strong>Concept Teaching:</strong>
                <pre className="mt-1 whitespace-pre-wrap">{JSON.stringify(response.wordTeaching?.conceptTeaching, null, 2)}</pre>
              </div>
              <div>
                <strong>Full Raw Response:</strong>
                <pre className="mt-1 whitespace-pre-wrap">{JSON.stringify(response, null, 2)}</pre>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}
