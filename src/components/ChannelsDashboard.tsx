import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { GraduationCap, BookOpen, Globe, Sparkles, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/hooks/use-auth";
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
  const { user } = useAuth();
  const [customLists, setCustomLists] = useState<CustomListSummary[]>([]);
  const [origins, setOrigins] = useState<ForeignOriginSummary[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        // Only fetch custom lists when authenticated to avoid 401 noise.
        const [listsRes, originsRes] = await Promise.allSettled([
          user ? fetchCustomLists() : Promise.resolve({ lists: [] as CustomListSummary[] }),
          fetchForeignOrigins(),
        ]);
        if (cancelled) return;
        if (listsRes.status === "fulfilled") setCustomLists(listsRes.value.lists || []);
        else setCustomLists([]);
        if (originsRes.status === "fulfilled") setOrigins(originsRes.value.origins || []);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    return () => {
      cancelled = true;
    };
  }, [user]);

  const cards: CardConfig[] = [
    {
      key: "standard",
      title: "Standard Practice",
      subtitle: "Curated words organized by level. Pick a grade band and start drilling.",
      Icon: GraduationCap,
      bgClass: "bg-[hsl(var(--channel-green))]",
      iconColorClass: "text-primary",
      onClick: () => onSelectChannel({ kind: "standard" }),
    },
    {
      key: "custom-manage",
      title: "My Lists",
      subtitle: !user
        ? "Sign in to import your own word lists from a CSV or text file."
        : customLists.length > 0
          ? `${customLists.length} saved list${customLists.length === 1 ? "" : "s"}. Practice or import more.`
          : "Import a new list from a CSV or text file to practice your own words.",
      Icon: BookOpen,
      bgClass: "bg-[hsl(var(--channel-warm))]",
      iconColorClass: "text-secondary",
      onClick: () => onSelectChannel({ kind: "customManage" }),
    },
    {
      key: "foreign-manage",
      title: "Foreign Origins",
      subtitle:
        origins.length > 0
          ? `Explore ${origins.length} language${origins.length === 1 ? "" : "s"} of origin and master tricky loanwords.`
          : "Explore words grouped by their language of origin.",
      Icon: Globe,
      bgClass: "bg-[hsl(var(--channel-purple))]",
      iconColorClass: "text-accent",
      onClick: () => onSelectChannel({ kind: "foreignManage" }),
    },
  ];

  return (
    <div className="space-y-10 sm:space-y-14">
      {/* Hero */}
      <div className="text-center max-w-3xl mx-auto pt-4 sm:pt-8 space-y-4">
        <div className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-primary bg-primary/10 rounded-full px-3 py-1">
          <Sparkles className="h-3.5 w-3.5" />
          Spelling Coach
        </div>
        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-display font-bold tracking-tight text-foreground leading-[1.05]">
          Master every word, <span className="text-primary">one at a time.</span>
        </h1>
        <p className="text-base sm:text-lg text-muted-foreground max-w-xl mx-auto leading-relaxed">
          Practice spelling with audio pronunciation, smart hints, and personalized coaching. Choose a channel below to begin.
        </p>
      </div>

      {/* Channel cards — webapp grid */}
      <div>
        <div className="flex items-baseline justify-between mb-5 px-1">
          <h2 className="text-lg sm:text-xl font-display font-semibold text-foreground">Practice channels</h2>
          <span className="text-xs text-muted-foreground">{cards.length} ways to practice</span>
        </div>

        {loading ? (
          <div className="flex justify-center py-16">
            <Loader2 className="h-5 w-5 animate-spin text-primary" />
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
            {cards.map((card, idx) => {
              const Icon = card.Icon;
              return (
                <motion.button
                  key={card.key}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: Math.min(idx * 0.05, 0.4) }}
                  whileHover={{ y: -2 }}
                  onClick={card.onClick}
                  className={cn(
                    "group relative flex flex-col items-start text-left",
                    "rounded-2xl p-6 min-h-[180px] bg-card border border-border/60",
                    "transition-all shadow-sm hover:shadow-lg hover:border-primary/40",
                    "focus:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  )}
                >
                  <div
                    className={cn(
                      "rounded-xl p-2.5 mb-4 transition-transform group-hover:scale-110",
                      card.bgClass,
                      card.iconColorClass
                    )}
                  >
                    <Icon className="h-5 w-5" />
                  </div>
                  <h3 className="text-lg font-display font-semibold text-foreground leading-tight">
                    {card.title}
                  </h3>
                  <p className="text-sm text-muted-foreground mt-1.5 leading-relaxed">
                    {card.subtitle}
                  </p>
                </motion.button>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
