import { useEffect, useRef, useCallback, useState } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Search } from 'lucide-react';
import { motion, AnimatePresence, LayoutGroup } from 'framer-motion';
import { useWorkStore } from '@/stores/workStore';
import { useAuthStore } from '@/stores/authStore';
import { useTranslation } from '@/stores/i18nStore';
import WorkCard from '@/components/WorkCard';
import WorkCardSkeleton from '@/components/WorkCardSkeleton';

export default function HomePage() {
  const { works, isLoading, nextCursor, filters, fetchWorks, loadMore, setFilters } =
    useWorkStore();
  const { isAuthenticated, user } = useAuthStore();
  const { t } = useTranslation();

  const tabs = [
    { value: '', label: t('home.tab.all'), emoji: '✨' },
    { value: 'movie', label: t('home.tab.movie'), emoji: '🎬' },
    { value: 'series', label: t('home.tab.series'), emoji: '📺' },
    { value: 'anime', label: t('home.tab.anime'), emoji: '🌸' },
  ];
  const observerRef = useRef<IntersectionObserver | null>(null);
  const sentinelRef = useRef<HTMLDivElement>(null);
  const [activeTab, setActiveTab] = useState(filters.type || '');
  const [searchFocused, setSearchFocused] = useState(false);

  useEffect(() => {
    if (user?.id) {
      fetchWorks({ authorId: user.id });
    }
  }, [user?.id]);

  useEffect(() => {
    if (!sentinelRef.current) return;
    observerRef.current = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && nextCursor && !isLoading) {
          loadMore();
        }
      },
      { threshold: 0.1 }
    );
    observerRef.current.observe(sentinelRef.current);
    return () => observerRef.current?.disconnect();
  }, [nextCursor, isLoading, loadMore]);

  const handleTabChange = (type: string) => {
    setActiveTab(type);
    const newFilters = { ...filters, type: type || undefined, authorId: user?.id };
    setFilters(newFilters);
    fetchWorks(newFilters);
  };

  const handleSearch = useCallback(
    debounce((search: string) => {
      const newFilters = { ...filters, search: search || undefined, authorId: user?.id };
      setFilters(newFilters);
      fetchWorks(newFilters);
    }, 300),
    [filters, user?.id]
  );

  return (
    <LayoutGroup>
      <div className="min-h-screen">
        {/* ── Hero Section ─────────────────────────────────────── */}
        <section
          className="relative overflow-hidden py-16 px-4"
          style={{ background: 'var(--accent-gradient-soft)' }}
        >
          {/* Floating decorative orbs */}
          <motion.div
            className="absolute w-64 h-64 rounded-full opacity-20 blur-3xl"
            style={{ background: 'var(--accent)', top: '-4rem', right: '-2rem' }}
            animate={{ y: [0, -20, 0], x: [0, 10, 0] }}
            transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
          />
          <motion.div
            className="absolute w-48 h-48 rounded-full opacity-15 blur-3xl"
            style={{ background: 'var(--secondary)', bottom: '-2rem', left: '10%' }}
            animate={{ y: [0, 15, 0], x: [0, -8, 0] }}
            transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut', delay: 1 }}
          />

          <div className="max-w-7xl mx-auto relative z-10">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ type: 'spring', stiffness: 200, damping: 25 }}
            >
              <h1
                className="heading-display text-4xl md:text-5xl mb-3"
                style={{ color: 'var(--text-primary)' }}
              >
                {t('home.hero.title')}
              </h1>
              <p
                className="text-lg max-w-md"
                style={{
                  fontFamily: 'var(--font-body)',
                  color: 'var(--text-secondary)',
                  lineHeight: 1.6,
                }}
              >
                {t('home.hero.subtitle')}
              </p>
            </motion.div>
          </div>
        </section>

        {/* ── Toolbar ──────────────────────────────────────────── */}
        <div className="max-w-7xl mx-auto px-4 -mt-6 relative z-20">
          <motion.div
            className="glass rounded-2xl p-3 sm:p-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-4"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ type: 'spring', stiffness: 250, damping: 25, delay: 0.15 }}
          >
            {/* Row 1: Tabs + Create button (mobile) */}
            <div className="flex items-center gap-2 sm:gap-0">
              {/* Animated tabs with layoutId indicator */}
              <div
                className="flex gap-0.5 p-1 rounded-xl overflow-x-auto"
                style={{ background: 'var(--bg-sunken)' }}
              >
                {tabs.map((tab) => (
                  <button
                    key={tab.value}
                    onClick={() => handleTabChange(tab.value)}
                    className="relative px-3 sm:px-4 py-2 rounded-lg text-sm font-medium transition-colors whitespace-nowrap"
                    style={{
                      fontFamily: 'var(--font-display)',
                      color:
                        activeTab === tab.value
                          ? 'var(--text-primary)'
                          : 'var(--text-tertiary)',
                    }}
                  >
                    {activeTab === tab.value && (
                      <motion.div
                        layoutId="activeTab"
                        className="absolute inset-0 rounded-lg"
                        style={{
                          background: 'var(--card-bg)',
                          boxShadow: 'var(--card-shadow)',
                        }}
                        transition={{
                          type: 'spring',
                          stiffness: 400,
                          damping: 30,
                        }}
                      />
                    )}
                    <span className="relative z-10 flex items-center gap-1.5">
                      <span className="text-xs">{tab.emoji}</span>
                      {tab.label}
                    </span>
                  </button>
                ))}
              </div>

              {/* Create button — inline on mobile */}
              {isAuthenticated && (
                <Link
                  to="/works/create"
                  className="btn-accent flex items-center gap-1.5 shrink-0 sm:ml-auto text-sm py-2 px-3"
                >
                  <Plus className="w-4 h-4" />
                  <span className="hidden sm:inline">{t('home.create')}</span>
                </Link>
              )}
            </div>

            {/* Row 2 (mobile) / inline (desktop): Search */}
            <motion.div
              className="relative flex-1 sm:max-w-sm"
              animate={{ scale: searchFocused ? 1.02 : 1 }}
              transition={{ type: 'spring', stiffness: 400, damping: 25 }}
            >
              <Search
                className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4"
                style={{
                  color: searchFocused ? 'var(--accent)' : 'var(--text-tertiary)',
                }}
              />
              <input
                onChange={(e) => handleSearch(e.target.value)}
                placeholder={t('home.search')}
                onFocus={() => setSearchFocused(true)}
                onBlur={() => setSearchFocused(false)}
                className="w-full pl-9 pr-3 py-2.5 text-sm rounded-xl transition-all"
                style={{
                  fontFamily: 'var(--font-body)',
                  background: 'var(--bg-sunken)',
                  border: `1.5px solid ${searchFocused ? 'var(--accent)' : 'var(--border)'}`,
                  color: 'var(--text-primary)',
                  outline: 'none',
                  boxShadow: searchFocused
                    ? '0 0 0 3px var(--accent-glow)'
                    : 'none',
                }}
              />
            </motion.div>
          </motion.div>
        </div>

        {/* ── Stats ─────────────────────────────────────────────── */}
        <div className="max-w-7xl mx-auto px-4 mt-3">
          <p className="text-xs" style={{ color: 'var(--text-tertiary)', fontFamily: 'var(--font-body)' }}>
            {activeTab === '' ? (
              <>
                共 {works.length} 部作品 · 电影 {works.filter(w => w.type === 'movie').length} · 剧集 {works.filter(w => w.type === 'series').length} · 番剧 {works.filter(w => w.type === 'anime').length}
              </>
            ) : (
              <>共 {works.length} 部{tabs.find(t => t.value === activeTab)?.label}作品</>
            )}
          </p>
        </div>

        {/* ── Masonry Card Grid ────────────────────────────────── */}
        <div className="max-w-7xl mx-auto px-4 py-10">
          {works.length === 0 && !isLoading ? (
            <motion.div
              className="text-center py-24"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ type: 'spring', stiffness: 200, damping: 20 }}
            >
              <motion.div
                className="text-6xl mb-6"
                animate={{ y: [0, -8, 0] }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  ease: 'easeInOut',
                }}
              >
                🎭
              </motion.div>
              <p
                className="text-lg mb-2 heading-section"
                style={{ color: 'var(--text-secondary)' }}
              >
                {t('home.empty.title')}
              </p>
              <p
                className="text-sm mb-6"
                style={{ color: 'var(--text-tertiary)' }}
              >
                {t('home.empty.subtitle')}
              </p>
              {isAuthenticated && (
                <Link to="/works/create" className="btn-accent">
                  {t('home.empty.cta')}
                </Link>
              )}
            </motion.div>
          ) : (
            <motion.div
              className="masonry-grid"
              initial="hidden"
              animate="visible"
            >
              <AnimatePresence mode="popLayout">
                {works.map((work, i) => (
                  <WorkCard key={work.id} work={work} index={i} />
                ))}
              </AnimatePresence>

              {isLoading &&
                Array.from({ length: 5 }).map((_, i) => (
                  <WorkCardSkeleton key={`skeleton-${i}`} index={i} />
                ))}
            </motion.div>
          )}

          {/* Infinite scroll sentinel */}
          {nextCursor && <div ref={sentinelRef} className="h-10" />}
        </div>
      </div>
    </LayoutGroup>
  );
}

function debounce<T extends (...args: any[]) => void>(fn: T, ms: number) {
  let timer: ReturnType<typeof setTimeout>;
  return (...args: Parameters<T>) => {
    clearTimeout(timer);
    timer = setTimeout(() => fn(...args), ms);
  };
}
