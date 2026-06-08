import { useState } from "react";
import { Link } from "react-router-dom";
import { Heart, MessageCircle, Bookmark, Trash2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useCommunityStore } from "@/stores/communityStore";
import { useAuthStore } from "@/stores/authStore";

interface PostCardProps {
  post: {
    id: number; content: string; image_urls?: string[];
    author: { id: number; nickname: string | null; avatar: string | null; avatar_url: string | null };
    created_at: string;
    _count: { comments: number; likes: number; favorites: number };
    isLiked?: boolean; isFavorited?: boolean;
  };
}

export default function PostCard({ post }: PostCardProps) {
  const { toggleLike, toggleFavorite, deletePost } = useCommunityStore();
  const { user } = useAuthStore();
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const isAuthor = user?.id === post.author.id;

  const handleDelete = async () => {
    setDeleting(true);
    try {
      await deletePost(post.id);
    } catch {
      setDeleting(false);
      setShowDeleteConfirm(false);
    }
  };

  return (
    <>
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
        className="bg-white border rounded-xl p-4 mb-4">
        <div className="flex items-center gap-3 mb-3">
          <Link to={`/profile/${post.author.id}`}>
            <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 font-bold">
              {post.author.avatar_url ? <img src={post.author.avatar_url} className="w-full h-full rounded-full object-cover" /> : (post.author.nickname?.[0] || "?")}
            </div>
          </Link>
          <div className="flex-1">
            <Link to={`/profile/${post.author.id}`} className="text-sm font-medium hover:text-indigo-600">
              {post.author.nickname || "匿名"}
            </Link>
            <p className="text-xs text-gray-400">{new Date(post.created_at).toLocaleString("zh-CN")}</p>
          </div>
          {isAuthor && (
            <motion.button
              onClick={() => setShowDeleteConfirm(true)}
              className="p-1.5 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              title="删除帖子"
            >
              <Trash2 className="w-4 h-4" />
            </motion.button>
          )}
        </div>

        <Link to={`/posts/${post.id}`}>
          <p className="text-gray-800 mb-3 whitespace-pre-wrap">{post.content}</p>
        </Link>

        {post.image_urls && post.image_urls.length > 0 && (
          <div className={`grid gap-2 mb-3 ${post.image_urls.length === 1 ? "grid-cols-1" : post.image_urls.length <= 4 ? "grid-cols-2" : "grid-cols-3"}`}>
            {post.image_urls.map((url, i) => (
              <img key={i} src={url} className="rounded-lg object-cover max-h-60 w-full" />
            ))}
          </div>
        )}

        <div className="flex items-center gap-6 pt-2 border-t">
          <button onClick={() => toggleLike(post.id)} className={`flex items-center gap-1.5 text-sm ${post.isLiked ? "text-red-500" : "text-gray-400 hover:text-red-400"}`}>
            <Heart className={`w-4 h-4 ${post.isLiked ? "fill-current" : ""}`} /> {post._count.likes}
          </button>
          <Link to={`/posts/${post.id}`} className="flex items-center gap-1.5 text-sm text-gray-400 hover:text-indigo-500">
            <MessageCircle className="w-4 h-4" /> {post._count.comments}
          </Link>
          <button onClick={() => toggleFavorite(post.id)} className={`flex items-center gap-1.5 text-sm ${post.isFavorited ? "text-yellow-500" : "text-gray-400 hover:text-yellow-400"}`}>
            <Bookmark className={`w-4 h-4 ${post.isFavorited ? "fill-current" : ""}`} /> {post._count.favorites}
          </button>
        </div>
      </motion.div>

      {/* Delete Confirmation Modal */}
      <AnimatePresence>
        {showDeleteConfirm && (
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center px-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="absolute inset-0 bg-black/40"
              onClick={() => !deleting && setShowDeleteConfirm(false)}
            />
            <motion.div
              className="relative bg-white rounded-2xl p-6 w-full max-w-sm shadow-xl"
              initial={{ opacity: 0, scale: 0.95, y: 12 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 12 }}
              transition={{ type: "spring", stiffness: 300, damping: 28 }}
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-red-50">
                  <Trash2 className="w-5 h-5 text-red-500" />
                </div>
                <div>
                  <h3 className="text-base font-semibold text-gray-900">删除帖子</h3>
                  <p className="text-xs text-gray-400">此操作不可撤销</p>
                </div>
              </div>
              <p className="text-sm text-gray-600 mb-6 leading-relaxed">
                删除后，帖子的所有内容、评论、点赞和收藏将永久消失。确认删除？
              </p>
              <div className="flex gap-3 justify-end">
                <button
                  onClick={() => setShowDeleteConfirm(false)}
                  disabled={deleting}
                  className="px-4 py-2 text-sm rounded-xl border text-gray-600 hover:bg-gray-50 disabled:opacity-50"
                >
                  取消
                </button>
                <button
                  onClick={handleDelete}
                  disabled={deleting}
                  className="px-4 py-2 text-sm rounded-xl bg-red-500 text-white hover:bg-red-600 disabled:opacity-50"
                >
                  {deleting ? "删除中..." : "确认删除"}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
