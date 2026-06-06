import { useEffect, useRef, useState } from 'react';
import { Plus } from 'lucide-react';
import { useCommunityStore } from '@/stores/communityStore';
import { useAuthStore } from '@/stores/authStore';
import PostCard from '@/components/PostCard';
import CreatePostDialog from '@/components/CreatePostDialog';

export default function CommunityPage() {
  const { posts, isLoading, nextCursor, fetchPosts, loadMore, addPost } = useCommunityStore();
  const { isAuthenticated } = useAuthStore();
  const [showDialog, setShowDialog] = useState(false);
  const sentinelRef = useRef<HTMLDivElement>(null);

  useEffect(() => { fetchPosts(); }, []);

  useEffect(() => {
    if (!sentinelRef.current) return;
    const observer = new IntersectionObserver(
      (entries) => { if (entries[0].isIntersecting && nextCursor && !isLoading) loadMore(); },
      { threshold: 0.1 }
    );
    observer.observe(sentinelRef.current);
    return () => observer.disconnect();
  }, [nextCursor, isLoading, loadMore]);

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">社区大厅</h1>
        {isAuthenticated && (
          <button onClick={() => setShowDialog(true)}
            className="flex items-center gap-1 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 text-sm">
            <Plus className="w-4 h-4" /> 发布
          </button>
        )}
      </div>
      {posts.length === 0 && !isLoading ? (
        <div className="text-center py-20 text-gray-400">
          <p>还没有帖子</p>
          {isAuthenticated && <p className="mt-2 text-sm">点击右上角发布第一条动态吧</p>}
        </div>
      ) : (
        <div>
          {posts.map((post) => <PostCard key={post.id} post={post} />)}
          {isLoading && <div className="text-center py-4 text-gray-400">加载中...</div>}
        </div>
      )}
      {nextCursor && <div ref={sentinelRef} className="h-10" />}
      {showDialog && <CreatePostDialog onClose={() => setShowDialog(false)} onCreated={addPost} />}
    </div>
  );
}
