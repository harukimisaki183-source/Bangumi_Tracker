import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, Plus, Trash2, Upload, X } from 'lucide-react';
import { toast } from 'sonner';
import api from '@/lib/api';

interface Episode {
  number: number;
  title: string;
  note: string;
  images: string[];
}

export default function EpisodesSection({
  data,
  isEditing,
  onChange,
}: {
  data?: Episode[];
  isEditing: boolean;
  onChange: (d: Episode[]) => void;
}) {
  const [episodes, setEpisodes] = useState<Episode[]>(data || []);
  const [expanded, setExpanded] = useState<Set<number>>(new Set());
  const [uploading, setUploading] = useState<number | null>(null);

  const toggle = (n: number) => {
    const next = new Set(expanded);
    next.has(n) ? next.delete(n) : next.add(n);
    setExpanded(next);
  };

  const updateEp = (idx: number, field: keyof Episode, value: any) => {
    const next = [...episodes];
    next[idx] = { ...next[idx], [field]: value };
    setEpisodes(next);
    onChange(next);
  };

  const addEp = () => {
    const next = [
      ...episodes,
      { number: episodes.length + 1, title: '', note: '', images: [] },
    ];
    setEpisodes(next);
    onChange(next);
  };

  const removeEp = (idx: number) => {
    const next = episodes
      .filter((_, i) => i !== idx)
      .map((ep, i) => ({ ...ep, number: i + 1 }));
    setEpisodes(next);
    onChange(next);
  };

  const uploadImage = async (idx: number, file: File) => {
    setUploading(idx);
    try {
      const formData = new FormData();
      formData.append('file', file);
      const { data } = await api.post('/upload/file', formData);
      const next = [...episodes];
      next[idx] = {
        ...next[idx],
        images: [...next[idx].images, data.data.key],
      };
      setEpisodes(next);
      onChange(next);
    } catch {
      toast.error('上传失败');
    } finally {
      setUploading(null);
    }
  };

  const removeImage = (epIdx: number, imgIdx: number) => {
    const next = [...episodes];
    next[epIdx] = {
      ...next[epIdx],
      images: next[epIdx].images.filter((_, i) => i !== imgIdx),
    };
    setEpisodes(next);
    onChange(next);
  };

  if (!isEditing && episodes.length === 0) return null;

  return (
    <div>
      {isEditing && (
        <motion.button
          onClick={addEp}
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
          className="flex items-center gap-1.5 text-sm font-medium mb-4"
          style={{ color: 'var(--accent)', fontFamily: 'var(--font-display)' }}
        >
          <Plus className="w-4 h-4" />
          添加一集
        </motion.button>
      )}

      <div className="space-y-2">
        <AnimatePresence initial={false}>
          {episodes.map((ep, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ type: 'spring', stiffness: 300, damping: 30 }}
              className="overflow-hidden"
            >
              <div
                className="rounded-xl overflow-hidden"
                style={{
                  border: '1px solid var(--border)',
                  background: 'var(--bg-elevated)',
                }}
              >
                <button
                  onClick={() => toggle(ep.number)}
                  className="w-full flex items-center justify-between px-4 py-3 transition-colors"
                  style={{
                    background: expanded.has(ep.number)
                      ? 'var(--bg-muted)'
                      : 'transparent',
                    fontFamily: 'var(--font-display)',
                  }}
                  onMouseEnter={(e) => {
                    if (!expanded.has(ep.number))
                      e.currentTarget.style.background = 'var(--bg-muted)';
                  }}
                  onMouseLeave={(e) => {
                    if (!expanded.has(ep.number))
                      e.currentTarget.style.background = 'transparent';
                  }}
                >
                  <span
                    className="text-sm font-medium"
                    style={{ color: 'var(--text-primary)' }}
                  >
                    第{ep.number}集
                    {ep.title ? (
                      <span style={{ color: 'var(--text-tertiary)' }}>
                        {' '}
                        — {ep.title}
                      </span>
                    ) : (
                      <span style={{ color: 'var(--text-tertiary)' }}>
                        ：未命名
                      </span>
                    )}
                  </span>
                  <motion.div
                    animate={{ rotate: expanded.has(ep.number) ? 180 : 0 }}
                    transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                  >
                    <ChevronDown
                      className="w-4 h-4"
                      style={{ color: 'var(--text-tertiary)' }}
                    />
                  </motion.div>
                </button>

                <AnimatePresence>
                  {expanded.has(ep.number) && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                      className="overflow-hidden"
                    >
                      <div
                        className="px-4 pb-4 pt-1 space-y-3"
                        style={{ borderTop: '1px solid var(--border)' }}
                      >
                        {isEditing ? (
                          <>
                            <div className="flex gap-3">
                              <input
                                value={ep.title}
                                onChange={(e) =>
                                  updateEp(idx, 'title', e.target.value)
                                }
                                placeholder="集名"
                                className="flex-1 px-3 py-2 text-sm rounded-xl"
                                style={{
                                  background: 'var(--bg-sunken)',
                                  border: '1.5px solid var(--border)',
                                  color: 'var(--text-primary)',
                                  outline: 'none',
                                }}
                              />
                              <motion.button
                                onClick={() => removeEp(idx)}
                                whileHover={{ scale: 1.1 }}
                                whileTap={{ scale: 0.9 }}
                                style={{ color: 'var(--error)' }}
                              >
                                <Trash2 className="w-4 h-4" />
                              </motion.button>
                            </div>
                            <textarea
                              value={ep.note}
                              onChange={(e) =>
                                updateEp(idx, 'note', e.target.value)
                              }
                              rows={3}
                              placeholder="本集介绍..."
                              className="w-full px-3 py-2 text-sm rounded-xl resize-none"
                              style={{
                                background: 'var(--bg-sunken)',
                                border: '1.5px solid var(--border)',
                                color: 'var(--text-primary)',
                                outline: 'none',
                              }}
                            />
                            <div className="flex flex-wrap gap-2">
                              {ep.images.map((img, i) => (
                                <div key={i} className="relative w-20 h-20">
                                  <img
                                    src={img}
                                    className="w-full h-full object-cover rounded-lg"
                                  />
                                  <button
                                    onClick={() => removeImage(idx, i)}
                                    className="absolute -top-1.5 -right-1.5 rounded-full w-5 h-5 flex items-center justify-center text-xs"
                                    style={{
                                      background: 'var(--error)',
                                      color: 'white',
                                    }}
                                  >
                                    <X className="w-3 h-3" />
                                  </button>
                                </div>
                              ))}
                              <label
                                className="w-20 h-20 border-2 border-dashed rounded-lg flex items-center justify-center cursor-pointer transition-colors"
                                style={{
                                  borderColor: 'var(--border)',
                                  color: 'var(--text-tertiary)',
                                }}
                                onMouseEnter={(e) => {
                                  e.currentTarget.style.borderColor =
                                    'var(--accent)';
                                }}
                                onMouseLeave={(e) => {
                                  e.currentTarget.style.borderColor =
                                    'var(--border)';
                                }}
                              >
                                <Upload className="w-5 h-5" />
                                <input
                                  type="file"
                                  accept="image/*"
                                  className="hidden"
                                  onChange={(e) =>
                                    e.target.files?.[0] &&
                                    uploadImage(idx, e.target.files[0])
                                  }
                                />
                              </label>
                              {uploading === idx && (
                                <span
                                  className="text-xs self-center"
                                  style={{ color: 'var(--accent)' }}
                                >
                                  上传中...
                                </span>
                              )}
                            </div>
                          </>
                        ) : (
                          <>
                            <p
                              className="body-text text-sm whitespace-pre-wrap"
                              style={{ color: 'var(--text-secondary)' }}
                            >
                              {ep.note}
                            </p>
                            {ep.images.length > 0 && (
                              <div className="flex flex-wrap gap-2">
                                {ep.images.map((img, i) => (
                                  <motion.img
                                    key={i}
                                    src={img}
                                    className="w-32 h-32 object-cover rounded-lg"
                                    style={{
                                      border: '1px solid var(--border)',
                                    }}
                                    whileHover={{ scale: 1.03 }}
                                    transition={{ type: 'spring', stiffness: 300, damping: 25 }}
                                  />
                                ))}
                              </div>
                            )}
                          </>
                        )}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
}
