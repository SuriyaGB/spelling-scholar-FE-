import { cn } from "@/lib/utils";

interface LabelChipsProps {
  labels: string[];
  variant?: "default" | "accent" | "warm";
  title?: string;
}

const variantClasses = {
  default: "bg-chip text-chip-foreground",
  accent: "bg-chip-accent text-chip-accent-foreground",
  warm: "bg-chip-warm text-chip-warm-foreground",
};

export function LabelChips({ labels, variant = "default", title }: LabelChipsProps) {
  if (!labels || labels.length === 0) return null;
  return (
    <div>
      {title && <p className="text-xs font-semibold text-muted-foreground mb-1.5 uppercase tracking-wide">{title}</p>}
      <div className="flex flex-wrap gap-1.5">
        {labels.map((label) => (
          <span
            key={label}
            className={cn("rounded-full px-2.5 py-1 text-xs font-medium", variantClasses[variant])}
          >
            {label}
          </span>
        ))}
      </div>
    </div>
  );
}
