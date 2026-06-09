import { useState, useRef, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Bell, Sparkles, Wrench, TrendingUp, X, MessageSquare, Heart } from "lucide-react";
import { changelog, CURRENT_VERSION, type ChangelogEntry } from "@/data/changelog";
import { useTranslation } from "@/stores/i18nStore";
import { useAuthStore } from "@/stores/authStore";
import api from "@/lib/api";

const LAST_SEEN_KEY = "bangumi-last-seen-changelog";

function getLastSeenId(): string | null {
  try { return localStorage.getItem(LAST_SEEN_KEY); } catch { return null; }
}

function setLastSeenId(id: string) {
  try { localStorage.setItem(LAST_SEEN_KEY, id); } catch {}
}

interface BackendNotification {
  id: number;
  type: string;
  message: string;
  is_read: boolean;
  post_id: number | null;
  created_at: string;
}

export default function NotificationBell() {
  const [open, setOpen] = useState(false);
  const [showChangelog, setShowChangelog] = useState(false);
  const [backendNotifications, setBackendNotifications] = useState<BackendNotification[]>([]);
  const containerRef = useRef<HTMLDivElement>(null);
  const { t } = useTranslation();
  const { isAuthenticated } = useAuthStore();

  const hasVersionUpdate = (() => {
    const lastSeen = getLastSeenId();
    return !lastSeen || lastSeen !== changelog[0]?.id;
  })();

  const unreadBackendCount = backendNotifications.filter((n) => !n.is_read).length;
  const totalUnread = (hasVersionUpdate ? 1 : 0) + unreadBackendCount;

  const typeConfig: Record<ChangelogEntry["type"], { icon: typeof Bell; color: string; label: string }> = {
    feature: { icon: Sparkles, color: "var(--accent)", label: t("notification.feature") },
    fix: { icon: Wrench, color: "var(--error)", label: t("notification.fix") },
    improvement: { icon: TrendingUp, color: "var(--success)", label: t("notification.improvement") },
  };

  const fetchNotifications = useCallback(async () => {
    if (!isAuthenticated) return;
    try {
      const { data } = await api.get("/notifications", { params: { limit: 20 } });
      setBackendNotifications(data.data?.notifications || []);
    } catch {}
  }, [isAuthenticated]);

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 30000);
    return () => clearInterval(interval);
  }, [fetchNotifications]);

  const markVersionAsRead = useCallback(() => {
    if (changelog[0]) {
      setLastSeenId(changelog[0].id);
    }
  }, []);

  const markNotificationAsRead = useCallback(async (id: number) => {
    try {
      await api.patch(`/notifications/${id}/read`);
      setBackendNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, is_read: true } : n))
      );
    } catch {}
  }, []);

  const markAllAsRead = useCallback(async () => {
    markVersionAsRead();
    try {
      await api.patch("/notifications/read-all");
      setBackendNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
    } catch {}
  }, [markVersionAsRead]);

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const handleVersionClick = () => {
    markVersionAsRead();
    setShowChangelog(true);
    setOpen(false);
  };

  const handleBackendNotificationClick = (notification: BackendNotification) => {
    if (!notification.is_read) {
      markNotificationAsRead(notification.id);
    }
  };

  const formatTime = (dateStr: string) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMin = Math.floor(diffMs / 60000);
    if (diffMin < 1) return "刚刚";
    if (diffMin < 60) return `${diffMin}分钟前`;
    const diffHour = Math.floor(diffMin / 60);
    if (diffHour < 24) return `${diffHour}小时前`;
    const diffDay = Math.floor(diffHour / 24);
    if (diffDay < 30) return `${diffDay}天前`;
    return date.toLocaleDateString("zh-CN");
  };

  return (
    <>
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
          {totalUnread > 0 && (
            <motion.span
              className="absolute -top-1 -right-1 min-w-[16px] h-4 px-1 rounded-full flex items-center justify-center text-[10px] font-bold text-white"
              style={{ background: "var(--accent)" }}
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0 }}
              transition={{ type: "spring", stiffness: 400, damping: 20 }}
            >
              {totalUnread > 99 ? "99+" : totalUnread}
            </motion.span>
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
              {/* Header */}
              <div
                className="px-4 py-3 flex items-center justify-between"
                style={{ borderBottom: "1px solid var(--border)" }}
              >
                <span
                  className="text-sm font-semibold"
                  style={{ fontFamily: "var(--font-display)", color: "var(--text-primary)" }}
                >
                  {t("notification.title")}
                </span>
                {totalUnread > 0 && (
                  <button
                    onClick={markAllAsRead}
                    className="text-xs transition-colors hover:underline"
                    style={{ color: "var(--accent)" }}
                  >
                    {t("notification.markAllRead")}
                  </button>
                )}
              </div>

              {/* Notification list */}
              <div className="max-h-96 overflow-y-auto">
                {/* Version update notification - always shown, pinned at top */}
                  <div
                    className="px-4 py-3 cursor-pointer transition-colors"
                    style={{
                      borderBottom: "1px solid var(--border)",
                      background: hasVersionUpdate ? "color-mix(in srgb, var(--accent) 4%, transparent)" : "transparent",
                    }}
                    onClick={handleVersionClick}
                    onMouseEnter={(e) => (e.currentTarget.style.background = "var(--hover-bg, rgba(0,0,0,0.03))")}
                    onMouseLeave={(e) => (e.currentTarget.style.background = hasVersionUpdate ? "color-mix(in srgb, var(--accent) 4%, transparent)" : "transparent")}
                  >
                    <div className="flex items-start gap-3">
                      <div
                        className="mt-0.5 w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
                        style={{ background: "color-mix(in srgb, var(--accent) 12%, transparent)" }}
                      >
                        <Sparkles className="w-4 h-4" style={{ color: "var(--accent)" }} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-0.5">
                          <span
                            className="text-[10px] px-1.5 py-0.5 rounded-full font-medium"
                            style={{
                              background: "color-mix(in srgb, var(--accent) 15%, transparent)",
                              color: "var(--accent)",
                            }}
                          >
                            {t("notification.official")}
                          </span>
                          <span className="text-sm font-medium" style={{ color: "var(--text-primary)" }}>
                            {t("notification.versionUpdate")}
                          </span>
                        </div>
                        <p className="text-xs" style={{ color: "var(--text-tertiary)" }}>
                          {CURRENT_VERSION} — {changelog[0]?.title}
                        </p>
                      </div>
                      {hasVersionUpdate && (
                        <div
                          className="w-2 h-2 rounded-full shrink-0 mt-2"
                          style={{ background: "var(--accent)" }}
                        />
                      )}
                    </div>
                  </div>

                {/* Backend notifications */}
                {backendNotifications.map((notification) => (
                  <div
                    key={notification.id}
                    className="px-4 py-3 cursor-pointer transition-colors"
                    style={{
                      borderBottom: "1px solid var(--border)",
                      background: notification.is_read ? "transparent" : "color-mix(in srgb, var(--accent) 4%, transparent)",
                    }}
                    onClick={() => handleBackendNotificationClick(notification)}
                    onMouseEnter={(e) => (e.currentTarget.style.background = "var(--hover-bg, rgba(0,0,0,0.03))")}
                    onMouseLeave={(e) => (e.currentTarget.style.background = notification.is_read ? "transparent" : "color-mix(in srgb, var(--accent) 4%, transparent)")}
                  >
                    <div className="flex items-start gap-3">
                      <div
                        className="mt-0.5 w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
                        style={{
                          background: notification.type === "like"
                            ? "color-mix(in srgb, #ef4444 12%, transparent)"
                            : "color-mix(in srgb, #3b82f6 12%, transparent)",
                        }}
                      >
                        {notification.type === "like" ? (
                          <Heart className="w-4 h-4" style={{ color: "#ef4444" }} />
                        ) : (
                          <MessageSquare className="w-4 h-4" style={{ color: "#3b82f6" }} />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm leading-relaxed" style={{ color: "var(--text-primary)" }}>
                          {notification.message}
                        </p>
                        <span className="text-[10px] mt-1 inline-block" style={{ color: "var(--text-tertiary)", opacity: 0.7 }}>
                          {formatTime(notification.created_at)}
                        </span>
                      </div>
                      {!notification.is_read && (
                        <div
                          className="w-2 h-2 rounded-full shrink-0 mt-2"
                          style={{ background: "var(--accent)" }}
                        />
                      )}
                    </div>
                  </div>
                ))}

                {/* Empty state */}
                {backendNotifications.length === 0 && (
                  <div className="px-4 py-8 text-center">
                    <Bell className="w-8 h-8 mx-auto mb-2" style={{ color: "var(--text-tertiary)", opacity: 0.4 }} />
                    <p className="text-sm" style={{ color: "var(--text-tertiary)" }}>
                      {t("notification.noNotifications")}
                    </p>
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Changelog detail popup */}
      <AnimatePresence>
        {showChangelog && (
          <motion.div
            className="fixed inset-0 z-[100] flex items-center justify-center px-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="absolute inset-0"
              style={{ background: "var(--overlay)" }}
              onClick={() => setShowChangelog(false)}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            />
            <motion.div
              className="relative w-full max-w-md max-h-[80vh] overflow-hidden"
              style={{
                background: "var(--card-bg)",
                border: "1px solid var(--border)",
                borderRadius: "var(--radius-card)",
                boxShadow: "var(--card-shadow-hover)",
              }}
              initial={{ opacity: 0, scale: 0.95, y: 12 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 12 }}
              transition={{ type: "spring", stiffness: 300, damping: 28 }}
            >
              {/* Popup header */}
              <div
                className="px-5 py-4 flex items-center justify-between"
                style={{ borderBottom: "1px solid var(--border)" }}
              >
                <div className="flex items-center gap-2">
                  <span
                    className="text-base font-semibold"
                    style={{ fontFamily: "var(--font-display)", color: "var(--text-primary)" }}
                  >
                    {t("notification.versionUpdate")}
                  </span>
                  <span
                    className="text-xs px-2 py-0.5 rounded-full font-medium"
                    style={{
                      background: "color-mix(in srgb, var(--accent) 15%, transparent)",
                      color: "var(--accent)",
                    }}
                  >
                    {CURRENT_VERSION}
                  </span>
                </div>
                <button
                  onClick={() => setShowChangelog(false)}
                  className="p-1 rounded-lg transition-colors"
                  style={{ color: "var(--text-tertiary)" }}
                  onMouseEnter={(e) => (e.currentTarget.style.color = "var(--text-primary)")}
                  onMouseLeave={(e) => (e.currentTarget.style.color = "var(--text-tertiary)")}
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Changelog entries */}
              <div className="overflow-y-auto max-h-[60vh] px-5 py-4 space-y-4">
                {changelog.map((entry) => {
                  const cfg = typeConfig[entry.type];
                  const Icon = cfg.icon;
                  return (
                    <div key={entry.id} className="flex gap-3">
                      <div
                        className="mt-0.5 w-7 h-7 rounded-lg flex items-center justify-center shrink-0"
                        style={{ background: `color-mix(in srgb, ${cfg.color} 12%, transparent)` }}
                      >
                        <Icon className="w-3.5 h-3.5" style={{ color: cfg.color }} />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-sm font-medium" style={{ color: "var(--text-primary)" }}>
                            {entry.title}
                          </span>
                          <span
                            className="text-[10px] px-1.5 py-0.5 rounded-full"
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
                  );
                })}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
