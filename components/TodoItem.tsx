"use client";

import type { Todo } from "@/types/todo";
import { useSwipeRow } from "@/hooks/useSwipeRow";
import { PriorityBadge } from "@/components/PriorityBadge";

const TAG_COLORS = [
  { bg: "bg-blue-500/15", fg: "text-blue-600" },
  { bg: "bg-emerald-500/15", fg: "text-emerald-600" },
  { bg: "bg-violet-500/15", fg: "text-violet-600" },
  { bg: "bg-amber-500/15", fg: "text-amber-700" },
  { bg: "bg-rose-500/15", fg: "text-rose-600" },
  { bg: "bg-cyan-500/15", fg: "text-cyan-600" },
  { bg: "bg-fuchsia-500/15", fg: "text-fuchsia-600" },
  { bg: "bg-lime-500/15", fg: "text-lime-700" },
];

function hashIndex(str: string, len: number) {
  let h = 0;
  for (let i = 0; i < str.length; i++) h = (h * 31 + str.charCodeAt(i)) | 0;
  return ((h % len) + len) % len;
}

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

  const hasChips = todo.projects.length > 0 || todo.contexts.length > 0;

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
        className="relative flex items-start gap-1.5 border-b border-[var(--border)] bg-[var(--bg)] px-2 py-1 md:gap-2 md:px-3 md:py-1.5"
      >
        <button
          type="button"
          onClick={onToggle}
          className={[
            "mt-0.5 h-7 w-7 shrink-0 rounded-full border md:mt-0 md:h-10 md:w-10",
            "grid place-items-center text-[11px] md:text-sm",
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
          <div className="flex items-center gap-1.5">
            <PriorityBadge priority={todo.priority} />
            <span
              className={[
                "min-w-0 truncate whitespace-nowrap text-[13px] leading-5 md:text-sm",
                todo.completed ? "line-through text-[var(--muted)]" : ""
              ].join(" ")}
            >
              {todo.text || todo.line}
            </span>
          </div>
          {hasChips && (
            <div className="mt-0.5 flex flex-wrap gap-1">
              {todo.projects.map((p) => {
                const c = TAG_COLORS[hashIndex(p, TAG_COLORS.length)];
                return (
                  <span
                    key={`p:${p}`}
                    className={`inline-flex items-center rounded px-1 py-px text-[10px] font-medium leading-4 ${c.bg} ${c.fg}`}
                  >
                    +{p}
                  </span>
                );
              })}
              {todo.contexts.map((ctx) => (
                <span
                  key={`c:${ctx}`}
                  className="inline-flex items-center rounded bg-neutral-500/10 px-1 py-px text-[10px] font-medium leading-4 text-[var(--muted)]"
                >
                  @{ctx}
                </span>
              ))}
            </div>
          )}
        </button>
      </div>
    </li>
  );
}
