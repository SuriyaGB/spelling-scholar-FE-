import { cn } from "@/lib/utils";

export type PracticeMode = "standard" | "custom" | "foreignOrigin";

interface PracticeModeSwitchProps {
  mode: PracticeMode;
  onChange: (mode: PracticeMode) => void;
}

const LABELS: Record<PracticeMode, string> = {
  standard: "Standard",
  custom: "Custom Lists",
  foreignOrigin: "Language Origin",
};

export function PracticeModeSwitch({ mode, onChange }: PracticeModeSwitchProps) {
  return (
    <div className="flex rounded-lg border border-border bg-card p-0.5">
      {(["standard", "custom", "foreignOrigin"] as const).map((m) => (
        <button
          key={m}
          onClick={() => onChange(m)}
          className={cn(
            "flex-1 rounded-md px-2 py-2 text-xs sm:text-sm font-semibold transition-all",
            mode === m
              ? "bg-primary text-primary-foreground shadow-sm"
              : "text-muted-foreground hover:text-foreground"
          )}
        >
          {LABELS[m]}
        </button>
      ))}
    </div>
  );
}
