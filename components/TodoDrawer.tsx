"use client";

import { useEffect, useMemo } from "react";

import type { Todo } from "@/types/todo";

function firstLine(text: string) {
  const idx = text.indexOf("\n");
  return idx === -1 ? text : text.slice(0, idx);
}

export function TodoDrawer({
  open,
  todo,
  draft,
  onDraftChange,
  onClose,
  onSaveLine,
  onCopyLine
}: {
  open: boolean;
  todo?: Todo;
  draft: string;
  onDraftChange: (value: string) => void;
  onClose: () => void;
  onSaveLine: (line: string) => Promise<void>;
  onCopyLine: (line: string) => Promise<void>;
}) {
  useEffect(() => {
    if (!open) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open, onClose]);

  const chips = useMemo(() => {
    if (!todo) return [];
    const out: { key: string; label: string }[] = [];
    for (const p of todo.projects) out.push({ key: `p:${p}`, label: `+${p}` });
    for (const c of todo.contexts) out.push({ key: `c:${c}`, label: `@${c}` });
    for (const [k, v] of Object.entries(todo.meta)) out.push({ key: `m:${k}`, label: `${k}:${v}` });
    return out;
  }, [todo]);

  return (
    <>
      <div
        className={[
          "absolute inset-0 z-20 bg-black/0 transition-opacity",
          open ? "pointer-events-auto opacity-100" : "pointer-events-none opacity-0"
        ].join(" ")}
        onClick={onClose}
        aria-hidden="true"
      />

      <aside
        className={[
          "absolute left-0 top-0 z-30 h-full w-[var(--drawer-w)] border-r border-[var(--border)] bg-[var(--surface)] transition-transform duration-200",
          open ? "translate-x-0" : "-translate-x-full"
        ].join(" ")}
        aria-label="Todo details"
      >
        <div className="flex h-full flex-col">
          <div className="flex items-center justify-between gap-2 border-b border-[var(--border)] px-3 py-2">
            <div className="min-w-0">
              <div className="truncate text-sm font-semibold">{todo ? firstLine(todo.text || todo.line) : "Todo"}</div>
              <div className="text-[11px] text-[var(--muted)]">Tap outside to discard</div>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="h-10 w-10 rounded-md border border-[var(--border)] text-sm text-[var(--muted)]"
              aria-label="Close"
              title="Close"
            >
              ✕
            </button>
          </div>

          <div className="flex-1 overflow-auto px-3 py-3">
            <label className="text-[11px] text-[var(--muted)]">todo.txt line</label>
            <textarea
              value={draft}
              onChange={(e) => onDraftChange(e.target.value)}
              rows={3}
              className={[
                "mt-1 w-full resize-none rounded-md border px-2 py-2 text-sm leading-5",
                "border-[var(--border)] bg-[var(--surface)] text-[var(--fg)]"
              ].join(" ")}
            />

            <div className="mt-3 flex flex-wrap gap-1">
              {chips.map((chip) => (
                <span
                  key={chip.key}
                  className="rounded bg-[var(--chip)] px-1.5 py-0.5 text-[11px] text-[var(--chip-fg)]"
                >
                  {chip.label}
                </span>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-2 border-t border-[var(--border)] px-3 py-2">
            <button
              type="button"
              onClick={() => void onCopyLine(draft.trim() || "")}
              className="h-10 flex-1 rounded-md border border-[var(--border)] text-sm text-[var(--fg)]"
              aria-label="Copy todo line"
            >
              Copy
            </button>
            <button
              type="button"
              onClick={async () => {
                const value = draft.trim();
                if (!todo || !value) return;
                await onSaveLine(value);
              }}
              className="h-10 flex-1 rounded-md bg-[var(--primary)] text-sm font-semibold text-[var(--primary-fg)]"
              aria-label="Save changes"
            >
              Save
            </button>
          </div>
        </div>
      </aside>
    </>
  );
}
