"use client";

import { create } from "zustand";
import { immer } from "zustand/middleware/immer";

import { dbGetSettings, dbPutSettings } from "@/lib/db";
import { DEFAULT_SETTINGS, type AppSettings } from "@/types/settings";

interface SettingsState extends AppSettings {
  loaded: boolean;
  load: () => Promise<void>;
  update: (partial: Partial<AppSettings>) => Promise<void>;
}

export const useSettingsStore = create<SettingsState>()(
  immer((set, get) => ({
    ...DEFAULT_SETTINGS,
    loaded: false,

    load: async () => {
      const saved = await dbGetSettings();
      if (saved) {
        set((s) => {
          s.projectPrefix = saved.projectPrefix;
          s.contextPrefix = saved.contextPrefix;
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
      });
      const { projectPrefix, contextPrefix } = get();
      await dbPutSettings({ projectPrefix, contextPrefix });
    },
  }))
);
