"use client";

import { create } from "zustand";
import { immer } from "zustand/middleware/immer";

import { dbGetSettings, dbPutSettings } from "@/lib/db";
import { DEFAULT_SETTINGS, type AppSettings } from "@/types/settings";

interface SettingsState extends AppSettings {
  loaded: boolean;
  load: () => Promise<void>;
  update: (partial: Partial<AppSettings>) => Promise<void>;
  exportJson: () => string;
  importJson: (json: string) => Promise<boolean>;
}

export const useSettingsStore = create<SettingsState>()(
  immer((set, get) => ({
    ...DEFAULT_SETTINGS,
    loaded: false,

    load: async () => {
      const saved = await dbGetSettings();
      if (saved) {
        set((s) => {
          s.projectPrefix = saved.projectPrefix ?? DEFAULT_SETTINGS.projectPrefix;
          s.contextPrefix = saved.contextPrefix ?? DEFAULT_SETTINGS.contextPrefix;
          s.shortcuts = { ...DEFAULT_SETTINGS.shortcuts, ...saved.shortcuts };
          s.loaded = true;
        });
      } else {
        set((s) => {
          s.loaded = true;
        });
      }
    },

    update: async (partial) => {
      set((s) => {
        if (partial.projectPrefix !== undefined) s.projectPrefix = partial.projectPrefix;
        if (partial.contextPrefix !== undefined) s.contextPrefix = partial.contextPrefix;
        if (partial.shortcuts) s.shortcuts = { ...s.shortcuts, ...partial.shortcuts };
      });
      const { projectPrefix, contextPrefix, shortcuts } = get();
      await dbPutSettings({ projectPrefix, contextPrefix, shortcuts });
    },

    exportJson: () => {
      const { projectPrefix, contextPrefix, shortcuts } = get();
      return JSON.stringify({ projectPrefix, contextPrefix, shortcuts }, null, 2);
    },

    importJson: async (json) => {
      try {
        const parsed = JSON.parse(json) as Partial<AppSettings>;
        const merged: Partial<AppSettings> = {};
        if (typeof parsed.projectPrefix === "string") merged.projectPrefix = parsed.projectPrefix.charAt(0);
        if (typeof parsed.contextPrefix === "string") merged.contextPrefix = parsed.contextPrefix.charAt(0);
        if (parsed.shortcuts && typeof parsed.shortcuts === "object") {
          merged.shortcuts = { ...get().shortcuts };
          for (const [k, v] of Object.entries(parsed.shortcuts)) {
            if (typeof v === "string" && k in DEFAULT_SETTINGS.shortcuts) {
              (merged.shortcuts as unknown as Record<string, string>)[k] = v;
            }
          }
        }
        await get().update(merged);
        return true;
      } catch {
        return false;
      }
    },
  }))
);
