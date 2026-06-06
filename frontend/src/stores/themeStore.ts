import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type ColorMode = 'light' | 'dark';
export type AccentScheme = 'warm' | 'cool';

interface ThemeState {
  mode: ColorMode;
  accent: AccentScheme;
  setMode: (mode: ColorMode) => void;
  setAccent: (accent: AccentScheme) => void;
  toggleMode: () => void;
  toggleAccent: () => void;
}

export const useThemeStore = create<ThemeState>()(
  persist(
    (set, get) => ({
      mode: 'light',
      accent: 'warm',

      setMode: (mode) => {
        set({ mode });
        applyTheme(mode, get().accent);
      },

      setAccent: (accent) => {
        set({ accent });
        applyTheme(get().mode, accent);
      },

      toggleMode: () => {
        const next = get().mode === 'light' ? 'dark' : 'light';
        set({ mode: next });
        applyTheme(next, get().accent);
      },

      toggleAccent: () => {
        const next = get().accent === 'warm' ? 'cool' : 'warm';
        set({ accent: next });
        applyTheme(get().mode, next);
      },
    }),
    {
      name: 'bangumi-theme',
      onRehydrateStorage: () => (state) => {
        if (state) {
          applyTheme(state.mode, state.accent);
        }
      },
    }
  )
);

function applyTheme(mode: ColorMode, accent: AccentScheme) {
  const root = document.documentElement;
  root.classList.add('theme-transition');
  root.setAttribute('data-mode', mode);
  root.setAttribute('data-accent', accent);

  // Update meta theme-color for mobile browsers
  const metaThemeColor = document.querySelector('meta[name="theme-color"]');
  const colors: Record<string, string> = {
    'light-warm': '#FFF8F0',
    'light-cool': '#F0F7FA',
    'dark-warm': '#1A1019',
    'dark-cool': '#0F1A2E',
  };
  if (metaThemeColor) {
    metaThemeColor.setAttribute('content', colors[`${mode}-${accent}`]);
  }

  setTimeout(() => root.classList.remove('theme-transition'), 500);
}

// Initialize theme on module load
if (typeof document !== 'undefined') {
  const stored = localStorage.getItem('bangumi-theme');
  if (stored) {
    try {
      const parsed = JSON.parse(stored);
      if (parsed.state) {
        applyTheme(parsed.state.mode || 'light', parsed.state.accent || 'warm');
      }
    } catch {
      applyTheme('light', 'warm');
    }
  } else {
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    applyTheme(prefersDark ? 'dark' : 'light', 'warm');
  }
}
