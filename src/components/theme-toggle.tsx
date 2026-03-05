'use client';

import { useTheme } from '@/context/theme-context';

export function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();

  return (
    <button
      onClick={toggleTheme}
      aria-label="Toggle theme"
      className="fixed bottom-5 right-5 z-50 rounded-full border border-[var(--border-color)] bg-[var(--card-bg)] px-4 py-2 text-sm font-semibold text-[var(--text-primary)] shadow-lg backdrop-blur transition-all duration-300 hover:-translate-y-1 hover:shadow-xl"
    >
      {theme === 'light' ? '🌙 Dark' : '☀️ Light'}
    </button>
  );
}
