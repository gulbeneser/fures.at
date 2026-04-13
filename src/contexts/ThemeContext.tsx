import { createContext, useContext, type ReactNode } from 'react';

export type SiteTheme = 'dark' | 'light';

const ThemeContext = createContext<SiteTheme>('dark');

export function ThemeProvider({ theme, children }: { theme: SiteTheme; children: ReactNode }) {
  return (
    <ThemeContext.Provider value={theme}>
      <div data-theme={theme} className={theme === 'light' ? 'theme-light' : ''}>
        {children}
      </div>
    </ThemeContext.Provider>
  );
}

export function useTheme(): SiteTheme {
  return useContext(ThemeContext);
}
