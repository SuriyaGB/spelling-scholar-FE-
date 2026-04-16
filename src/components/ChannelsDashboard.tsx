import { motion } from "framer-motion";
import { GraduationCap, List, Globe, ArrowRight, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";
import type { PracticeMode } from "@/components/PracticeModeSwitch";

interface ChannelsDashboardProps {
  onSelectChannel: (mode: PracticeMode) => void;
}

interface Channel {
  mode: PracticeMode;
  title: string;
  tagline: string;
  description: string;
  icon: typeof GraduationCap;
  accentClass: string;
  iconBgClass: string;
}

const CHANNELS: Channel[] = [
  {
    mode: "standard",
    title: "Standard Practice",
    tagline: "Pick a level and start spelling",
    description: "Curated words organized by grade level. Great for daily practice.",
    icon: GraduationCap,
    accentClass: "from-primary/15 to-primary/5 border-primary/30",
    iconBgClass: "bg-primary/15 text-primary",
  },
  {
    mode: "custom",
    title: "Custom Lists",
    tagline: "Practice your own word lists",
    description: "Import words from school, study packs, or anywhere else.",
    icon: List,
    accentClass: "from-secondary/20 to-secondary/5 border-secondary/30",
    iconBgClass: "bg-secondary/20 text-secondary",
  },
  {
    mode: "foreignOrigin",
    title: "Foreign Origin",
    tagline: "Explore words by language",
    description: "Italian, Spanish, and more — learn the patterns of each origin.",
    icon: Globe,
    accentClass: "from-accent/20 to-accent/5 border-accent/30",
    iconBgClass: "bg-accent/20 text-accent",
  },
];

export function ChannelsDashboard({ onSelectChannel }: ChannelsDashboardProps) {
  return (
    <div className="space-y-4">
      <div className="text-center space-y-1 mb-2">
        <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
          <Sparkles className="h-3 w-3" />
          Choose a channel
        </div>
        <p className="text-sm text-muted-foreground">
          Each channel is a different way to practice spelling.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {CHANNELS.map((channel, idx) => {
          const Icon = channel.icon;
          return (
            <motion.button
              key={channel.mode}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.06 }}
              whileHover={{ y: -2 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => onSelectChannel(channel.mode)}
              className={cn(
                "group relative overflow-hidden text-left rounded-2xl border-2 bg-gradient-to-br p-4 transition-all",
                "hover:shadow-lg",
                channel.accentClass,
                idx === 0 && "sm:col-span-2"
              )}
            >
              <div className="flex items-start gap-3">
                <div
                  className={cn(
                    "shrink-0 rounded-xl p-2.5 transition-transform group-hover:scale-110",
                    channel.iconBgClass
                  )}
                >
                  <Icon className="h-5 w-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <h3 className="text-base font-display text-foreground leading-tight">
                      {channel.title}
                    </h3>
                    <ArrowRight className="h-4 w-4 text-muted-foreground shrink-0 transition-transform group-hover:translate-x-0.5 group-hover:text-foreground" />
                  </div>
                  <p className="text-xs font-semibold text-foreground/80 mt-0.5">
                    {channel.tagline}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
                    {channel.description}
                  </p>
                </div>
              </div>
            </motion.button>
          );
        })}
      </div>
    </div>
  );
}
