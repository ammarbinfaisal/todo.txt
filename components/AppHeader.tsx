"use client";

import type { ReactNode } from "react";
import { Moon, Sun, Square } from "lucide-react";
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
}: {
  counts: { active: number; done: number };
  theme: Theme;
  onCycleTheme: () => void;
  filters: { status: Status; priority?: TodoPriority };
  onStatusChange: (s: Status) => void;
  onPriorityChange: (p?: TodoPriority) => void;
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
        <button
          type="button"
          onClick={onCycleTheme}
          className="flex h-10 w-10 items-center justify-center rounded-md border border-[var(--border)] text-[var(--muted)] md:w-auto md:gap-1.5 md:px-3"
          aria-label={`Switch theme (${theme})`}
          title="Theme"
        >
          {THEME_ICON[theme]}
          <span className="hidden text-sm md:inline">{theme}</span>
        </button>
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
