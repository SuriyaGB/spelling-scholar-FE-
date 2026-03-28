import { motion } from "framer-motion";
import { CheckCircle2, XCircle, Lightbulb, BookOpen, Puzzle, Volume2, ArrowRight, Brain } from "lucide-react";
import type { CoachingResponse } from "@/lib/api";
import { WordBreakdownChips } from "./WordBreakdownChips";
import { LabelChips } from "./LabelChips";
import { cn } from "@/lib/utils";

interface CoachingResultProps {
  result: CoachingResponse;
}

function Section({ icon: Icon, title, children, className }: { icon: React.ElementType; title: string; children: React.ReactNode; className?: string }) {
  return (
    <motion.div
      initial={{ y: 10, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      className={cn("rounded-xl border border-border bg-card p-4", className)}
    >
      <div className="flex items-center gap-2 mb-2">
        <Icon className="h-4 w-4 text-primary" />
        <h3 className="font-semibold text-sm">{title}</h3>
      </div>
      <div className="text-sm leading-relaxed text-foreground/85">{children}</div>
    </motion.div>
  );
}

export function CoachingResult({ result }: CoachingResultProps) {
  const { correctness, missAnalysis, teachingDecision, coachingText, wordBreakdown, conceptLabels, nextStep } = result;
  const isCorrect = correctness.isCorrect;

  return (
    <div className="space-y-3">
      {/* Quick Feedback Banner */}
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className={cn(
          "rounded-xl p-4 text-center",
          isCorrect ? "bg-success/10 border-2 border-success/30" : "bg-secondary/10 border-2 border-secondary/30"
        )}
      >
        <div className="flex items-center justify-center gap-2 mb-1">
          {isCorrect ? <CheckCircle2 className="h-6 w-6 text-success" /> : <XCircle className="h-6 w-6 text-secondary" />}
          <span className="font-display text-lg">{isCorrect ? "Correct!" : "Not quite!"}</span>
        </div>
        <p className="text-sm text-muted-foreground">{coachingText.shortFeedback}</p>
      </motion.div>

      {/* Word Breakdown */}
      {wordBreakdown?.displayChunks?.length > 0 && (
        <Section icon={Puzzle} title="Word Breakdown">
          <WordBreakdownChips chunks={wordBreakdown.displayChunks} reason={wordBreakdown.chunkReason} />
        </Section>
      )}

      {/* What Happened */}
      {!isCorrect && missAnalysis?.summary && (
        <Section icon={XCircle} title="What Happened">
          <p>{missAnalysis.summary}</p>
          {missAnalysis.errorTypes?.length > 0 && (
            <div className="mt-2">
              <LabelChips labels={missAnalysis.errorTypes} variant="warm" />
            </div>
          )}
        </Section>
      )}

      {/* Teaching Strategy */}
      <Section icon={Brain} title="Teaching Strategy">
        <p className="font-medium text-primary">{teachingDecision.primaryFocus}</p>
        <p className="text-xs text-muted-foreground mt-1">{teachingDecision.rationale}</p>
      </Section>

      {/* Explanation */}
      <Section icon={BookOpen} title="Explanation">
        <p>{coachingText.fullExplanation}</p>
      </Section>

      {/* Memory Tip */}
      {coachingText.memoryTip && (
        <Section icon={Lightbulb} title="Memory Tip">
          <p className="italic">{coachingText.memoryTip}</p>
        </Section>
      )}

      {/* Say It Aloud */}
      {coachingText.sayAloudTip && (
        <Section icon={Volume2} title="Say It Aloud">
          <p>{coachingText.sayAloudTip}</p>
        </Section>
      )}

      {/* Concept Labels */}
      {(conceptLabels.originLabels?.length > 0 || conceptLabels.patternLabels?.length > 0 || conceptLabels.morphologyLabels?.length > 0) && (
        <div className="rounded-xl border border-border bg-card p-4 space-y-2">
          <h3 className="font-semibold text-sm flex items-center gap-2">
            <Puzzle className="h-4 w-4 text-primary" />Concept Labels
          </h3>
          <LabelChips labels={conceptLabels.originLabels} variant="accent" title="Origin" />
          <LabelChips labels={conceptLabels.patternLabels} variant="default" title="Patterns" />
          <LabelChips labels={conceptLabels.morphologyLabels} variant="warm" title="Morphology" />
        </div>
      )}

      {/* Next Step */}
      <Section icon={ArrowRight} title="Next Step">
        <p>{nextStep.practiceFocus}</p>
        {nextStep.suggestedSimilarWordTypes?.length > 0 && (
          <div className="mt-2">
            <LabelChips labels={nextStep.suggestedSimilarWordTypes} variant="accent" title="Try words like" />
          </div>
        )}
      </Section>
    </div>
  );
}
