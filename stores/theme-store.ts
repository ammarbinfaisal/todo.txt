"use client";

import { create } from "zustand";

export type Theme = "light" | "beige" | "dark";

interface ThemeState {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  cycle: () => void;
  hydrateFromStorage: () => void;
}

function applyTheme(theme: Theme) {
  if (typeof document === "undefined") return;
  document.documentElement.dataset.theme = theme;
}

function readThemeFromStorage(): Theme | null {
  if (typeof window === "undefined") return null;
  const value = window.localStorage.getItem("todotxt-theme");
  if (value === "dark" || value === "light" || value === "beige") return value;
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
  cycle: () => {
    const current = get().theme;
    const next: Theme =
      current === "light" ? "beige" : current === "beige" ? "dark" : "light";
    get().setTheme(next);
  },
  hydrateFromStorage: () => {
    const stored = readThemeFromStorage();
    if (stored) get().setTheme(stored);
    else applyTheme(get().theme);
  }
}));
