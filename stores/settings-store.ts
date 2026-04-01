"use client";

import { create } from "zustand";
import { immer } from "zustand/middleware/immer";

import { dbGetSettings, dbPutSettings } from "@/lib/db";
import { DEFAULT_SETTINGS, DEFAULT_SWIPE, type AppSettings } from "@/types/settings";

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
          s.swipe = { ...DEFAULT_SWIPE, ...saved.swipe };
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
        if (partial.swipe) s.swipe = { ...s.swipe, ...partial.swipe };
      });
      const { projectPrefix, contextPrefix, shortcuts, swipe } = get();
      await dbPutSettings({ projectPrefix, contextPrefix, shortcuts, swipe });
    },

    exportJson: () => {
      const { projectPrefix, contextPrefix, shortcuts, swipe } = get();
      return JSON.stringify({ projectPrefix, contextPrefix, shortcuts, swipe }, null, 2);
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
        if (parsed.swipe && typeof parsed.swipe === "object") {
          merged.swipe = { ...get().swipe };
          const validActions = ["complete", "delete", "edit", "tag", "none"];
          if (typeof parsed.swipe.leftAction === "string" && validActions.includes(parsed.swipe.leftAction)) {
            merged.swipe.leftAction = parsed.swipe.leftAction;
          }
          if (typeof parsed.swipe.rightAction === "string" && validActions.includes(parsed.swipe.rightAction)) {
            merged.swipe.rightAction = parsed.swipe.rightAction;
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
