import { useState, useRef, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Bell, Sparkles, Wrench, TrendingUp } from "lucide-react";
import { changelog, CURRENT_VERSION, type ChangelogEntry } from "@/data/changelog";
import { useTranslation } from "@/stores/i18nStore";

const LAST_SEEN_KEY = "bangumi-last-seen-changelog";

function getLastSeenId(): string | null {
  try { return localStorage.getItem(LAST_SEEN_KEY); } catch { return null; }
}

function setLastSeenId(id: string) {
  try { localStorage.setItem(LAST_SEEN_KEY, id); } catch {}
}

export default function NotificationBell() {
  const [open, setOpen] = useState(false);
  const [hasUnread, setHasUnread] = useState(() => {
    const lastSeen = getLastSeenId();
    return !lastSeen || lastSeen !== changelog[0]?.id;
  });
  const containerRef = useRef<HTMLDivElement>(null);
  const { t } = useTranslation();

  const typeConfig: Record<ChangelogEntry["type"], { icon: typeof Bell; color: string; label: string }> = {
    feature: { icon: Sparkles, color: "var(--accent)", label: t("notification.feature") },
    fix: { icon: Wrench, color: "var(--error)", label: t("notification.fix") },
    improvement: { icon: TrendingUp, color: "var(--success)", label: t("notification.improvement") },
  };

  const markAsRead = useCallback(() => {
    if (changelog[0]) {
      setLastSeenId(changelog[0].id);
      setHasUnread(false);
    }
  }, []);

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  useEffect(() => {
    if (open) {
      markAsRead();
    }
  }, [open, markAsRead]);

  return (
    <div ref={containerRef} className="relative">
      <motion.button
        onClick={() => setOpen((v) => !v)}
        className="relative flex items-center gap-1.5 text-sm font-medium transition-colors"
        style={{
          fontFamily: "var(--font-display)",
          color: open ? "var(--accent)" : "var(--text-secondary)",
        }}
        whileHover={{ color: "var(--accent)" }}
        whileTap={{ scale: 0.95 }}
      >
        <Bell className="w-4 h-4" />
        {t("nav.messages")}
        {hasUnread && (
          <motion.span
            className="absolute -top-1 -right-1 w-2 h-2 rounded-full"
            style={{ background: "var(--accent)" }}
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            exit={{ scale: 0 }}
            transition={{ type: "spring", stiffness: 400, damping: 20 }}
          />
        )}
      </motion.button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 8, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.96 }}
            transition={{ duration: 0.2, ease: [0.4, 0, 0.2, 1] }}
            className="absolute right-0 top-full mt-2 w-80 rounded-2xl overflow-hidden z-50"
            style={{
              background: "var(--card-bg)",
              border: "1px solid var(--border)",
              boxShadow: "var(--card-shadow-hover)",
            }}
          >
            <div
              className="px-4 py-3 flex items-center justify-between"
              style={{ borderBottom: "1px solid var(--border)" }}
            >
              <div className="flex items-center gap-2">
                <span
                  className="text-sm font-semibold"
                  style={{ fontFamily: "var(--font-display)", color: "var(--text-primary)" }}
                >
                  {t("notification.title")}
                </span>
                <span
                  className="text-[10px] px-1.5 py-0.5 rounded-full"
                  style={{
                    background: "color-mix(in srgb, var(--accent) 10%, transparent)",
                    color: "var(--accent)",
                  }}
                >
                  {CURRENT_VERSION}
                </span>
              </div>
              <span className="text-xs" style={{ color: "var(--text-tertiary)" }}>
                {t("notification.count", { count: changelog.length })}
              </span>
            </div>

            <div className="max-h-80 overflow-y-auto">
              {changelog.map((entry, i) => {
                const cfg = typeConfig[entry.type];
                const Icon = cfg.icon;
                return (
                  <div
                    key={entry.id}
                    className="px-4 py-3 transition-colors"
                    style={{
                      borderBottom: i < changelog.length - 1 ? "1px solid var(--border)" : undefined,
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.background = "var(--hover-bg, rgba(0,0,0,0.03))")}
                    onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
                  >
                    <div className="flex items-start gap-3">
                      <div
                        className="mt-0.5 w-7 h-7 rounded-lg flex items-center justify-center shrink-0"
                        style={{ background: `color-mix(in srgb, ${cfg.color} 12%, transparent)` }}
                      >
                        <Icon className="w-3.5 h-3.5" style={{ color: cfg.color }} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-0.5">
                          <span className="text-sm font-medium truncate" style={{ color: "var(--text-primary)" }}>
                            {entry.title}
                          </span>
                          <span
                            className="text-[10px] px-1.5 py-0.5 rounded-full shrink-0"
                            style={{
                              background: `color-mix(in srgb, ${cfg.color} 10%, transparent)`,
                              color: cfg.color,
                            }}
                          >
                            {cfg.label}
                          </span>
                        </div>
                        <p className="text-xs leading-relaxed" style={{ color: "var(--text-tertiary)" }}>
                          {entry.description}
                        </p>
                        <span className="text-[10px] mt-1 inline-block" style={{ color: "var(--text-tertiary)", opacity: 0.7 }}>
                          {entry.date}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
