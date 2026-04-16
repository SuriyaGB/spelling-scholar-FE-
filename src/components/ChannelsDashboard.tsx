import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { GraduationCap, BookOpen, Globe, Sparkles, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  fetchCustomLists,
  fetchForeignOrigins,
  type CustomListSummary,
  type ForeignOriginSummary,
} from "@/lib/api";

export type ChannelSelection =
  | { kind: "standard" }
  | { kind: "customManage" }
  | { kind: "customList"; list: CustomListSummary }
  | { kind: "foreignManage" }
  | { kind: "foreignOrigin"; origin: ForeignOriginSummary };

interface ChannelsDashboardProps {
  onSelectChannel: (selection: ChannelSelection) => void;
}

interface CardConfig {
  key: string;
  title: string;
  subtitle: string;
  Icon: typeof GraduationCap;
  // Background and icon-color tokens — using semantic chip palette so themes work
  bgClass: string;
  iconColorClass: string;
  onClick: () => void;
}

export function ChannelsDashboard({ onSelectChannel }: ChannelsDashboardProps) {
  const [customLists, setCustomLists] = useState<CustomListSummary[]>([]);
  const [origins, setOrigins] = useState<ForeignOriginSummary[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        const [listsRes, originsRes] = await Promise.allSettled([
          fetchCustomLists(),
          fetchForeignOrigins(),
        ]);
        if (cancelled) return;
        if (listsRes.status === "fulfilled") setCustomLists(listsRes.value.lists || []);
        if (originsRes.status === "fulfilled") setOrigins(originsRes.value.origins || []);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    return () => {
      cancelled = true;
    };
  }, []);

  // Pastel rotation matched to wireframe (using semantic chip tokens for theme safety)
  const pastelClasses = [
    { bg: "bg-[hsl(var(--channel-green))]", icon: "text-chip-foreground" },
    { bg: "bg-[hsl(var(--channel-warm))]", icon: "text-chip-warm-foreground" },
    { bg: "bg-[hsl(var(--channel-purple))]", icon: "text-chip-accent-foreground" },
  ];

  const cards: CardConfig[] = [];

  // Standard Practice — always first, always primary tone
  cards.push({
    key: "standard",
    title: "Standard Practice",
    subtitle: "Words by level",
    Icon: GraduationCap,
    bgClass: "bg-[hsl(var(--channel-green))]",
    iconColorClass: "text-primary",
    onClick: () => onSelectChannel({ kind: "standard" }),
  });

  // Custom lists — one card per list
  customLists.forEach((list, i) => {
    const tone = pastelClasses[i % pastelClasses.length];
    cards.push({
      key: `list-${list.id}`,
      title: list.name,
      subtitle: `${list.wordCount} words`,
      Icon: BookOpen,
      bgClass: tone.bg,
      iconColorClass: tone.icon,
      onClick: () => onSelectChannel({ kind: "customList", list }),
    });
  });

  // "Manage lists" entry — lets users import / browse lists
  cards.push({
    key: "custom-manage",
    title: "My Lists",
    subtitle: customLists.length > 0 ? "Manage & import" : "Import a new list",
    Icon: BookOpen,
    bgClass: "bg-[hsl(var(--channel-warm))]",
    iconColorClass: "text-secondary",
    onClick: () => onSelectChannel({ kind: "customManage" }),
  });

  // Foreign origins — one card per origin
  origins.forEach((origin, i) => {
    const tone = pastelClasses[(i + 1) % pastelClasses.length];
    cards.push({
      key: `origin-${origin.origin}`,
      title: `${origin.origin} Words`,
      subtitle: `${origin.wordCount} words`,
      Icon: Globe,
      bgClass: tone.bg,
      iconColorClass: tone.icon,
      onClick: () => onSelectChannel({ kind: "foreignOrigin", origin }),
    });
  });

  cards.push({
    key: "foreign-manage",
    title: "Foreign Origins",
    subtitle: origins.length > 0 ? "Browse all origins" : "Explore by language",
    Icon: Globe,
    bgClass: "bg-[hsl(var(--channel-purple))]",
    iconColorClass: "text-accent",
    onClick: () => onSelectChannel({ kind: "foreignManage" }),
  });

  return (
    <div className="space-y-6">
      {/* Welcome heading */}
      <div className="text-center space-y-2">
        <h2 className="text-2xl sm:text-3xl font-display text-foreground tracking-tight">
          What will you practice today?
        </h2>
      </div>

      {/* Channels panel */}
      <div className="rounded-3xl border border-border bg-card/60 backdrop-blur-sm p-4 sm:p-6 shadow-sm">
        <div className="text-center mb-5">
          <div className="inline-flex items-center gap-1.5 text-sm font-semibold text-muted-foreground">
            <Sparkles className="h-3.5 w-3.5" />
            Practice Channels
          </div>
          <div className="flex justify-center gap-1 mt-2" aria-hidden>
            <span className="h-1.5 w-1.5 rounded-full bg-muted-foreground/30" />
            <span className="h-1.5 w-1.5 rounded-full bg-muted-foreground/50" />
            <span className="h-1.5 w-1.5 rounded-full bg-muted-foreground/30" />
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="h-5 w-5 animate-spin text-primary" />
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-4">
            {cards.map((card, idx) => {
              const Icon = card.Icon;
              return (
                <motion.button
                  key={card.key}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: Math.min(idx * 0.04, 0.4) }}
                  whileHover={{ y: -3 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={card.onClick}
                  className={cn(
                    "group relative flex flex-col items-center justify-center text-center",
                    "rounded-2xl p-4 aspect-[4/3] transition-all",
                    "shadow-sm hover:shadow-md focus:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                    card.bgClass
                  )}
                >
                  <div
                    className={cn(
                      "rounded-xl bg-background/60 p-2.5 mb-2 transition-transform group-hover:scale-110",
                      card.iconColorClass
                    )}
                  >
                    <Icon className="h-5 w-5" />
                  </div>
                  <h3 className="text-sm font-semibold text-foreground leading-tight line-clamp-2">
                    {card.title}
                  </h3>
                  <p className="text-[11px] text-muted-foreground mt-1">{card.subtitle}</p>
                </motion.button>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
