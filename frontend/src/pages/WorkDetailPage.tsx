import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Star, Edit, Share2, ArrowLeft, Film, Tv, Sparkles, Save, X, Trash2,
  BookOpen, MessageSquareText, FileText, ListChecks, Clapperboard, Link2,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import api from '@/lib/api';
import { useAuthStore } from '@/stores/authStore';
import GlassSection from '@/components/detail/GlassSection';
import BasicInfoSection from '@/components/detail/BasicInfoSection';
import RatingReasonSection from '@/components/detail/RatingReasonSection';
import SynopsisSection from '@/components/detail/SynopsisSection';
import EpisodesSection from '@/components/detail/EpisodesSection';
import ProductionBackgroundSection from '@/components/detail/ProductionBackgroundSection';
import RelatedWorksSection from '@/components/detail/RelatedWorksSection';

const typeLabels: Record<string, string> = { movie: '电影', series: '剧集', anime: '动漫' };
const typeGradients: Record<string, string> = {
  movie: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
  series: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
  anime: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
};
const typeIcons: Record<string, React.ReactNode> = {
  movie: <Film className="w-4 h-4" />,
  series: <Tv className="w-4 h-4" />,
  anime: <Sparkles className="w-4 h-4" />,
};

export default function WorkDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const [work, setWork] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [detailContent, setDetailContent] = useState<any>({});
  const [saving, setSaving] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    api.get(`/works/${id}`).then(({ data }) => {
      const w = data.data;
      setWork(w);
      setDetailContent(w.detail_content || {});
      setLoading(false);
    }).catch(() => { toast.error('作品不存在'); navigate('/'); });
  }, [id, navigate]);

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    toast.success('链接已复制到剪贴板');
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await api.patch(`/works/${id}`, { detail_content: detailContent });
      toast.success('保存成功');
      setIsEditing(false);
    } catch (err: any) {
      toast.error(err.response?.data?.message || '保存失败');
    } finally { setSaving(false); }
  };

  const handleDelete = async () => {
    setDeleting(true);
    try {
      await api.delete(`/works/${id}`);
      toast.success('作品已删除');
      navigate('/');
    } catch (err: any) {
      toast.error(err.response?.data?.message || '删除失败');
    } finally {
      setDeleting(false);
      setShowDeleteConfirm(false);
    }
  };

  const updateDC = (key: string, value: any) => {
    setDetailContent((prev: any) => ({ ...prev, [key]: value }));
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <motion.div
          className="text-6xl"
          animate={{ rotate: [0, 10, -10, 0], y: [0, -8, 0] }}
          transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
        >
          🎬
        </motion.div>
      </div>
    );
  }
  if (!work) return null;

  const isAuthor = user?.id === work.author?.id;
  const roundedRating = Math.round(work.rating);

  const sections = [
    { key: 'basic_info', icon: <BookOpen className="w-4 h-4" />, title: '基本信息', accent: '#667eea',
      content: <BasicInfoSection data={detailContent.basic_info} isEditing={isEditing} onChange={(v) => updateDC('basic_info', v)} /> },
    { key: 'rating_reason', icon: <MessageSquareText className="w-4 h-4" />, title: '评分理由', accent: '#FBBF24',
      content: <RatingReasonSection data={detailContent.rating_reason} isEditing={isEditing} onChange={(v) => updateDC('rating_reason', v)} /> },
    { key: 'synopsis', icon: <FileText className="w-4 h-4" />, title: '内容简介', accent: '#4ECDC4',
      content: <SynopsisSection data={detailContent.synopsis} isEditing={isEditing} onChange={(v) => updateDC('synopsis', v)} /> },
    { key: 'episodes', icon: <ListChecks className="w-4 h-4" />, title: '单集介绍', accent: '#fa709a',
      content: <EpisodesSection data={detailContent.episodes} isEditing={isEditing} onChange={(v) => updateDC('episodes', v)} /> },
    { key: 'production_background', icon: <Clapperboard className="w-4 h-4" />, title: '制作背景', accent: '#FFB347',
      content: <ProductionBackgroundSection data={detailContent.production_background} isEditing={isEditing} onChange={(v) => updateDC('production_background', v)} /> },
    { key: 'related_works', icon: <Link2 className="w-4 h-4" />, title: '相关作品', accent: '#A8E6CF',
      content: <RelatedWorksSection workIds={detailContent.related_work_ids || []} relatedWorks={work.related_works || []} isEditing={isEditing} onChange={(v) => updateDC('related_work_ids', v)} /> },
  ];

  return (
    <div className="min-h-screen">
      {/* ── Hero Header ───────────────────────────────────────── */}
      <section className="relative overflow-hidden" style={{ background: 'var(--accent-gradient-soft)' }}>
        <motion.div
          className="absolute w-80 h-80 rounded-full opacity-15 blur-3xl pointer-events-none"
          style={{ background: 'var(--accent)', top: '-6rem', right: '-4rem' }}
          animate={{ y: [0, -15, 0], x: [0, 8, 0] }}
          transition={{ duration: 7, repeat: Infinity, ease: 'easeInOut' }}
        />

        <div className="max-w-4xl mx-auto px-4 py-10 relative z-10">
          {/* Back + actions */}
          <div className="flex items-center justify-between mb-8">
            <motion.button
              onClick={() => navigate(-1)}
              className="flex items-center gap-1.5 text-sm font-medium"
              style={{ color: 'var(--text-secondary)', fontFamily: 'var(--font-display)' }}
              whileHover={{ x: -4, color: 'var(--accent)' }}
              whileTap={{ scale: 0.95 }}
            >
              <ArrowLeft className="w-4 h-4" /> 返回
            </motion.button>

            <div className="flex items-center gap-2">
              <motion.button onClick={handleShare} className="btn-ghost flex items-center gap-1.5"
                whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
                <Share2 className="w-4 h-4" /> 分享
              </motion.button>

              {isAuthor && (
                <AnimatePresence mode="wait">
                  {isEditing ? (
                    <motion.div key="editing" className="flex items-center gap-2"
                      initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -10 }}>
                      <motion.button onClick={handleSave} disabled={saving}
                        className="btn-accent flex items-center gap-1.5" whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
                        <Save className="w-4 h-4" /> {saving ? '保存中...' : '保存'}
                      </motion.button>
                      <motion.button onClick={() => setIsEditing(false)}
                        className="btn-ghost flex items-center gap-1.5" whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
                        <X className="w-4 h-4" /> 取消
                      </motion.button>
                    </motion.div>
                  ) : (
                    <motion.button key="view" onClick={() => setIsEditing(true)}
                      className="btn-accent flex items-center gap-1.5"
                      initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -10 }}
                      whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
                      <Edit className="w-4 h-4" /> 编辑详情
                    </motion.button>
                  )}
                </AnimatePresence>
              )}

              {isAuthor && !isEditing && (
                <motion.button
                  onClick={() => setShowDeleteConfirm(true)}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-sm rounded-xl transition-colors"
                  style={{
                    color: 'var(--text-tertiary)',
                    border: '1px solid var(--border)',
                    fontFamily: 'var(--font-display)',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.color = 'var(--error)';
                    e.currentTarget.style.borderColor = 'var(--error)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.color = 'var(--text-tertiary)';
                    e.currentTarget.style.borderColor = 'var(--border)';
                  }}
                  whileTap={{ scale: 0.97 }}
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  删除
                </motion.button>
              )}
            </div>
          </div>

          {/* Cover + meta */}
          <motion.div className="flex flex-col md:flex-row gap-8"
            initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }}
            transition={{ type: 'spring', stiffness: 200, damping: 25 }}>
            <motion.div className="w-full md:w-56 flex-shrink-0"
              whileHover={{ scale: 1.02, rotate: -1 }}
              transition={{ type: 'spring', stiffness: 300, damping: 20 }}>
              <div className="relative overflow-hidden" style={{ borderRadius: 'var(--radius-card)', boxShadow: 'var(--card-shadow-hover)' }}>
                <img src={work.cover_url} alt={work.name} className="w-full object-cover" style={{ display: 'block' }} />
              </div>
            </motion.div>

            <div className="flex-1 space-y-4">
              <div className="flex flex-wrap items-center gap-2">
                <span className="badge-pill text-white text-xs font-semibold"
                  style={{ background: typeGradients[work.type] || typeGradients.anime, boxShadow: '0 2px 8px rgba(0,0,0,0.12)' }}>
                  {typeIcons[work.type]} {typeLabels[work.type]}
                </span>
                {work.tags?.map((tag: any) => (
                  <span key={tag.id} className="badge-pill"
                    style={{ background: 'var(--bg-muted)', color: 'var(--text-tertiary)' }}>
                    {tag.name}
                  </span>
                ))}
              </div>

              <h1 className="heading-display text-3xl md:text-4xl" style={{ color: 'var(--text-primary)' }}>
                {work.name}
              </h1>

              <div className="flex items-center gap-2">
                <div className="flex items-center gap-0.5">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <motion.div key={i} initial={{ opacity: 0, scale: 0 }} animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: 0.3 + i * 0.08, type: 'spring', stiffness: 300 }}>
                      <Star className="w-5 h-5" style={{
                        color: i < roundedRating ? 'var(--star-filled)' : 'var(--star-empty)',
                        fill: i < roundedRating ? 'var(--star-filled)' : 'none',
                      }} />
                    </motion.div>
                  ))}
                </div>
                <span className="text-sm font-bold" style={{ color: 'var(--star-filled)', fontFamily: 'var(--font-display)' }}>
                  {work.rating.toFixed(1)}
                </span>
              </div>

              {work.description && (
                <p className="body-text text-sm leading-relaxed max-w-lg" style={{ color: 'var(--text-secondary)' }}>
                  {work.description}
                </p>
              )}

              {work.url && (
                <motion.a href={work.url} target="_blank" rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 text-sm font-medium"
                  style={{ color: 'var(--accent)', fontFamily: 'var(--font-display)' }}
                  whileHover={{ x: 4 }}>
                  观看链接 →
                </motion.a>
              )}

              <p className="text-xs" style={{ color: 'var(--text-tertiary)' }}>
                创建者: {work.author?.nickname || '匿名'} · {new Date(work.created_at).toLocaleDateString('zh-CN')}
              </p>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ── Glass Sections ────────────────────────────────────── */}
      <div className="max-w-4xl mx-auto px-4 py-10 space-y-6">
        {sections.map((section, i) => (
          <GlassSection key={section.key} icon={section.icon} title={section.title} index={i} accentVar={section.accent}>
            {section.content}
          </GlassSection>
        ))}
      </div>

      {/* ── Delete Confirmation Modal ─────────────────────────── */}
      <AnimatePresence>
        {showDeleteConfirm && (
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center px-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            {/* Backdrop */}
            <motion.div
              className="absolute inset-0"
              style={{ background: 'var(--overlay)' }}
              onClick={() => !deleting && setShowDeleteConfirm(false)}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            />

            {/* Dialog */}
            <motion.div
              className="relative glass-strong p-6 w-full max-w-sm"
              style={{ borderRadius: 'var(--radius-glass)' }}
              initial={{ opacity: 0, scale: 0.95, y: 12 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 12 }}
              transition={{ type: 'spring', stiffness: 300, damping: 28 }}
            >
              <div className="flex items-center gap-3 mb-4">
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center"
                  style={{ background: 'rgba(248, 113, 113, 0.12)' }}
                >
                  <Trash2 className="w-5 h-5" style={{ color: 'var(--error)' }} />
                </div>
                <div>
                  <h3
                    className="heading-section text-base"
                    style={{ color: 'var(--text-primary)' }}
                  >
                    删除作品
                  </h3>
                  <p
                    className="text-[0.8rem] mt-0.5"
                    style={{ color: 'var(--text-tertiary)' }}
                  >
                    此操作不可撤销
                  </p>
                </div>
              </div>

              <p
                className="text-sm mb-6 leading-relaxed"
                style={{ color: 'var(--text-secondary)' }}
              >
                删除后不可恢复，确认删除？
              </p>

              <div className="flex gap-3 justify-end">
                <motion.button
                  onClick={() => setShowDeleteConfirm(false)}
                  disabled={deleting}
                  className="btn-ghost text-sm disabled:opacity-50"
                  whileTap={{ scale: 0.97 }}
                >
                  取消
                </motion.button>
                <motion.button
                  onClick={handleDelete}
                  disabled={deleting}
                  className="px-4 py-2 rounded-xl text-sm font-medium disabled:opacity-50"
                  style={{
                    background: 'var(--error)',
                    color: 'white',
                    fontFamily: 'var(--font-display)',
                  }}
                  whileHover={{ scale: deleting ? 1 : 1.02 }}
                  whileTap={{ scale: deleting ? 1 : 0.97 }}
                >
                  {deleting ? '删除中...' : '确认删除'}
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
