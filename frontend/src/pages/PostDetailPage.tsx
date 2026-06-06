import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, Heart, Bookmark, Send } from 'lucide-react';
import { motion } from 'framer-motion';
import { toast } from 'sonner';
import api from '@/lib/api';
import { useAuthStore } from '@/stores/authStore';

export default function PostDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuthStore();
  const [post, setPost] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [comment, setComment] = useState('');
  const [sending, setSending] = useState(false);

  const fetchPost = () => {
    api.get(`/posts/${id}`).then(({ data }) => { setPost(data.data); setLoading(false); })
      .catch(() => { toast.error('帖子不存在'); navigate('/community'); });
  };

  useEffect(() => { fetchPost(); }, [id]);

  const handleLike = async () => {
    const { data } = await api.post(`/posts/${id}/like`);
    setPost((p: any) => ({ ...p, isLiked: data.data.liked, _count: { ...p._count, likes: p._count.likes + (data.data.liked ? 1 : -1) } }));
  };

  const handleFavorite = async () => {
    const { data } = await api.post(`/posts/${id}/favorite`);
    setPost((p: any) => ({ ...p, isFavorited: data.data.favorited, _count: { ...p._count, favorites: p._count.favorites + (data.data.favorited ? 1 : -1) } }));
  };

  const handleComment = async () => {
    if (!comment.trim()) return;
    setSending(true);
    try {
      await api.post(`/posts/${id}/comments`, { content: comment });
      setComment('');
      fetchPost();
      toast.success('评论成功');
    } catch (err: any) { toast.error(err.response?.data?.message || '评论失败'); }
    finally { setSending(false); }
  };

  if (loading) return <div className="text-center py-20 text-gray-400">加载中...</div>;
  if (!post) return null;

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <button onClick={() => navigate(-1)} className="flex items-center gap-1 text-sm text-gray-500 hover:text-indigo-600 mb-6">
        <ArrowLeft className="w-4 h-4" /> 返回
      </button>
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
        <div className="bg-white border rounded-xl p-6 mb-6">
          <div className="flex items-center gap-3 mb-4">
            <Link to={`/profile/${post.author.id}`}>
              <div className="w-12 h-12 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 font-bold text-lg">
                {post.author.avatar ? <img src={post.author.avatar} className="w-full h-full rounded-full object-cover" /> : (post.author.nickname?.[0] || '?')}
              </div>
            </Link>
            <div>
              <Link to={`/profile/${post.author.id}`} className="font-medium hover:text-indigo-600">{post.author.nickname || '匿名'}</Link>
              <p className="text-xs text-gray-400">{new Date(post.created_at).toLocaleString('zh-CN')}</p>
            </div>
          </div>
          <p className="text-gray-800 mb-4 whitespace-pre-wrap">{post.content}</p>
          {post.image_urls && post.image_urls.length > 0 && (
            <div className="grid grid-cols-2 gap-2 mb-4">
              {post.image_urls.map((url: string, i: number) => (
                <img key={i} src={url} className="rounded-lg object-cover max-h-80 w-full" />
              ))}
            </div>
          )}
          <div className="flex items-center gap-6 pt-4 border-t">
            <button onClick={handleLike} className={`flex items-center gap-1.5 text-sm ${post.isLiked ? 'text-red-500' : 'text-gray-400'}`}>
              <Heart className={`w-4 h-4 ${post.isLiked ? 'fill-current' : ''}`} /> {post._count.likes}
            </button>
            <button onClick={handleFavorite} className={`flex items-center gap-1.5 text-sm ${post.isFavorited ? 'text-yellow-500' : 'text-gray-400'}`}>
              <Bookmark className={`w-4 h-4 ${post.isFavorited ? 'fill-current' : ''}`} /> {post._count.favorites}
            </button>
          </div>
        </div>
        <div className="bg-white border rounded-xl p-6">
          <h3 className="font-bold mb-4">评论 ({post.comments?.length || 0})</h3>
          <div className="space-y-4 mb-6">
            {post.comments?.map((c: any) => (
              <div key={c.id} className="flex gap-3">
                <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-xs text-gray-500">
                  {c.author.avatar ? <img src={c.author.avatar} className="w-full h-full rounded-full object-cover" /> : (c.author.nickname?.[0] || '?')}
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium">{c.author.nickname || '匿名'}</span>
                    <span className="text-xs text-gray-400">{new Date(c.created_at).toLocaleString('zh-CN')}</span>
                  </div>
                  <p className="text-sm text-gray-700 mt-1">{c.content}</p>
                </div>
              </div>
            ))}
            {(!post.comments || post.comments.length === 0) && <p className="text-sm text-gray-400">暂无评论</p>}
          </div>
          {isAuthenticated && (
            <div className="flex gap-2">
              <input value={comment} onChange={(e) => setComment(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleComment(); } }}
                placeholder="写下你的评论..."
                className="flex-1 px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
              <button onClick={handleComment} disabled={sending || !comment.trim()}
                className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50">
                <Send className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
}
