import { create } from 'zustand';
import api from '@/lib/api';

interface Work {
  id: number;
  name: string;
  type: string;
  rating: number;
  cover: string;
  cover_url: string;
  description: string | null;
  tags: { id: number; name: string }[];
  author: { id: number; nickname: string | null; avatar: string | null };
  created_at: string;
}

interface Filters {
  type?: string;
  tag?: string;
  search?: string;
  sortBy?: string;
  sortOrder?: string;
}

interface WorkState {
  works: Work[];
  nextCursor: number | null;
  filters: Filters;
  isLoading: boolean;
  fetchWorks: (filters?: Filters, append?: boolean) => Promise<void>;
  loadMore: () => Promise<void>;
  setFilters: (filters: Filters) => void;
}

export const useWorkStore = create<WorkState>((set, get) => ({
  works: [],
  nextCursor: null,
  filters: {},
  isLoading: false,

  fetchWorks: async (filters?: Filters, append = false) => {
    const state = get();
    const currentFilters = filters ?? state.filters;
    if (filters) set({ filters: currentFilters });
    set({ isLoading: true });
    try {
      const params: any = { limit: 20 };
      if (currentFilters.type) params.type = currentFilters.type;
      if (currentFilters.tag) params.tag = currentFilters.tag;
      if (currentFilters.search) params.search = currentFilters.search;
      if (currentFilters.sortBy) params.sortBy = currentFilters.sortBy;
      if (currentFilters.sortOrder) params.sortOrder = currentFilters.sortOrder;
      if (append && state.nextCursor) params.cursor = state.nextCursor;

      const { data } = await api.get('/works', { params });
      const { works, nextCursor } = data.data;
      set({
        works: append ? [...state.works, ...works] : works,
        nextCursor,
        isLoading: false,
      });
    } catch {
      set({ isLoading: false });
    }
  },

  loadMore: async () => {
    const state = get();
    if (!state.nextCursor || state.isLoading) return;
    await get().fetchWorks(undefined, true);
  },

  setFilters: (filters) => {
    set({ filters, works: [], nextCursor: null });
  },
}));
