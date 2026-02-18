"use client";

import { FilterChips } from "@/components/FilterChips";
import type { Theme } from "@/stores/theme-store";
import type { TodoPriority } from "@/types/todo";

type Status = "all" | "active" | "done";

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
    <header className="sticky top-0 z-10 border-b border-[var(--border)] bg-[var(--surface)] px-4 py-3">
      <div className="flex items-center justify-between">
        <div>
          <div className="text-sm font-semibold tracking-tight">TodoTXT</div>
          <div className="text-[11px] text-[var(--muted)]">
            {counts.active} active · {counts.done} done
          </div>
        </div>
        <button
          type="button"
          onClick={onCycleTheme}
          className="h-10 w-10 rounded-md border border-[var(--border)] text-xs text-[var(--muted)]"
          aria-label={
            theme === "dark"
              ? "Switch theme (dark)"
              : theme === "beige"
                ? "Switch theme (beige)"
                : "Switch theme (light)"
          }
          title="Theme"
        >
          {theme === "dark" ? "☾" : theme === "beige" ? "◻" : "☀"}
        </button>
      </div>

      <div className="mt-3">
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
