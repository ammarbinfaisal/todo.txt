"use client";

import type { MouseEvent } from "react";
import type { Todo } from "@/types/todo";
import { useSwipeRow } from "@/hooks/useSwipeRow";
import { PriorityBadge } from "@/components/PriorityBadge";
import { useProjectStore } from "@/stores/project-store";
import { bump } from "@/lib/haptics";

export function TodoItem({
  todo,
  selected,
  selectMode,
  onTap,
  onLongPress,
  onToggle,
  onToggleSelect,
  onEditProjectDot,
}: {
  todo: Todo;
  selected: boolean;
  selectMode: boolean;
  onTap: (e: { clientX: number; clientY: number }) => void;
  onLongPress: () => void;
  onToggle: () => void;
  onToggleSelect: () => void;
  onEditProjectDot: (name: string, e: MouseEvent) => void;
}) {
  const getConfig = useProjectStore((s) => s.getConfig);

  const swipe = useSwipeRow({
    onSwipeRight: () => {
      bump();
      onToggle();
    },
  });

  const hasProjects = todo.projects.length > 0;
  const visibleDots = todo.projects.slice(0, 3);
  const overflow = todo.projects.length - 3;

  // Long press detection
  const longPressTimer = { current: null as ReturnType<typeof setTimeout> | null };

  const handlePointerDown = (e: React.PointerEvent) => {
    // Let swipe handler also get the event
    swipe.bind.onPointerDown(e);
    longPressTimer.current = setTimeout(() => {
      onLongPress();
    }, 300);
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    swipe.bind.onPointerMove(e);
    // Cancel long press if user moves
    if (longPressTimer.current && Math.abs(e.movementX) + Math.abs(e.movementY) > 4) {
      clearTimeout(longPressTimer.current);
      longPressTimer.current = null;
    }
  };

  const handlePointerUp = () => {
    if (longPressTimer.current) {
      clearTimeout(longPressTimer.current);
      longPressTimer.current = null;
    }
    swipe.bind.onPointerUp();
  };

  const handlePointerCancel = () => {
    if (longPressTimer.current) {
      clearTimeout(longPressTimer.current);
      longPressTimer.current = null;
    }
    swipe.bind.onPointerCancel();
  };

  const handleRowClick = (e: React.MouseEvent) => {
    // swipe's click capture might stop this
    swipe.bind.onClickCapture(e);
    if (e.defaultPrevented) return;

    if (selectMode) {
      onToggleSelect();
      return;
    }
    onTap(e);
  };

  return (
    <li
      className={[
        "relative overflow-hidden",
        todo.completed ? "opacity-70" : "",
        selected ? "bg-[var(--primary)]/5" : "",
      ]
        .filter(Boolean)
        .join(" ")}
    >
      {/* Swipe reveal: right = green complete */}
      <div className="absolute inset-0 flex">
        <div className="flex w-full items-center bg-emerald-500/15 px-4 text-base text-emerald-700">
          <span className="select-none">✓</span>
        </div>
      </div>

      <div
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerCancel}
        onClick={handleRowClick}
        style={{
          transform: `translateX(${swipe.x}px)`,
          transition: swipe.active ? undefined : "transform 150ms ease-out",
        }}
        className="relative flex items-center gap-1.5 border-b border-[var(--border)] bg-[var(--bg)] px-2 py-1.5 md:gap-2 md:px-3"
      >
        {/* Checkbox / select indicator */}
        {selectMode ? (
          <div
            className={[
              "flex h-8 w-8 shrink-0 items-center justify-center rounded-full border md:h-10 md:w-10",
              selected
                ? "border-[var(--primary)] bg-[var(--primary)] text-[var(--primary-fg)]"
                : "border-[var(--border)] bg-[var(--surface)]",
            ].join(" ")}
          >
            {selected ? "✓" : ""}
          </div>
        ) : (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              bump();
              onToggle();
            }}
            className={[
              "h-8 w-8 shrink-0 rounded-full border md:h-10 md:w-10",
              "grid place-items-center text-sm",
              todo.completed
                ? "border-[var(--primary)] bg-[var(--primary)] text-[var(--primary-fg)]"
                : "border-[var(--border)] bg-[var(--surface)] text-[var(--muted)]",
            ].join(" ")}
            aria-label={
              todo.completed ? "Mark as not completed" : "Mark as completed"
            }
          >
            {todo.completed ? "✓" : "○"}
          </button>
        )}

        {/* Text */}
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-1.5">
            <PriorityBadge priority={todo.priority} />
            <span
              className={[
                "min-w-0 truncate whitespace-nowrap text-base leading-6",
                todo.completed ? "line-through text-[var(--muted)]" : "",
              ].join(" ")}
            >
              {todo.text || todo.line}
            </span>
          </div>
        </div>

        {/* Emoji dots (right-aligned) */}
        {hasProjects && (
          <div className="flex shrink-0 items-center gap-0.5">
            {visibleDots.map((p) => {
              const config = getConfig(p);
              return (
                <button
                  key={p}
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onEditProjectDot(p, e);
                  }}
                  className="flex h-7 w-7 items-center justify-center rounded-full text-sm"
                  style={{ backgroundColor: `${config.color}20` }}
                  aria-label={`Edit project ${p}`}
                  title={p}
                >
                  {config.emoji}
                </button>
              );
            })}
            {overflow > 0 && (
              <span className="text-xs text-[var(--muted)]">+{overflow}</span>
            )}
          </div>
        )}
      </div>
    </li>
  );
}
