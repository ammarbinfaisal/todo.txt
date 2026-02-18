"use client";

import { FilterChips } from "@/components/FilterChips";
import type { TodoPriority } from "@/types/todo";

type Status = "all" | "active" | "done";
type Theme = "light" | "dark";

export function AppHeader({
  counts,
  theme,
  onToggleTheme,
  filters,
  onStatusChange,
  onPriorityChange,
  input,
  onInputChange,
  onAdd
}: {
  counts: { active: number; done: number };
  theme: Theme;
  onToggleTheme: () => void;
  filters: { status: Status; priority?: TodoPriority };
  onStatusChange: (s: Status) => void;
  onPriorityChange: (p?: TodoPriority) => void;
  input: string;
  onInputChange: (value: string) => void;
  onAdd: () => Promise<void>;
}) {
  return (
    <header className="sticky top-0 z-10 border-b border-neutral-200 bg-white/80 px-4 py-3 backdrop-blur dark:border-neutral-800 dark:bg-neutral-950/80">
      <div className="flex items-center justify-between">
        <div>
          <div className="text-sm font-semibold tracking-tight">TodoTXT</div>
          <div className="text-[11px] text-neutral-500 dark:text-neutral-400">
            {counts.active} active · {counts.done} done
          </div>
        </div>
        <button
          type="button"
          onClick={onToggleTheme}
          className="h-10 w-10 rounded-md border border-neutral-200 text-xs text-neutral-700 dark:border-neutral-800 dark:text-neutral-200"
          aria-label={theme === "dark" ? "Switch to light theme" : "Switch to dark theme"}
          title="Theme"
        >
          {theme === "dark" ? "☾" : "☀"}
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

      <form
        className="mt-3 flex gap-2"
        onSubmit={async (e) => {
          e.preventDefault();
          await onAdd();
        }}
      >
        <input
          value={input}
          onChange={(e) => onInputChange(e.target.value)}
          placeholder='Add todo.txt line (e.g. "(A) Call dentist +Health due:2026-03-15")'
          className={[
            "h-11 flex-1 rounded-md border px-3 text-sm",
            "border-neutral-300 bg-white text-neutral-950 placeholder:text-neutral-400",
            "dark:border-neutral-700 dark:bg-neutral-950 dark:text-neutral-50 dark:placeholder:text-neutral-600"
          ].join(" ")}
        />
        <button
          type="submit"
          className="h-11 w-16 rounded-md bg-neutral-900 text-sm font-semibold text-white dark:bg-neutral-50 dark:text-neutral-950"
        >
          Add
        </button>
      </form>
    </header>
  );
}

