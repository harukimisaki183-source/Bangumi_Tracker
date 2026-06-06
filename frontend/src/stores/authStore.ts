import { create } from 'zustand';
import api from '@/lib/api';

interface User {
  id: number;
  email: string;
  nickname: string | null;
  avatar: string | null;
}

interface AuthState {
  user: User | null;
  accessToken: string | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, code: string) => Promise<void>;
  logout: () => void;
  fetchMe: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  accessToken: localStorage.getItem('accessToken'),
  isAuthenticated: !!localStorage.getItem('accessToken'),

  login: async (email, password) => {
    const { data } = await api.post('/auth/login', { email, password });
    const { accessToken, user } = data.data;
    localStorage.setItem('accessToken', accessToken);
    set({ user, accessToken, isAuthenticated: true });
  },

  register: async (email, password, code) => {
    const { data } = await api.post('/auth/register', { email, password, code });
    const { accessToken, user } = data.data;
    localStorage.setItem('accessToken', accessToken);
    set({ user, accessToken, isAuthenticated: true });
  },

  logout: () => {
    localStorage.removeItem('accessToken');
    set({ user: null, accessToken: null, isAuthenticated: false });
  },

  fetchMe: async () => {
    try {
      const { data } = await api.get('/users/me');
      set({ user: data.data, isAuthenticated: true });
    } catch {
      set({ user: null, isAuthenticated: false });
      localStorage.removeItem('accessToken');
    }
  },
}));
