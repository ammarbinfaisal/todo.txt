"use client";

import { useMemo, useState } from "react";

import type { Todo } from "@/types/todo";
import { PriorityBadge } from "./PriorityBadge";

function metaChips(todo: Todo): { key: string; label: string }[] {
  const chips: { key: string; label: string }[] = [];
  for (const p of todo.projects) chips.push({ key: `p:${p}`, label: `+${p}` });
  for (const c of todo.contexts) chips.push({ key: `c:${c}`, label: `@${c}` });
  if (todo.meta.due) chips.push({ key: "due", label: `due:${todo.meta.due}` });
  if (todo.meta.tag) chips.push({ key: "tag", label: `tag:${todo.meta.tag}` });
  return chips.slice(0, 4);
}

export function TodoItem({
  todo,
  onToggle,
  onDelete,
  onUpdateLine
}: {
  todo: Todo;
  onToggle: () => void;
  onDelete: () => void;
  onUpdateLine: (line: string) => void;
}) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(todo.line);

  const chips = useMemo(() => metaChips(todo), [todo]);

  return (
    <li
      className={[
        "flex gap-2 border-b border-neutral-100 px-4 py-2 dark:border-neutral-900",
        todo.completed ? "opacity-75" : ""
      ].join(" ")}
    >
      <button
        type="button"
        onClick={onToggle}
        className={[
          "mt-0.5 h-10 w-10 shrink-0 rounded-full border",
          "grid place-items-center",
          todo.completed
            ? "border-neutral-900 bg-neutral-900 text-white dark:border-neutral-50 dark:bg-neutral-50 dark:text-neutral-950"
            : "border-neutral-300 bg-white text-neutral-700 dark:border-neutral-700 dark:bg-neutral-950 dark:text-neutral-200"
        ].join(" ")}
        aria-label={todo.completed ? "Mark as not completed" : "Mark as completed"}
      >
        {todo.completed ? "✓" : "○"}
      </button>

      <div className="min-w-0 flex-1">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <PriorityBadge priority={todo.priority} />
              {!editing ? (
                <button
                  type="button"
                  className={[
                    "min-w-0 text-left text-sm leading-5",
                    todo.completed ? "line-through text-neutral-500 dark:text-neutral-400" : ""
                  ].join(" ")}
                  onClick={() => {
                    setDraft(todo.line);
                    setEditing(true);
                  }}
                >
                  <span className="truncate">{todo.text || todo.line}</span>
                </button>
              ) : (
                <input
                  value={draft}
                  onChange={(e) => setDraft(e.target.value)}
                  onBlur={() => {
                    setEditing(false);
                    if (draft.trim() && draft.trim() !== todo.line) onUpdateLine(draft);
                  }}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      (e.currentTarget as HTMLInputElement).blur();
                    }
                    if (e.key === "Escape") {
                      setDraft(todo.line);
                      setEditing(false);
                    }
                  }}
                  autoFocus
                  className={[
                    "h-9 w-full rounded-md border px-2 text-sm",
                    "border-neutral-300 bg-white text-neutral-950",
                    "dark:border-neutral-700 dark:bg-neutral-950 dark:text-neutral-50"
                  ].join(" ")}
                />
              )}
            </div>

            {chips.length > 0 && (
              <div className="mt-1 flex flex-wrap gap-1">
                {chips.map((chip) => (
                  <span
                    key={chip.key}
                    className="rounded bg-neutral-100 px-1.5 py-0.5 text-[11px] text-neutral-700 dark:bg-neutral-900 dark:text-neutral-200"
                  >
                    {chip.label}
                  </span>
                ))}
              </div>
            )}
          </div>

          <button
            type="button"
            onClick={() => {
              if (confirm("Delete this todo?")) onDelete();
            }}
            className="h-10 w-10 shrink-0 rounded-md border border-neutral-200 text-xs text-neutral-600 dark:border-neutral-800 dark:text-neutral-300"
            aria-label="Delete todo"
            title="Delete"
          >
            🗑
          </button>
        </div>
      </div>
    </li>
  );
}
