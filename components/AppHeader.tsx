"use client";

import { Copy, Download, Settings } from "lucide-react";
import Link from "next/link";
import { FilterChips } from "@/components/FilterChips";
import type { TodoPriority } from "@/types/todo";

type Status = "all" | "active" | "done";

export function AppHeader({
  counts,
  filters,
  onStatusChange,
  onPriorityChange,
  onCopyAll,
  onDownloadAll,
}: {
  counts: { active: number; done: number };
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
          <Link
            href="/settings"
            className="flex h-9 w-9 items-center justify-center rounded-md border border-[var(--border)] text-[var(--muted)]"
            aria-label="Settings"
            title="Settings"
          >
            <Settings size={15} />
          </Link>
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
