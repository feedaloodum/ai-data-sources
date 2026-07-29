import { createContext, useCallback, useContext, useEffect, useState } from 'react';
import type { ReactNode } from 'react';

// Capra applies its dark palette when a `.dark` class is present on an
// ancestor (`:root` is the light default; there is no `prefers-color-scheme`
// support). The Cribl platform runs this app in a sandboxed iframe and exposes
// no documented signal for its own theme, so we let the user pick. Default is
// light, matching Capra's default. The choice is held in memory only —
// AGENTS.md forbids browser storage in the iframe, so it resets on reload.

type Theme = 'light' | 'dark';

interface ThemeContextValue {
  theme: Theme;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextValue | null>(null);

const DARK_CLASS = 'dark';

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setTheme] = useState<Theme>('light');

  useEffect(() => {
    document.documentElement.classList.toggle(DARK_CLASS, theme === 'dark');
  }, [theme]);

  const toggleTheme = useCallback(() => {
    setTheme((t) => (t === 'dark' ? 'light' : 'dark'));
  }, []);

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme(): ThemeContextValue {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error('useTheme must be used within a ThemeProvider');
  return ctx;
}
