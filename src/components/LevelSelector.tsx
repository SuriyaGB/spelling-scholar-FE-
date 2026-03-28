import { cn } from "@/lib/utils";

const levels = [
  { level: 1, label: "Level 1", desc: "Grades 1–3" },
  { level: 2, label: "Level 2", desc: "Grades 4–6" },
  { level: 3, label: "Level 3", desc: "Grades 7–9" },
];

interface LevelSelectorProps {
  selected: number;
  onSelect: (level: number) => void;
}

export function LevelSelector({ selected, onSelect }: LevelSelectorProps) {
  return (
    <div className="flex gap-2">
      {levels.map((l) => (
        <button
          key={l.level}
          onClick={() => onSelect(l.level)}
          className={cn(
            "flex-1 rounded-lg px-3 py-2.5 text-sm font-semibold transition-all border-2",
            selected === l.level
              ? "border-primary bg-primary text-primary-foreground shadow-md"
              : "border-border bg-card text-foreground hover:border-primary/40"
          )}
        >
          <div>{l.label}</div>
          <div className={cn(
            "text-xs font-normal mt-0.5",
            selected === l.level ? "text-primary-foreground/80" : "text-muted-foreground"
          )}>{l.desc}</div>
        </button>
      ))}
    </div>
  );
}
