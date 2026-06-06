import { Link } from 'react-router-dom';
import { Heart, MessageCircle, Bookmark } from 'lucide-react';
import { motion } from 'framer-motion';
import { useCommunityStore } from '@/stores/communityStore';

interface PostCardProps {
  post: {
    id: number; content: string; image_urls?: string[];
    author: { id: number; nickname: string | null; avatar: string | null };
    created_at: string;
    _count: { comments: number; likes: number; favorites: number };
    isLiked?: boolean; isFavorited?: boolean;
  };
}

export default function PostCard({ post }: PostCardProps) {
  const { toggleLike, toggleFavorite } = useCommunityStore();

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
      className="bg-white border rounded-xl p-4 mb-4">
      <div className="flex items-center gap-3 mb-3">
        <Link to={`/profile/${post.author.id}`}>
          <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 font-bold">
            {post.author.avatar ? <img src={post.author.avatar} className="w-full h-full rounded-full object-cover" /> : (post.author.nickname?.[0] || '?')}
          </div>
        </Link>
        <div>
          <Link to={`/profile/${post.author.id}`} className="text-sm font-medium hover:text-indigo-600">
            {post.author.nickname || '匿名'}
          </Link>
          <p className="text-xs text-gray-400">{new Date(post.created_at).toLocaleString('zh-CN')}</p>
        </div>
      </div>

      <Link to={`/posts/${post.id}`}>
        <p className="text-gray-800 mb-3 whitespace-pre-wrap">{post.content}</p>
      </Link>

      {post.image_urls && post.image_urls.length > 0 && (
        <div className={`grid gap-2 mb-3 ${post.image_urls.length === 1 ? 'grid-cols-1' : post.image_urls.length <= 4 ? 'grid-cols-2' : 'grid-cols-3'}`}>
          {post.image_urls.map((url, i) => (
            <img key={i} src={url} className="rounded-lg object-cover max-h-60 w-full" />
          ))}
        </div>
      )}

      <div className="flex items-center gap-6 pt-2 border-t">
        <button onClick={() => toggleLike(post.id)} className={`flex items-center gap-1.5 text-sm ${post.isLiked ? 'text-red-500' : 'text-gray-400 hover:text-red-400'}`}>
          <Heart className={`w-4 h-4 ${post.isLiked ? 'fill-current' : ''}`} /> {post._count.likes}
        </button>
        <Link to={`/posts/${post.id}`} className="flex items-center gap-1.5 text-sm text-gray-400 hover:text-indigo-500">
          <MessageCircle className="w-4 h-4" /> {post._count.comments}
        </Link>
        <button onClick={() => toggleFavorite(post.id)} className={`flex items-center gap-1.5 text-sm ${post.isFavorited ? 'text-yellow-500' : 'text-gray-400 hover:text-yellow-400'}`}>
          <Bookmark className={`w-4 h-4 ${post.isFavorited ? 'fill-current' : ''}`} /> {post._count.favorites}
        </button>
      </div>
    </motion.div>
  );
}
