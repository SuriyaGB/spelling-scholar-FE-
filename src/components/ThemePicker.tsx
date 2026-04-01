import { useState, useRef, useEffect } from "react";
import { Palette } from "lucide-react";
import { cn } from "@/lib/utils";

export type ThemeKey = "default" | "warm" | "bright" | "nature" | "space" | "candy" | "bee";

interface ThemeOption {
  key: ThemeKey;
  label: string;
  emoji: string;
  description: string;
  colors: [string, string, string]; // 3 preview swatches
}

const THEMES: ThemeOption[] = [
  {
    key: "default",
    label: "Classic Teal",
    emoji: "🎓",
    description: "Professional & focused",
    colors: ["hsl(168,55%,38%)", "hsl(35,80%,56%)", "hsl(250,45%,58%)"],
  },
  {
    key: "warm",
    label: "Warm Sunset",
    emoji: "🌅",
    description: "Cozy orange & pink tones",
    colors: ["hsl(28,85%,56%)", "hsl(340,45%,62%)", "hsl(45,75%,55%)"],
  },
  {
    key: "bright",
    label: "Bright & Bold",
    emoji: "🎨",
    description: "Primary colors, big energy",
    colors: ["hsl(220,85%,55%)", "hsl(0,80%,58%)", "hsl(48,95%,52%)"],
  },
  {
    key: "nature",
    label: "Nature Trail",
    emoji: "🌿",
    description: "Forest greens & sky blues",
    colors: ["hsl(145,55%,38%)", "hsl(195,65%,48%)", "hsl(35,70%,50%)"],
  },
  {
    key: "space",
    label: "Cosmic",
    emoji: "🚀",
    description: "Deep purple & neon glow",
    colors: ["hsl(270,75%,62%)", "hsl(180,100%,50%)", "hsl(320,80%,60%)"],
  },
  {
    key: "candy",
    label: "Candy Pastel",
    emoji: "🍬",
    description: "Soft pinks & lavender",
    colors: ["hsl(310,55%,62%)", "hsl(165,50%,55%)", "hsl(260,55%,68%)"],
  },
  {
    key: "bee",
    label: "Spelling Bee",
    emoji: "🐝",
    description: "Honeycomb gold & amber",
    colors: ["hsl(40,90%,48%)", "hsl(30,75%,30%)", "hsl(48,95%,55%)"],
  },
];

interface ThemePickerProps {
  current: ThemeKey;
  onChange: (theme: ThemeKey) => void;
}

export function ThemePicker({ current, onChange }: ThemePickerProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen((v) => !v)}
        className="p-2 rounded-lg bg-muted hover:bg-muted/70 transition-colors"
        title="Change theme"
      >
        <Palette className="h-4 w-4 text-muted-foreground" />
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-2 z-50 w-64 rounded-xl border border-border bg-popover p-2 shadow-lg animate-pop-in">
          <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold px-2 py-1">
            Choose a theme
          </p>
          {THEMES.map((t) => (
            <button
              key={t.key}
              onClick={() => { onChange(t.key); setOpen(false); }}
              className={cn(
                "w-full flex items-center gap-3 rounded-lg px-2.5 py-2 text-left transition-colors",
                current === t.key
                  ? "bg-primary/10 ring-1 ring-primary/30"
                  : "hover:bg-muted"
              )}
            >
              <span className="text-lg">{t.emoji}</span>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold truncate">{t.label}</p>
                <p className="text-[10px] text-muted-foreground truncate">{t.description}</p>
              </div>
              <div className="flex gap-0.5">
                {t.colors.map((c, i) => (
                  <span
                    key={i}
                    className="h-3 w-3 rounded-full border border-border/40"
                    style={{ backgroundColor: c }}
                  />
                ))}
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
