import { CheckCircle2, XCircle } from "lucide-react";
import { cn } from "@/lib/utils";

interface BooleanStatusRowProps {
  items: { label: string; value: boolean }[];
  className?: string;
}

export function BooleanStatusRow({ items, className }: BooleanStatusRowProps) {
  return (
    <div className={cn("flex flex-wrap gap-3", className)}>
      {items.map((item) => (
        <div key={item.label} className="flex items-center gap-1.5 text-xs">
          {item.value ? (
            <CheckCircle2 className="h-3.5 w-3.5 text-success" />
          ) : (
            <XCircle className="h-3.5 w-3.5 text-muted-foreground" />
          )}
          <span className="text-muted-foreground">{item.label}</span>
        </div>
      ))}
    </div>
  );
}
