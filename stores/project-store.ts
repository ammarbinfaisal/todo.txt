"use client";

import { create } from "zustand";
import { immer } from "zustand/middleware/immer";

import {
  dbGetAllProjectConfigs,
  dbPutProjectConfig,
  dbDeleteProjectConfig,
} from "@/lib/db";
import type { ProjectConfig } from "@/types/project";

const DEFAULT_EMOJIS = [
  "📁", "💊", "🏠", "💻", "📞", "✈️", "📚", "🎯",
  "💰", "🔧", "🎨", "🧪", "📝", "🏋️", "🎵", "🍽️",
  "🚗", "🌱", "⭐", "🔥",
];

const DEFAULT_COLORS = [
  "#3b82f6", "#10b981", "#8b5cf6", "#f59e0b",
  "#f43f5e", "#06b6d4", "#d946ef", "#84cc16",
];

function hashIndex(str: string, len: number) {
  let h = 0;
  for (let i = 0; i < str.length; i++) h = (h * 31 + str.charCodeAt(i)) | 0;
  return ((h % len) + len) % len;
}

function defaultConfig(name: string): ProjectConfig {
  return {
    name,
    emoji: DEFAULT_EMOJIS[hashIndex(name, DEFAULT_EMOJIS.length)],
    color: DEFAULT_COLORS[hashIndex(name, DEFAULT_COLORS.length)],
    updatedAt: new Date().toISOString(),
  };
}

interface ProjectState {
  configs: Record<string, ProjectConfig>;
  loaded: boolean;

  load: () => Promise<void>;
  getConfig: (name: string) => ProjectConfig;
  upsert: (name: string, partial: Partial<Pick<ProjectConfig, "emoji" | "color">>) => Promise<void>;
  rename: (oldName: string, newName: string) => Promise<void>;
}

export const useProjectStore = create<ProjectState>()(
  immer((set, get) => ({
    configs: {},
    loaded: false,

    load: async () => {
      const all = await dbGetAllProjectConfigs();
      const map: Record<string, ProjectConfig> = {};
      for (const c of all) map[c.name] = c;
      set((s) => {
        s.configs = map;
        s.loaded = true;
      });
    },

    getConfig: (name: string) => {
      return get().configs[name] ?? defaultConfig(name);
    },

    upsert: async (name, partial) => {
      const existing = get().configs[name] ?? defaultConfig(name);
      const updated: ProjectConfig = {
        ...existing,
        ...partial,
        name,
        updatedAt: new Date().toISOString(),
      };
      await dbPutProjectConfig(updated);
      set((s) => {
        s.configs[name] = updated;
      });
    },

    rename: async (oldName, newName) => {
      const trimmed = newName.trim();
      if (!trimmed || trimmed === oldName) return;
      const existing = get().configs[oldName] ?? defaultConfig(oldName);
      const updated: ProjectConfig = {
        ...existing,
        name: trimmed,
        updatedAt: new Date().toISOString(),
      };
      await dbDeleteProjectConfig(oldName);
      await dbPutProjectConfig(updated);
      set((s) => {
        delete s.configs[oldName];
        s.configs[trimmed] = updated;
      });
    },
  }))
);
