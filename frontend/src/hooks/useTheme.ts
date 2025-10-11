import { useState, useEffect } from 'react';

export function useTheme() {
  const [dark, setDark] = useState<boolean>(() => {
    try {
      const saved = localStorage.getItem("stutor:theme");
      if (saved) return saved === "dark";
      return window.matchMedia?.("(prefers-color-scheme: dark)").matches ?? false;
    } catch {
      return false;
    }
  });

  useEffect(() => {
    // Apply theme to DOM whenever dark state changes
    const root = document.documentElement;
    if (dark) {
      root.classList.add("dark");
      localStorage.setItem("stutor:theme", "dark");
    } else {
      root.classList.remove("dark");
      localStorage.setItem("stutor:theme", "light");
    }
  }, [dark]);

  const toggleTheme = () => setDark(!dark);

  return { dark, toggleTheme };
}
