import { motion, AnimatePresence } from "framer-motion";
import { Sun, Moon, Flame, Snowflake, BookOpen } from "lucide-react";
import { useThemeStore } from "@/stores/themeStore";

const accentIcons = {
  warm: Flame,
  cool: Snowflake,
  scrapbook: BookOpen,
};

const accentLabels = {
  warm: "暖色调",
  cool: "冷色调",
  scrapbook: "手账拼贴",
};

export default function ThemeToggle() {
  const { mode, accent, toggleMode, toggleAccent } = useThemeStore();
  const AccentIcon = accentIcons[accent];

  return (
    <div className="flex items-center gap-1.5">
      {/* Mode toggle: light <-> dark */}
      <motion.button
        onClick={toggleMode}
        className="relative w-9 h-9 rounded-xl flex items-center justify-center overflow-hidden"
        style={{
          background: "var(--bg-muted)",
          border: "1px solid var(--border)",
        }}
        whileHover={{ scale: 1.08 }}
        whileTap={{ scale: 0.92 }}
        aria-label={mode === "light" ? "切换到深色模式" : "切换到浅色模式"}
      >
        <AnimatePresence mode="wait" initial={false}>
          {mode === "light" ? (
            <motion.div
              key="sun"
              initial={{ rotate: -90, opacity: 0, scale: 0.5 }}
              animate={{ rotate: 0, opacity: 1, scale: 1 }}
              exit={{ rotate: 90, opacity: 0, scale: 0.5 }}
              transition={{ type: "spring", stiffness: 300, damping: 28 }}
            >
              <Sun className="w-4 h-4" style={{ color: "var(--accent)" }} />
            </motion.div>
          ) : (
            <motion.div
              key="moon"
              initial={{ rotate: -90, opacity: 0, scale: 0.5 }}
              animate={{ rotate: 0, opacity: 1, scale: 1 }}
              exit={{ rotate: 90, opacity: 0, scale: 0.5 }}
              transition={{ type: "spring", stiffness: 300, damping: 28 }}
            >
              <Moon className="w-4 h-4" style={{ color: "var(--accent)" }} />
            </motion.div>
          )}
        </AnimatePresence>
      </motion.button>

      {/* Accent toggle: warm -> cool -> scrapbook -> warm */}
      <motion.button
        onClick={toggleAccent}
        className="relative w-9 h-9 rounded-xl flex items-center justify-center overflow-hidden"
        style={{
          background: accent === "scrapbook" ? "var(--accent-soft)" : "var(--accent-soft)",
          border: accent === "scrapbook" ? "1px solid var(--accent-muted)" : "1px solid var(--border-accent)",
        }}
        whileHover={{ scale: 1.08 }}
        whileTap={{ scale: 0.92 }}
        aria-label={accentLabels[accent]}
        title={accentLabels[accent]}
      >
        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={accent}
            initial={{ rotate: -90, opacity: 0, scale: 0.5 }}
            animate={{ rotate: 0, opacity: 1, scale: 1 }}
            exit={{ rotate: 90, opacity: 0, scale: 0.5 }}
            transition={{ type: "spring", stiffness: 300, damping: 28 }}
          >
            <AccentIcon className="w-4 h-4" style={{ color: "var(--accent)" }} />
          </motion.div>
        </AnimatePresence>
      </motion.button>
    </div>
  );
}
