"use client";

import { create } from "zustand";
import { immer } from "zustand/middleware/immer";

import {
  dbAddChangeEntry,
  dbGetAllChangeEntries,
  dbDeleteChangeEntriesAboveSeq,
  dbDeleteOldestChangeEntries,
  dbClearHistory,
} from "@/lib/db";
import type { ChangeAction, ChangeEntry } from "@/types/history";

const MAX_HISTORY = 1000;

interface HistoryState {
  entries: ChangeEntry[];
  cursor: number;
  nextSeq: number;
  loaded: boolean;

  load: () => Promise<void>;
  push: (action: ChangeAction, label: string) => Promise<void>;
  undo: () => ChangeEntry | undefined;
  redo: () => ChangeEntry | undefined;
  clear: () => Promise<void>;
}

export const useHistoryStore = create<HistoryState>()(
  immer((set, get) => ({
    entries: [],
    cursor: 0,
    nextSeq: 1,
    loaded: false,

    load: async () => {
      const entries = await dbGetAllChangeEntries();
      const maxSeq =
        entries.length > 0 ? Math.max(...entries.map((e) => e.seq)) : 0;
      set((s) => {
        s.entries = entries;
        s.cursor = entries.length;
        s.nextSeq = maxSeq + 1;
        s.loaded = true;
      });
    },

    push: async (action, label) => {
      const { cursor, entries, nextSeq } = get();

      // Truncate redo branch
      if (cursor < entries.length) {
        const truncateAboveSeq = entries[cursor].seq - 1;
        await dbDeleteChangeEntriesAboveSeq(truncateAboveSeq);
      }

      const entry: ChangeEntry = {
        seq: nextSeq,
        action,
        timestamp: new Date().toISOString(),
        label,
      };

      const id = await dbAddChangeEntry(entry);
      entry.id = id;

      const newEntries = [...entries.slice(0, cursor), entry];
      const overflow = newEntries.length - MAX_HISTORY;

      if (overflow > 0) {
        await dbDeleteOldestChangeEntries(MAX_HISTORY);
        newEntries.splice(0, overflow);
      }

      set((s) => {
        s.entries = newEntries;
        s.cursor = newEntries.length;
        s.nextSeq = nextSeq + 1;
      });
    },

    undo: () => {
      const { cursor, entries } = get();
      if (cursor <= 0) return undefined;
      const entry = entries[cursor - 1];
      set((s) => {
        s.cursor -= 1;
      });
      return entry;
    },

    redo: () => {
      const { cursor, entries } = get();
      if (cursor >= entries.length) return undefined;
      const entry = entries[cursor];
      set((s) => {
        s.cursor += 1;
      });
      return entry;
    },

    clear: async () => {
      await dbClearHistory();
      set((s) => {
        s.entries = [];
        s.cursor = 0;
        s.nextSeq = 1;
      });
    },
  }))
);

export const selectCanUndo = (s: HistoryState) => s.cursor > 0;
export const selectCanRedo = (s: HistoryState) => s.cursor < s.entries.length;
export const selectUndoLabel = (s: HistoryState) =>
  s.cursor > 0 ? s.entries[s.cursor - 1].label : undefined;
export const selectRedoLabel = (s: HistoryState) =>
  s.cursor < s.entries.length ? s.entries[s.cursor].label : undefined;
