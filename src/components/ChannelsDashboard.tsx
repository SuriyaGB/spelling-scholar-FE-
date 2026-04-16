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

  // "My Lists" entry — opens the list management/selection screen
  cards.push({
    key: "custom-manage",
    title: "My Lists",
    subtitle: customLists.length > 0 ? `${customLists.length} list${customLists.length === 1 ? "" : "s"}` : "Import a new list",
    Icon: BookOpen,
    bgClass: "bg-[hsl(var(--channel-warm))]",
    iconColorClass: "text-secondary",
    onClick: () => onSelectChannel({ kind: "customManage" }),
  });

  // "Foreign Origins" entry — opens the origin browse screen
  cards.push({
    key: "foreign-manage",
    title: "Foreign Origins",
    subtitle: origins.length > 0 ? `${origins.length} language${origins.length === 1 ? "" : "s"}` : "Explore by language",
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

      {/* Channels panel — borderless, just a soft section */}
      <div className="px-1 sm:px-2">
        <div className="text-center mb-5">
          <div className="inline-flex items-center gap-1.5 text-sm font-semibold text-muted-foreground/80">
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
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 sm:gap-5 auto-rows-fr">
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
                    "rounded-2xl p-5 aspect-square transition-all",
                    "shadow-sm hover:shadow-md focus:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                    card.bgClass
                  )}
                >
                  <div
                    className={cn(
                      "rounded-xl bg-background/60 p-3 mb-3 transition-transform group-hover:scale-110",
                      card.iconColorClass
                    )}
                  >
                    <Icon className="h-6 w-6" />
                  </div>
                  <h3 className="text-sm font-semibold text-foreground/70 leading-tight line-clamp-2">
                    {card.title}
                  </h3>
                  <p className="text-[11px] text-muted-foreground/80 mt-1">{card.subtitle}</p>
                </motion.button>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
