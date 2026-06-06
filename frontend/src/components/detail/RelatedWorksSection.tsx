import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, X, Search, Star } from 'lucide-react';
import api from '@/lib/api';

interface RelatedWork {
  id: number;
  name: string;
  type: string;
  cover: string;
  cover_url?: string;
  rating: number;
}

export default function RelatedWorksSection({
  workIds,
  relatedWorks,
  isEditing,
  onChange,
}: {
  workIds: number[];
  relatedWorks: RelatedWork[];
  isEditing: boolean;
  onChange: (ids: number[]) => void;
}) {
  const [ids, setIds] = useState<number[]>(workIds || []);
  const [works, setWorks] = useState<RelatedWork[]>(relatedWorks || []);
  const [search, setSearch] = useState('');
  const [results, setResults] = useState<RelatedWork[]>([]);
  const [showSearch, setShowSearch] = useState(false);

  useEffect(() => {
    setWorks(relatedWorks || []);
  }, [relatedWorks]);

  const doSearch = useCallback(
    debounce(async (q: string) => {
      if (!q) {
        setResults([]);
        return;
      }
      const { data } = await api.get('/works/search', { params: { q } });
      setResults(
        data.data.filter((w: RelatedWork) => !ids.includes(w.id)).slice(0, 5)
      );
    }, 300),
    [ids]
  );

  const addWork = (w: RelatedWork) => {
    const next = [...ids, w.id];
    setIds(next);
    setWorks([...works, w]);
    onChange(next);
    setSearch('');
    setResults([]);
  };

  const removeWork = (id: number) => {
    const next = ids.filter((i) => i !== id);
    setIds(next);
    setWorks(works.filter((w) => w.id !== id));
    onChange(next);
  };

  if (!isEditing && works.length === 0) return null;

  const typeLabels: Record<string, string> = {
    movie: '电影',
    series: '剧集',
    anime: '动漫',
  };

  return (
    <div>
      {works.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 mb-4">
          <AnimatePresence>
            {works.map((w) => (
              <motion.div
                key={w.id}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ type: 'spring', stiffness: 300, damping: 25 }}
                className="relative"
              >
                <Link
                  to={`/works/${w.id}`}
                  className="block overflow-hidden transition-shadow"
                  style={{
                    borderRadius: 'var(--radius-card)',
                    border: '1px solid var(--card-border)',
                    background: 'var(--card-bg)',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.boxShadow = 'var(--card-shadow-hover)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.boxShadow = 'none';
                  }}
                >
                  <div
                    className="aspect-[3/4]"
                    style={{ background: 'var(--bg-muted)' }}
                  >
                    <img
                      src={w.cover_url || `/api/upload/file-url?key=${w.cover}`}
                      alt={w.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="p-2.5">
                    <p
                      className="text-xs font-medium truncate"
                      style={{
                        color: 'var(--text-primary)',
                        fontFamily: 'var(--font-display)',
                      }}
                    >
                      {w.name}
                    </p>
                    <div className="flex items-center gap-0.5 mt-1">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Star
                          key={i}
                          className="w-2.5 h-2.5"
                          style={{
                            color: i < Math.round(w.rating) ? 'var(--star-filled)' : 'var(--star-empty)',
                            fill: i < Math.round(w.rating) ? 'var(--star-filled)' : 'none',
                          }}
                        />
                      ))}
                    </div>
                  </div>
                </Link>
                {isEditing && (
                  <motion.button
                    onClick={() => removeWork(w.id)}
                    whileHover={{ scale: 1.15 }}
                    whileTap={{ scale: 0.85 }}
                    className="absolute -top-1.5 -right-1.5 rounded-full w-5 h-5 flex items-center justify-center"
                    style={{ background: 'var(--error)', color: 'white' }}
                  >
                    <X className="w-3 h-3" />
                  </motion.button>
                )}
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}

      {isEditing && (
        <div>
          <motion.button
            onClick={() => setShowSearch(!showSearch)}
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            className="flex items-center gap-1.5 text-sm font-medium"
            style={{ color: 'var(--accent)', fontFamily: 'var(--font-display)' }}
          >
            <Plus className="w-4 h-4" />
            添加关联作品
          </motion.button>

          <AnimatePresence>
            {showSearch && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                className="overflow-hidden"
              >
                <div className="mt-3 relative">
                  <Search
                    className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4"
                    style={{ color: 'var(--text-tertiary)' }}
                  />
                  <input
                    value={search}
                    onChange={(e) => {
                      setSearch(e.target.value);
                      doSearch(e.target.value);
                    }}
                    placeholder="搜索作品名称..."
                    className="w-full pl-9 pr-3 py-2.5 text-sm rounded-xl"
                    style={{
                      background: 'var(--bg-sunken)',
                      border: '1.5px solid var(--border)',
                      color: 'var(--text-primary)',
                      outline: 'none',
                    }}
                    onFocus={(e) => {
                      e.currentTarget.style.borderColor = 'var(--accent)';
                      e.currentTarget.style.boxShadow = '0 0 0 3px var(--accent-glow)';
                    }}
                    onBlur={(e) => {
                      e.currentTarget.style.borderColor = 'var(--border)';
                      e.currentTarget.style.boxShadow = 'none';
                    }}
                  />
                  {results.length > 0 && (
                    <div
                      className="absolute z-10 w-full rounded-xl mt-1 overflow-hidden"
                      style={{
                        background: 'var(--bg-elevated)',
                        border: '1px solid var(--border)',
                        boxShadow: 'var(--card-shadow-hover)',
                      }}
                    >
                      {results.map((w) => (
                        <motion.button
                          key={w.id}
                          onClick={() => addWork(w)}
                          whileHover={{ x: 4 }}
                          className="w-full flex items-center justify-between px-4 py-2.5 text-left transition-colors"
                          style={{ color: 'var(--text-primary)' }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.background = 'var(--bg-muted)';
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.background = 'transparent';
                          }}
                        >
                          <span className="text-sm" style={{ fontFamily: 'var(--font-display)' }}>
                            {w.name}
                          </span>
                          <span
                            className="text-xs px-2 py-0.5 rounded-full"
                            style={{
                              background: 'var(--accent-soft)',
                              color: 'var(--accent)',
                              fontFamily: 'var(--font-display)',
                            }}
                          >
                            {typeLabels[w.type]}
                          </span>
                        </motion.button>
                      ))}
                    </div>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}

function debounce<T extends (...args: any[]) => void>(fn: T, ms: number) {
  let t: ReturnType<typeof setTimeout>;
  return (...args: Parameters<T>) => {
    clearTimeout(t);
    t = setTimeout(() => fn(...args), ms);
  };
}
