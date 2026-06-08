import { useEffect, useState } from "react";
import { Outlet, Link, useNavigate, useLocation } from "react-router-dom";
import { useAuthStore } from "@/stores/authStore";
import { Film, Home, Users, User, LogOut, LogIn, Menu, X, Settings } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import ThemeToggle from "@/components/ThemeToggle";
import NotificationBell from "@/components/NotificationBell";
import SettingsDialog from "@/components/SettingsDialog";
import { useTranslation } from "@/stores/i18nStore";

export default function MainLayout() {
  const { isAuthenticated, user, logout, fetchMe } = useAuthStore();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const { t } = useTranslation();

  useEffect(() => {
    if (isAuthenticated && !user) {
      fetchMe();
    }
  }, [isAuthenticated, user, fetchMe]);

  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location.pathname]);

  const handleLogout = () => {
    logout();
    setMobileMenuOpen(false);
    navigate("/login");
  };

  const navLinks = [
    { to: "/", icon: Home, label: t("nav.home") },
    { to: "/community", icon: Users, label: t("nav.community") },
  ];

  return (
    <div className="min-h-screen flex flex-col noise">
      <nav
        className="sticky top-0 z-50 glass"
        style={{
          background: "var(--nav-bg)",
          borderColor: "var(--nav-border)",
          borderBottom: "1px solid var(--nav-border)",
        }}
      >
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2.5 group">
            <motion.div
              whileHover={{ rotate: 8 }}
              transition={{ type: "spring", stiffness: 300, damping: 22 }}
            >
              <Film className="w-6 h-6" style={{ color: "var(--accent)" }} />
            </motion.div>
            <span className="heading-section text-xl text-gradient">
              {t("nav.siteName")}
            </span>
          </Link>

          <div className="hidden md:flex items-center gap-5">
            {navLinks.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                className="flex items-center gap-1.5 text-sm font-medium transition-colors"
                style={{
                  fontFamily: "var(--font-display)",
                  color: location.pathname === link.to ? "var(--accent)" : "var(--text-secondary)",
                }}
                onMouseEnter={(e) => (e.currentTarget.style.color = "var(--accent)")}
                onMouseLeave={(e) =>
                  (e.currentTarget.style.color =
                    location.pathname === link.to ? "var(--accent)" : "var(--text-secondary)")
                }
              >
                <link.icon className="w-4 h-4" />
                {link.label}
              </Link>
            ))}

            <ThemeToggle />
            <NotificationBell />

            <motion.button
              onClick={() => setSettingsOpen(true)}
              className="relative w-9 h-9 rounded-xl flex items-center justify-center"
              style={{
                background: "var(--bg-muted)",
                border: "1px solid var(--border)",
                color: "var(--text-secondary)",
              }}
              whileHover={{ scale: 1.08, color: "var(--accent)" }}
              whileTap={{ scale: 0.92 }}
              aria-label={t("settings.title")}
            >
              <Settings className="w-4 h-4" />
            </motion.button>

            {isAuthenticated ? (
              <div className="flex items-center gap-4 pl-3" style={{ borderLeft: "1px solid var(--border)" }}>
                <Link
                  to="/profile"
                  className="flex items-center gap-1.5 text-sm font-medium transition-colors"
                  style={{ fontFamily: "var(--font-display)", color: "var(--text-secondary)" }}
                  onMouseEnter={(e) => (e.currentTarget.style.color = "var(--accent)")}
                  onMouseLeave={(e) => (e.currentTarget.style.color = "var(--text-secondary)")}
                >
                  <User className="w-4 h-4" />
                  {user?.nickname || t("nav.profile")}
                </Link>
                <motion.button
                  onClick={handleLogout}
                  className="flex items-center gap-1.5 text-sm font-medium transition-colors"
                  style={{ fontFamily: "var(--font-display)", color: "var(--text-tertiary)" }}
                  whileHover={{ color: "var(--error)" }}
                  whileTap={{ scale: 0.95 }}
                >
                  <LogOut className="w-4 h-4" />
                  {t("nav.logout")}
                </motion.button>
              </div>
            ) : (
              <div className="flex items-center gap-3 pl-3" style={{ borderLeft: "1px solid var(--border)" }}>
                <Link
                  to="/login"
                  className="flex items-center gap-1.5 text-sm font-medium transition-colors"
                  style={{ fontFamily: "var(--font-display)", color: "var(--text-secondary)" }}
                  onMouseEnter={(e) => (e.currentTarget.style.color = "var(--accent)")}
                  onMouseLeave={(e) => (e.currentTarget.style.color = "var(--text-secondary)")}
                >
                  <LogIn className="w-4 h-4" />
                  {t("nav.login")}
                </Link>
                <Link to="/register" className="btn-accent">
                  {t("nav.register")}
                </Link>
              </div>
            )}
          </div>

          <div className="flex md:hidden items-center gap-3">
            <NotificationBell />
            <motion.button
              onClick={() => setSettingsOpen(true)}
              className="w-9 h-9 flex items-center justify-center rounded-lg"
              style={{ color: "var(--text-secondary)" }}
              whileTap={{ scale: 0.9 }}
            >
              <Settings className="w-5 h-5" />
            </motion.button>
            <motion.button
              onClick={() => setMobileMenuOpen((v) => !v)}
              className="w-9 h-9 flex items-center justify-center rounded-lg"
              style={{ color: "var(--text-secondary)" }}
              whileTap={{ scale: 0.9 }}
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </motion.button>
          </div>
        </div>
      </nav>

      <AnimatePresence>
        {mobileMenuOpen && (
          <>
            <motion.div
              className="fixed inset-0 z-40 md:hidden"
              style={{ background: "var(--overlay)" }}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMobileMenuOpen(false)}
            />
            <motion.div
              className="fixed top-16 right-0 bottom-0 z-50 w-64 md:hidden overflow-y-auto"
              style={{
                background: "var(--bg-elevated)",
                borderLeft: "1px solid var(--border)",
                boxShadow: "-8px 0 32px rgba(0,0,0,0.1)",
              }}
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
            >
              <div className="flex flex-col p-4 gap-1">
                {navLinks.map((link) => (
                  <Link
                    key={link.to}
                    to={link.to}
                    className="flex items-center gap-3 px-3 py-3 rounded-xl text-sm font-medium transition-colors"
                    style={{
                      fontFamily: "var(--font-display)",
                      color: location.pathname === link.to ? "var(--accent)" : "var(--text-secondary)",
                      background: location.pathname === link.to ? "var(--accent-soft)" : "transparent",
                    }}
                  >
                    <link.icon className="w-5 h-5" />
                    {link.label}
                  </Link>
                ))}
                <div className="my-2" style={{ borderTop: "1px solid var(--border)" }} />
                <div className="px-3 py-3 flex items-center justify-between">
                  <span className="text-sm font-medium" style={{ fontFamily: "var(--font-display)", color: "var(--text-secondary)" }}>
                    {t("settings.theme")}
                  </span>
                  <ThemeToggle />
                </div>
                <div className="my-2" style={{ borderTop: "1px solid var(--border)" }} />
                {isAuthenticated ? (
                  <>
                    <Link
                      to="/profile"
                      className="flex items-center gap-3 px-3 py-3 rounded-xl text-sm font-medium transition-colors"
                      style={{ fontFamily: "var(--font-display)", color: "var(--text-secondary)" }}
                    >
                      <User className="w-5 h-5" />
                      {user?.nickname || t("nav.profile")}
                    </Link>
                    <button
                      onClick={handleLogout}
                      className="flex items-center gap-3 px-3 py-3 rounded-xl text-sm font-medium transition-colors w-full text-left"
                      style={{ fontFamily: "var(--font-display)", color: "var(--error)" }}
                    >
                      <LogOut className="w-5 h-5" />
                      {t("nav.logout")}
                    </button>
                  </>
                ) : (
                  <>
                    <Link
                      to="/login"
                      className="flex items-center gap-3 px-3 py-3 rounded-xl text-sm font-medium transition-colors"
                      style={{ fontFamily: "var(--font-display)", color: "var(--text-secondary)" }}
                    >
                      <LogIn className="w-5 h-5" />
                      {t("nav.login")}
                    </Link>
                    <Link to="/register" className="btn-accent text-center mt-2">
                      {t("nav.register")}
                    </Link>
                  </>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <SettingsDialog open={settingsOpen} onClose={() => setSettingsOpen(false)} />

      <main className="flex-1">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: [0.4, 0, 0.2, 1] }}
        >
          <Outlet />
        </motion.div>
      </main>

      <footer
        className="py-8 text-center"
        style={{ borderTop: "1px solid var(--border)", color: "var(--text-tertiary)" }}
      >
        <p className="text-sm" style={{ fontFamily: "var(--font-display)" }}>
          {t("footer.copyright")}
        </p>
      </footer>
    </div>
  );
}
