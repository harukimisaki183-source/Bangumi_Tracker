import { motion, AnimatePresence } from 'framer-motion';
import { X, Sun, Moon, Flame, Snowflake, BookOpen, Globe } from 'lucide-react';
import { useThemeStore, type ColorMode, type AccentScheme } from '@/stores/themeStore';
import { useI18nStore, useTranslation, type Language } from '@/stores/i18nStore';

interface SettingsDialogProps {
  open: boolean;
  onClose: () => void;
}

const modeOptions: { value: ColorMode; icon: typeof Sun; labelKey: 'settings.theme.light' | 'settings.theme.dark' }[] = [
  { value: 'light', icon: Sun, labelKey: 'settings.theme.light' },
  { value: 'dark', icon: Moon, labelKey: 'settings.theme.dark' },
];

const accentOptions: { value: AccentScheme; icon: typeof Flame; labelKey: 'settings.theme.warm' | 'settings.theme.cool' }[] = [
  { value: 'warm', icon: Flame, labelKey: 'settings.theme.warm' },
  { value: 'cool', icon: Snowflake, labelKey: 'settings.theme.cool' },
];

const langOptions: { value: Language; labelKey: 'settings.language.zh' | 'settings.language.en' }[] = [
  { value: 'zh', labelKey: 'settings.language.zh' },
  { value: 'en', labelKey: 'settings.language.en' },
];

export default function SettingsDialog({ open, onClose }: SettingsDialogProps) {
  const { mode, accent, setMode, setAccent } = useThemeStore();
  const { lang, setLang } = useI18nStore();
  const { t } = useTranslation();

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-[100] flex items-center justify-center px-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          {/* Backdrop */}
          <motion.div
            className="absolute inset-0"
            style={{ background: 'var(--overlay)' }}
            onClick={onClose}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          />

          {/* Dialog */}
          <motion.div
            className="relative w-full max-w-md overflow-hidden"
            style={{
              background: 'var(--card-bg)',
              border: '1px solid var(--border)',
              borderRadius: 'var(--radius-glass)',
              boxShadow: 'var(--card-shadow-hover)',
            }}
            initial={{ opacity: 0, scale: 0.95, y: 12 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 12 }}
            transition={{ type: 'spring', stiffness: 300, damping: 28 }}
          >
            {/* Header */}
            <div
              className="flex items-center justify-between px-6 py-4"
              style={{ borderBottom: '1px solid var(--border)' }}
            >
              <h2
                className="heading-section text-lg"
                style={{ color: 'var(--text-primary)' }}
              >
                {t('settings.title')}
              </h2>
              <motion.button
                onClick={onClose}
                className="w-8 h-8 rounded-lg flex items-center justify-center"
                style={{ color: 'var(--text-tertiary)' }}
                whileHover={{ scale: 1.1, color: 'var(--text-primary)' }}
                whileTap={{ scale: 0.9 }}
              >
                <X className="w-4 h-4" />
              </motion.button>
            </div>

            <div className="px-6 py-5 space-y-6">
              {/* ── Mode Selection ──────────────────────────────── */}
              <div>
                <label
                  className="text-sm font-medium mb-3 block"
                  style={{ color: 'var(--text-secondary)', fontFamily: 'var(--font-display)' }}
                >
                  {t('settings.theme')} — {mode === 'light' ? t('settings.theme.light') : t('settings.theme.dark')}
                </label>
                <div className="flex gap-2">
                  {modeOptions.map((opt) => {
                    const Icon = opt.icon;
                    const active = mode === opt.value;
                    return (
                      <motion.button
                        key={opt.value}
                        onClick={() => setMode(opt.value)}
                        className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-medium transition-colors"
                        style={{
                          fontFamily: 'var(--font-display)',
                          background: active ? 'var(--accent-soft)' : 'var(--bg-muted)',
                          color: active ? 'var(--accent)' : 'var(--text-tertiary)',
                          border: active ? '1.5px solid var(--accent)' : '1.5px solid var(--border)',
                        }}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        <Icon className="w-4 h-4" />
                        {t(opt.labelKey)}
                      </motion.button>
                    );
                  })}
                </div>
              </div>

              {/* ── Accent Selection ────────────────────────────── */}
              <div>
                <label
                  className="text-sm font-medium mb-3 block"
                  style={{ color: 'var(--text-secondary)', fontFamily: 'var(--font-display)' }}
                >
                  {t('settings.theme')} — 色调
                </label>

                {/* Standard accents */}
                <div className="flex gap-2 mb-3">
                  {accentOptions.map((opt) => {
                    const Icon = opt.icon;
                    const active = accent === opt.value;
                    return (
                      <motion.button
                        key={opt.value}
                        onClick={() => setAccent(opt.value)}
                        className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-medium transition-colors"
                        style={{
                          fontFamily: 'var(--font-display)',
                          background: active ? 'var(--accent-soft)' : 'var(--bg-muted)',
                          color: active ? 'var(--accent)' : 'var(--text-tertiary)',
                          border: active ? '1.5px solid var(--accent)' : '1.5px solid var(--border)',
                        }}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        <Icon className="w-4 h-4" />
                        {t(opt.labelKey)}
                      </motion.button>
                    );
                  })}
                </div>

                {/* Premium theme */}
                <div>
                  <span
                    className="text-xs font-medium mb-2 flex items-center gap-1.5"
                    style={{ color: 'var(--text-tertiary)', fontFamily: 'var(--font-display)' }}
                  >
                    ✨ {t('settings.theme.premium')}
                  </span>
                  <motion.button
                    onClick={() => setAccent('scrapbook')}
                    className="w-full flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-medium transition-colors"
                    style={{
                      fontFamily: 'var(--font-display)',
                      background: accent === 'scrapbook'
                        ? 'linear-gradient(135deg, #FFE8D6 0%, #E8DDD4 100%)'
                        : 'var(--bg-muted)',
                      color: accent === 'scrapbook' ? '#6B4C3B' : 'var(--text-tertiary)',
                      border: accent === 'scrapbook'
                        ? '1.5px solid #D4A574'
                        : '1.5px solid var(--border)',
                    }}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <BookOpen className="w-4 h-4" />
                    {t('settings.theme.scrapbook')}
                    <span className="text-[10px] ml-1 opacity-60">📓</span>
                  </motion.button>
                </div>
              </div>

              {/* ── Language Selection ──────────────────────────── */}
              <div>
                <label
                  className="text-sm font-medium mb-3 flex items-center gap-1.5"
                  style={{ color: 'var(--text-secondary)', fontFamily: 'var(--font-display)' }}
                >
                  <Globe className="w-4 h-4" />
                  {t('settings.language')}
                </label>
                <div className="flex gap-2">
                  {langOptions.map((opt) => {
                    const active = lang === opt.value;
                    return (
                      <motion.button
                        key={opt.value}
                        onClick={() => setLang(opt.value)}
                        className="flex-1 py-3 rounded-xl text-sm font-medium transition-colors"
                        style={{
                          fontFamily: 'var(--font-display)',
                          background: active ? 'var(--accent-soft)' : 'var(--bg-muted)',
                          color: active ? 'var(--accent)' : 'var(--text-tertiary)',
                          border: active ? '1.5px solid var(--accent)' : '1.5px solid var(--border)',
                        }}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        {t(opt.labelKey)}
                      </motion.button>
                    );
                  })}
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
