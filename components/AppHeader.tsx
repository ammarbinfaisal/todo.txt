"use client";

import type { ReactNode } from "react";
import { Copy, Download, Moon, Sun, Square } from "lucide-react";
import { FilterChips } from "@/components/FilterChips";
import type { Theme } from "@/stores/theme-store";
import type { TodoPriority } from "@/types/todo";

type Status = "all" | "active" | "done";

const THEME_ICON: Record<Theme, ReactNode> = {
  light: <Sun size={16} />,
  beige: <Square size={16} />,
  dark: <Moon size={16} />,
};

export function AppHeader({
  counts,
  theme,
  onCycleTheme,
  filters,
  onStatusChange,
  onPriorityChange,
  onCopyAll,
  onDownloadAll,
}: {
  counts: { active: number; done: number };
  theme: Theme;
  onCycleTheme: () => void;
  filters: { status: Status; priority?: TodoPriority };
  onStatusChange: (s: Status) => void;
  onPriorityChange: (p?: TodoPriority) => void;
  onCopyAll: () => void;
  onDownloadAll: () => void;
}) {
  return (
    <header className="sticky top-0 z-10 border-b border-[var(--border)] bg-[var(--surface)] px-2 py-1.5 md:px-4 md:py-3">
      <div className="flex items-center justify-between">
        <div>
          <div className="hidden text-sm font-semibold tracking-tight md:block">
            TodoTXT
          </div>
          <div className="text-sm text-[var(--muted)]">
            {counts.active} active · {counts.done} done
          </div>
        </div>
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={onCopyAll}
            className="flex h-9 w-9 items-center justify-center rounded-md text-[var(--muted)]"
            aria-label="Copy all todos"
            title="Copy all"
          >
            <Copy size={15} />
          </button>
          <button
            type="button"
            onClick={onDownloadAll}
            className="flex h-9 w-9 items-center justify-center rounded-md text-[var(--muted)]"
            aria-label="Download todo.txt"
            title="Export"
          >
            <Download size={15} />
          </button>
          <button
            type="button"
            onClick={onCycleTheme}
            className="flex h-9 w-9 items-center justify-center rounded-md border border-[var(--border)] text-[var(--muted)]"
            aria-label={`Switch theme (${theme})`}
            title="Theme"
          >
            {THEME_ICON[theme]}
          </button>
        </div>
      </div>

      <div className="mt-1.5 md:mt-3">
        <FilterChips
          status={filters.status}
          priority={filters.priority}
          onStatusChange={onStatusChange}
          onPriorityChange={onPriorityChange}
        />
      </div>
    </header>
  );
}
