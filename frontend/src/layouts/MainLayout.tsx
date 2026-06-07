import { useEffect } from 'react';
import { Outlet, Link, useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/stores/authStore';
import { Film, Home, Users, User, LogOut, LogIn } from 'lucide-react';
import { motion } from 'framer-motion';
import ThemeToggle from '@/components/ThemeToggle';

export default function MainLayout() {
  const { isAuthenticated, user, logout, fetchMe } = useAuthStore();
  const navigate = useNavigate();

  useEffect(() => {
    if (isAuthenticated && !user) {
      fetchMe();
    }
  }, [isAuthenticated, user, fetchMe]);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen flex flex-col noise">
      {/* ── Navigation ────────────────────────────────────────── */}
      <nav
        className="sticky top-0 z-50 glass"
        style={{
          background: 'var(--nav-bg)',
          borderColor: 'var(--nav-border)',
          borderBottom: '1px solid var(--nav-border)',
        }}
      >
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2.5 group">
            <motion.div
              whileHover={{ rotate: 8 }}
              transition={{ type: 'spring', stiffness: 300, damping: 22 }}
            >
              <Film
                className="w-6 h-6"
                style={{ color: 'var(--accent)' }}
              />
            </motion.div>
            <span
              className="heading-section text-xl text-gradient"
            >
              追番记录站
            </span>
          </Link>

          {/* Nav links */}
          <div className="flex items-center gap-5">
            <Link
              to="/"
              className="flex items-center gap-1.5 text-sm font-medium transition-colors"
              style={{
                fontFamily: 'var(--font-display)',
                color: 'var(--text-secondary)',
              }}
              onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--accent)')}
              onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--text-secondary)')}
            >
              <Home className="w-4 h-4" />
              首页
            </Link>
            <Link
              to="/community"
              className="flex items-center gap-1.5 text-sm font-medium transition-colors"
              style={{
                fontFamily: 'var(--font-display)',
                color: 'var(--text-secondary)',
              }}
              onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--accent)')}
              onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--text-secondary)')}
            >
              <Users className="w-4 h-4" />
              社区
            </Link>

            {/* Theme toggle */}
            <ThemeToggle />

            {isAuthenticated ? (
              <div className="flex items-center gap-4 pl-3" style={{ borderLeft: '1px solid var(--border)' }}>
                <Link
                  to="/profile"
                  className="flex items-center gap-1.5 text-sm font-medium transition-colors"
                  style={{
                    fontFamily: 'var(--font-display)',
                    color: 'var(--text-secondary)',
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--accent)')}
                  onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--text-secondary)')}
                >
                  <User className="w-4 h-4" />
                  {user?.nickname || '个人中心'}
                </Link>
                <motion.button
                  onClick={handleLogout}
                  className="flex items-center gap-1.5 text-sm font-medium transition-colors"
                  style={{
                    fontFamily: 'var(--font-display)',
                    color: 'var(--text-tertiary)',
                  }}
                  whileHover={{ color: 'var(--error)' }}
                  whileTap={{ scale: 0.95 }}
                >
                  <LogOut className="w-4 h-4" />
                  登出
                </motion.button>
              </div>
            ) : (
              <div className="flex items-center gap-3 pl-3" style={{ borderLeft: '1px solid var(--border)' }}>
                <Link
                  to="/login"
                  className="flex items-center gap-1.5 text-sm font-medium transition-colors"
                  style={{
                    fontFamily: 'var(--font-display)',
                    color: 'var(--text-secondary)',
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--accent)')}
                  onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--text-secondary)')}
                >
                  <LogIn className="w-4 h-4" />
                  登录
                </Link>
                <Link to="/register" className="btn-accent">
                  注册
                </Link>
              </div>
            )}
          </div>
        </div>
      </nav>

      {/* ── Main content ──────────────────────────────────────── */}
      <main className="flex-1">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: [0.4, 0, 0.2, 1] }}
        >
          <Outlet />
        </motion.div>
      </main>

      {/* ── Footer ────────────────────────────────────────────── */}
      <footer
        className="py-8 text-center"
        style={{
          borderTop: '1px solid var(--border)',
          color: 'var(--text-tertiary)',
        }}
      >
        <p className="text-sm" style={{ fontFamily: 'var(--font-display)' }}>
          © 2026 追番记录站 — 记录你的每一次观影体验
        </p>
      </footer>
    </div>
  );
}
