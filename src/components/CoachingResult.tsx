import { motion } from "framer-motion";
import {
  CheckCircle2, XCircle, Lightbulb, BookOpen, Puzzle, Volume2,
  ArrowRight, Brain, Layers, Target, Shapes, BookText
} from "lucide-react";
import type { CoachingResponse } from "@/lib/api";
import { WordBreakdownChips } from "./WordBreakdownChips";
import { LabelChips } from "./LabelChips";
import { ConfidenceBar } from "./ConfidenceBar";
import { TeachingCard, FormTeachingContent, ConceptTeachingContent } from "./TeachingCard";
import { BooleanStatusRow } from "./BooleanStatusRow";
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

const relevanceBadgeStyle: Record<string, string> = {
  form: "bg-primary/10 text-primary",
  concept: "bg-chip-accent text-chip-accent-foreground",
  mixed: "bg-warning/10 text-warning",
  unclear: "bg-muted text-muted-foreground",
};

export function CoachingResult({ result }: CoachingResultProps) {
  const { correctness, missAnalysis, wordTeaching, errorRelevance, teachingDecision, coachingText, wordBreakdown, conceptLabels, nextStep } = result;
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
          {missAnalysis.primaryErrorFocus && (
            <p className="text-xs mt-1.5"><span className="font-semibold text-primary">Focus:</span> {missAnalysis.primaryErrorFocus}</p>
          )}
          {missAnalysis.errorTypes?.length > 0 && (
            <div className="mt-2">
              <LabelChips labels={missAnalysis.errorTypes} variant="warm" />
            </div>
          )}
          <BooleanStatusRow
            className="mt-2.5"
            items={[
              { label: "Wrong word interpretation", value: !!missAnalysis.likelyWrongWordInterpretation },
              { label: "Used meaning disambiguation", value: !!missAnalysis.usedMeaningDisambiguationWell },
            ]}
          />
        </Section>
      )}

      {/* Teach The Word */}
      {wordTeaching && (
        <motion.div initial={{ y: 10, opacity: 0 }} animate={{ y: 0, opacity: 1 }}>
          <div className="flex items-center gap-2 mb-2">
            <Layers className="h-4 w-4 text-primary" />
            <h3 className="font-semibold text-sm">Teach The Word</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <TeachingCard title="Form Teaching" icon={<Shapes className="h-4 w-4 text-primary" />}>
              <FormTeachingContent data={wordTeaching.formTeaching} />
            </TeachingCard>
            <TeachingCard title="Concept Teaching" icon={<BookText className="h-4 w-4 text-primary" />}>
              <ConceptTeachingContent data={wordTeaching.conceptTeaching} />
            </TeachingCard>
          </div>
        </motion.div>
      )}

      {/* What Matters Most For This Error */}
      {errorRelevance && (
        <Section icon={Target} title="What Matters Most For This Error">
          <div className="flex items-center gap-2 mb-2">
            <span className={cn(
              "rounded-full px-2.5 py-1 text-xs font-semibold capitalize",
              relevanceBadgeStyle[errorRelevance.mostRelevantToError] || relevanceBadgeStyle.unclear
            )}>
              {errorRelevance.mostRelevantToError}
            </span>
          </div>
          <ConfidenceBar confidence={errorRelevance.confidence} label="Confidence" />
          {errorRelevance.reason && <p className="mt-2 text-xs text-muted-foreground">{errorRelevance.reason}</p>}
        </Section>
      )}

      {/* Teaching Decision */}
      <Section icon={Brain} title="Teaching Decision">
        <p className="font-medium text-primary">{teachingDecision.primaryFocus}</p>
        <div className="flex items-center gap-2 mt-1.5">
          <span className="text-xs rounded-full bg-primary/10 text-primary px-2 py-0.5 font-medium capitalize">{teachingDecision.strategy}</span>
          {teachingDecision.secondaryFocuses?.length > 0 && (
            <LabelChips labels={teachingDecision.secondaryFocuses} variant="default" />
          )}
        </div>
        <ConfidenceBar confidence={teachingDecision.confidence} label="Confidence" className="mt-2" />
        <p className="text-xs text-muted-foreground mt-1.5">{teachingDecision.rationale}</p>
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

      {/* Concept Labels (secondary analytics) */}
      {(conceptLabels?.originLabels?.length > 0 || conceptLabels?.patternLabels?.length > 0 || conceptLabels?.morphologyLabels?.length > 0) && (
        <div className="rounded-xl border border-border bg-card/60 p-4 space-y-2">
          <h3 className="font-semibold text-xs flex items-center gap-2 text-muted-foreground uppercase tracking-wide">
            <Puzzle className="h-3.5 w-3.5" /> Concept Labels
          </h3>
          <LabelChips labels={conceptLabels.patternLabels} variant="default" title="Patterns" />
          <LabelChips labels={conceptLabels.originLabels} variant="accent" title="Origin" />
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
