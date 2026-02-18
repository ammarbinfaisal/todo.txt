"use client";

import { create } from "zustand";

type Theme = "light" | "dark";

interface ThemeState {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  toggle: () => void;
  hydrateFromStorage: () => void;
}

function applyTheme(theme: Theme) {
  if (typeof document === "undefined") return;
  document.documentElement.classList.toggle("dark", theme === "dark");
}

function readThemeFromStorage(): Theme | null {
  if (typeof window === "undefined") return null;
  const value = window.localStorage.getItem("todotxt-theme");
  if (value === "dark" || value === "light") return value;
  return null;
}

function writeThemeToStorage(theme: Theme) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem("todotxt-theme", theme);
}

export const useThemeStore = create<ThemeState>((set, get) => ({
  theme: "light",
  setTheme: (theme) => {
    set({ theme });
    applyTheme(theme);
    writeThemeToStorage(theme);
  },
  toggle: () => {
    const next: Theme = get().theme === "dark" ? "light" : "dark";
    get().setTheme(next);
  },
  hydrateFromStorage: () => {
    const stored = readThemeFromStorage();
    if (stored) get().setTheme(stored);
    else applyTheme(get().theme);
  }
}));

