"use client";

export function BatchBar({
  count,
  totalCount,
  onSelectAll,
  onComplete,
  onDelete,
  onTag,
  onCancel,
}: {
  count: number;
  totalCount: number;
  onSelectAll: () => void;
  onComplete: () => void;
  onDelete: () => void;
  onTag: () => void;
  onCancel: () => void;
}) {
  return (
    <div className="fixed inset-x-0 bottom-0 z-50 border-t border-[var(--border)] bg-[var(--surface)] px-2 py-2 shadow-lg">
      <div className="flex items-center justify-between gap-2">
        <button
          type="button"
          onClick={onCancel}
          className="flex h-10 w-10 items-center justify-center rounded-md text-base text-[var(--muted)]"
          aria-label="Cancel selection"
        >
          ✕
        </button>

        <button
          type="button"
          onClick={onSelectAll}
          className="flex h-10 items-center gap-1 rounded-md px-2 text-sm text-[var(--muted)]"
        >
          <span>✓</span>
          <span className="hidden md:inline">All</span>
        </button>

        <span className="rounded-full bg-[var(--primary)] px-2.5 py-0.5 text-xs font-semibold text-[var(--primary-fg)]">
          {count}
          <span className="hidden md:inline"> / {totalCount}</span>
        </span>

        <div className="flex-1" />

        <button
          type="button"
          onClick={onComplete}
          className="flex h-10 w-10 items-center justify-center rounded-md text-base text-emerald-600"
          aria-label="Complete selected"
        >
          ✓
        </button>
        <button
          type="button"
          onClick={onTag}
          className="flex h-10 w-10 items-center justify-center rounded-md text-base text-[var(--fg)]"
          aria-label="Tag selected"
        >
          🏷
        </button>
        <button
          type="button"
          onClick={onDelete}
          className="flex h-10 w-10 items-center justify-center rounded-md text-base text-red-500"
          aria-label="Delete selected"
        >
          🗑
        </button>
      </div>
    </div>
  );
}
