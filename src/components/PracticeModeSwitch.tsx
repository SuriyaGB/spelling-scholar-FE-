import { cn } from "@/lib/utils";

export type PracticeMode = "standard" | "custom";

interface PracticeModeSwitchProps {
  mode: PracticeMode;
  onChange: (mode: PracticeMode) => void;
}

export function PracticeModeSwitch({ mode, onChange }: PracticeModeSwitchProps) {
  return (
    <div className="flex rounded-lg border border-border bg-card p-0.5">
      {(["standard", "custom"] as const).map((m) => (
        <button
          key={m}
          onClick={() => onChange(m)}
          className={cn(
            "flex-1 rounded-md px-3 py-2 text-sm font-semibold transition-all",
            mode === m
              ? "bg-primary text-primary-foreground shadow-sm"
              : "text-muted-foreground hover:text-foreground"
          )}
        >
          {m === "standard" ? "Standard Practice" : "Custom Lists"}
        </button>
      ))}
    </div>
  );
}
