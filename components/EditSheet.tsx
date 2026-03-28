"use client";

import { useCallback, useMemo, useRef, useState } from "react";
import type { Todo } from "@/types/todo";
import { useEscapeKey } from "@/hooks/useEscapeKey";

export function EditSheet({
  open,
  todo,
  onSave,
  onCopy,
  onClose,
}: {
  open: boolean;
  todo?: Todo;
  onSave: (line: string) => void;
  onCopy: (line: string) => void;
  onClose: () => void;
}) {
  const [draft, setDraft] = useState("");
  const prevTodoId = useRef<string | undefined>(undefined);

  // Sync draft from todo when the sheet opens for a new todo
  if (open && todo && todo.id !== prevTodoId.current) {
    setDraft(todo.line);
    prevTodoId.current = todo.id;
  } else if (!open && prevTodoId.current !== undefined) {
    prevTodoId.current = undefined;
  }

  // Auto-focus textarea via ref callback
  const textareaRef = useCallback(
    (node: HTMLTextAreaElement | null) => {
      if (node && open) {
        requestAnimationFrame(() => node.focus());
      }
    },
    [open]
  );

  const handleClose = useCallback(() => {
    if (open) onClose();
  }, [open, onClose]);

  useEscapeKey(handleClose);

  const chips = useMemo(() => {
    if (!todo) return [];
    const out: { key: string; label: string }[] = [];
    for (const p of todo.projects) out.push({ key: `p:${p}`, label: `+${p}` });
    for (const c of todo.contexts) out.push({ key: `c:${c}`, label: `@${c}` });
    for (const [k, v] of Object.entries(todo.meta))
      out.push({ key: `m:${k}`, label: `${k}:${v}` });
    return out;
  }, [todo]);

  return (
    <>
      {/* Backdrop */}
      <div
        className={[
          "fixed inset-0 z-[90] bg-black/30 transition-opacity duration-200",
          open ? "opacity-100" : "pointer-events-none opacity-0",
        ].join(" ")}
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Sheet */}
      <div
        className={[
          "fixed inset-x-0 bottom-0 z-[91] max-h-[70vh] rounded-t-xl border-t border-[var(--border)] bg-[var(--surface)] transition-transform duration-200",
          open ? "translate-y-0" : "translate-y-full",
        ].join(" ")}
        role="dialog"
        aria-label="Edit todo"
      >
        {/* Drag handle */}
        <div className="flex justify-center py-2">
          <div className="h-1 w-10 rounded-full bg-[var(--border)]" />
        </div>

        <div className="px-3 pb-3">
          <label className="text-xs text-[var(--muted)]">todo.txt line</label>
          <textarea
            ref={textareaRef}
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            rows={3}
            className="mt-1 w-full resize-none rounded-md border border-[var(--border)] bg-[var(--bg)] px-2.5 py-2 text-base leading-6 text-[var(--fg)]"
          />

          {chips.length > 0 && (
            <div className="mt-2 flex flex-wrap gap-1">
              {chips.map((chip) => (
                <span
                  key={chip.key}
                  className="rounded bg-[var(--chip)] px-1.5 py-0.5 text-xs text-[var(--chip-fg)]"
                >
                  {chip.label}
                </span>
              ))}
            </div>
          )}

          <div className="mt-3 flex items-center gap-2">
            <button
              type="button"
              onClick={() => onCopy(draft.trim())}
              className="h-10 flex-1 rounded-md border border-[var(--border)] text-sm text-[var(--fg)]"
              aria-label="Copy todo line"
            >
              Copy
            </button>
            <button
              type="button"
              onClick={() => {
                const trimmed = draft.trim();
                if (trimmed) onSave(trimmed);
              }}
              className="h-10 flex-1 rounded-md bg-[var(--primary)] text-sm font-semibold text-[var(--primary-fg)]"
              aria-label="Save changes"
            >
              Save
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
