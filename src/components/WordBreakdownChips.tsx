import { motion } from "framer-motion";

interface WordBreakdownChipsProps {
  chunks: string[];
  reason: string;
}

export function WordBreakdownChips({ chunks, reason }: WordBreakdownChipsProps) {
  if (!chunks || chunks.length === 0) return null;
  return (
    <div>
      <div className="flex flex-wrap gap-1 justify-center">
        {chunks.map((chunk, i) => (
          <motion.span
            key={i}
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: i * 0.1 }}
            className="rounded-lg bg-primary/10 text-primary px-3 py-2 text-xl font-bold font-display tracking-widest"
          >
            {chunk}
          </motion.span>
        ))}
      </div>
      {reason && (
        <p className="text-xs text-muted-foreground text-center mt-2">{reason}</p>
      )}
    </div>
  );
}
