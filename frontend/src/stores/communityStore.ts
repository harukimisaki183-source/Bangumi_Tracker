import { create } from 'zustand';
import api from '@/lib/api';

interface Post {
  id: number; content: string; images: string[]; image_urls: string[];
  author: { id: number; nickname: string | null; avatar: string | null; avatar_url: string | null };
  created_at: string;
  _count: { comments: number; likes: number; favorites: number };
  isLiked?: boolean; isFavorited?: boolean;
}

interface CommunityState {
  posts: Post[]; nextCursor: number | null; isLoading: boolean;
  fetchPosts: (append?: boolean) => Promise<void>;
  loadMore: () => Promise<void>;
  toggleLike: (postId: number) => Promise<void>;
  toggleFavorite: (postId: number) => Promise<void>;
  addPost: (post: Post) => void;
}

export const useCommunityStore = create<CommunityState>((set, get) => ({
  posts: [], nextCursor: null, isLoading: false,

  fetchPosts: async (append = false) => {
    const state = get();
    set({ isLoading: true });
    try {
      const params: any = { limit: 20 };
      if (append && state.nextCursor) params.cursor = state.nextCursor;
      const { data } = await api.get('/posts', { params });
      const { posts, nextCursor } = data.data;
      set({ posts: append ? [...state.posts, ...posts] : posts, nextCursor, isLoading: false });
    } catch { set({ isLoading: false }); }
  },

  loadMore: async () => {
    const state = get();
    if (!state.nextCursor || state.isLoading) return;
    await get().fetchPosts(true);
  },

  toggleLike: async (postId) => {
    try {
      const { data } = await api.post(`/posts/${postId}/like`);
      set((s) => ({
        posts: s.posts.map((p) => p.id === postId ? { ...p, isLiked: data.data.liked, _count: { ...p._count, likes: p._count.likes + (data.data.liked ? 1 : -1) } } : p),
      }));
    } catch {}
  },

  toggleFavorite: async (postId) => {
    try {
      const { data } = await api.post(`/posts/${postId}/favorite`);
      set((s) => ({
        posts: s.posts.map((p) => p.id === postId ? { ...p, isFavorited: data.data.favorited, _count: { ...p._count, favorites: p._count.favorites + (data.data.favorited ? 1 : -1) } } : p),
      }));
    } catch {}
  },

  addPost: (post) => set((s) => ({ posts: [post, ...s.posts] })),
}));
