import { cn } from "@/lib/utils";

interface ConfidenceBarProps {
  confidence: number;
  label?: string;
  className?: string;
}

export function ConfidenceBar({ confidence, label, className }: ConfidenceBarProps) {
  const pct = Math.round(confidence * 100);
  const level = confidence >= 0.7 ? "high" : confidence >= 0.4 ? "mid" : "low";

  return (
    <div className={cn("space-y-1", className)}>
      {label && (
        <div className="flex items-center justify-between text-xs">
          <span className="text-muted-foreground font-medium">{label}</span>
          <span className="font-semibold text-foreground">{pct}%</span>
        </div>
      )}
      <div className="h-2 rounded-full bg-muted overflow-hidden">
        <div
          className={cn(
            "h-full rounded-full transition-all duration-500",
            level === "high" && "bg-success",
            level === "mid" && "bg-warning",
            level === "low" && "bg-muted-foreground/40"
          )}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}
