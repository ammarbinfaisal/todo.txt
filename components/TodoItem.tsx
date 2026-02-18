"use client";

import type { Todo } from "@/types/todo";
import { useSwipeRow } from "@/hooks/useSwipeRow";
import { PriorityBadge } from "@/components/PriorityBadge";

export function TodoItem({
  todo,
  onToggle,
  onDelete,
  onOpen
}: {
  todo: Todo;
  onToggle: () => void;
  onDelete: () => void;
  onOpen: () => void;
}) {
  const swipe = useSwipeRow({
    onSwipeLeft: onDelete,
    onSwipeRight: onToggle
  });

  return (
    <li className={["relative overflow-hidden", todo.completed ? "opacity-80" : ""].join(" ")}>
      <div className="absolute inset-0 flex">
        <div className="flex w-1/2 items-center bg-emerald-500/15 px-3 text-sm text-emerald-700">
          <span className="select-none">✓</span>
        </div>
        <div className="flex w-1/2 items-center justify-end bg-red-500/15 px-3 text-sm text-red-700">
          <span className="select-none">🗑</span>
        </div>
      </div>

      <div
        {...swipe.bind}
        style={{
          transform: `translateX(${swipe.x}px)`,
          transition: swipe.active ? undefined : "transform 150ms ease-out"
        }}
        className="relative flex items-center gap-2 border-b border-[var(--border)] bg-[var(--bg)] px-3 py-1.5"
      >
        <button
          type="button"
          onClick={onToggle}
          className={[
            "h-11 w-11 shrink-0 rounded-full border",
            "grid place-items-center",
            todo.completed
              ? "border-[var(--primary)] bg-[var(--primary)] text-[var(--primary-fg)]"
              : "border-[var(--border)] bg-[var(--surface)] text-[var(--muted)]"
          ].join(" ")}
          aria-label={todo.completed ? "Mark as not completed" : "Mark as completed"}
        >
          {todo.completed ? "✓" : "○"}
        </button>

        <button
          type="button"
          onClick={onOpen}
          className="min-w-0 flex-1 text-left"
          aria-label="Open todo details"
        >
          <div className="flex items-center gap-2">
            <PriorityBadge priority={todo.priority} />
            <span
              className={[
                "min-w-0 truncate whitespace-nowrap text-sm leading-5",
                todo.completed ? "line-through text-[var(--muted)]" : ""
              ].join(" ")}
            >
              {todo.text || todo.line}
            </span>
          </div>
        </button>
      </div>
    </li>
  );
}
