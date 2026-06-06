import { motion, AnimatePresence } from 'framer-motion';
import { Sun, Moon, Flame, Snowflake } from 'lucide-react';
import { useThemeStore } from '@/stores/themeStore';

export default function ThemeToggle() {
  const { mode, accent, toggleMode, toggleAccent } = useThemeStore();

  return (
    <div className="flex items-center gap-1.5">
      {/* Mode toggle: light ↔ dark */}
      <motion.button
        onClick={toggleMode}
        className="relative w-9 h-9 rounded-xl flex items-center justify-center overflow-hidden"
        style={{
          background: 'var(--bg-muted)',
          border: '1px solid var(--border)',
        }}
        whileHover={{ scale: 1.08 }}
        whileTap={{ scale: 0.92 }}
        aria-label={mode === 'light' ? '切换到深色模式' : '切换到浅色模式'}
      >
        <AnimatePresence mode="wait" initial={false}>
          {mode === 'light' ? (
            <motion.div
              key="sun"
              initial={{ rotate: -90, opacity: 0, scale: 0.5 }}
              animate={{ rotate: 0, opacity: 1, scale: 1 }}
              exit={{ rotate: 90, opacity: 0, scale: 0.5 }}
              transition={{ type: 'spring', stiffness: 300, damping: 28 }}
            >
              <Sun className="w-4 h-4" style={{ color: 'var(--accent)' }} />
            </motion.div>
          ) : (
            <motion.div
              key="moon"
              initial={{ rotate: -90, opacity: 0, scale: 0.5 }}
              animate={{ rotate: 0, opacity: 1, scale: 1 }}
              exit={{ rotate: 90, opacity: 0, scale: 0.5 }}
              transition={{ type: 'spring', stiffness: 300, damping: 28 }}
            >
              <Moon className="w-4 h-4" style={{ color: 'var(--accent)' }} />
            </motion.div>
          )}
        </AnimatePresence>
      </motion.button>

      {/* Accent toggle: warm ↔ cool */}
      <motion.button
        onClick={toggleAccent}
        className="relative w-9 h-9 rounded-xl flex items-center justify-center overflow-hidden"
        style={{
          background: 'var(--accent-soft)',
          border: '1px solid var(--border-accent)',
        }}
        whileHover={{ scale: 1.08 }}
        whileTap={{ scale: 0.92 }}
        aria-label={accent === 'warm' ? '切换到冷色调' : '切换到暖色调'}
      >
        <AnimatePresence mode="wait" initial={false}>
          {accent === 'warm' ? (
            <motion.div
              key="flame"
              initial={{ rotate: -90, opacity: 0, scale: 0.5 }}
              animate={{ rotate: 0, opacity: 1, scale: 1 }}
              exit={{ rotate: 90, opacity: 0, scale: 0.5 }}
              transition={{ type: 'spring', stiffness: 300, damping: 28 }}
            >
              <Flame className="w-4 h-4" style={{ color: 'var(--accent)' }} />
            </motion.div>
          ) : (
            <motion.div
              key="snowflake"
              initial={{ rotate: -90, opacity: 0, scale: 0.5 }}
              animate={{ rotate: 0, opacity: 1, scale: 1 }}
              exit={{ rotate: 90, opacity: 0, scale: 0.5 }}
              transition={{ type: 'spring', stiffness: 300, damping: 28 }}
            >
              <Snowflake className="w-4 h-4" style={{ color: 'var(--accent)' }} />
            </motion.div>
          )}
        </AnimatePresence>
      </motion.button>
    </div>
  );
}
