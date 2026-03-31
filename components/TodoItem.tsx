"use client";

import { useCallback, useRef, useState } from "react";
import type { MouseEvent } from "react";
import { Check, Circle } from "lucide-react";
import type { Todo } from "@/types/todo";
import { useSwipeRow } from "@/hooks/useSwipeRow";
import { PriorityBadge } from "@/components/PriorityBadge";
import { useProjectStore } from "@/stores/project-store";
import { bump } from "@/lib/haptics";

export function TodoItem({
  todo,
  selected,
  selectMode,
  editing,
  editDraft,
  onTap,
  onLongPress,
  onToggle,
  onToggleSelect,
  onEditProjectDot,
  onEditChange,
  onEditSave,
  onEditCancel,
}: {
  todo: Todo;
  selected: boolean;
  selectMode: boolean;
  editing: boolean;
  editDraft: string;
  onTap: (e: { clientX: number; clientY: number }) => void;
  onLongPress: () => void;
  onToggle: () => void;
  onToggleSelect: () => void;
  onEditProjectDot: (name: string, e: MouseEvent) => void;
  onEditChange: (value: string) => void;
  onEditSave: () => void;
  onEditCancel: () => void;
}) {
  const configs = useProjectStore((s) => s.configs);
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

  // Long press detection with proper tap suppression
  const longPressTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const longPressFired = useRef(false);

  const handlePointerDown = (e: React.PointerEvent) => {
    if (editing) return; // Don't start swipe/longpress while editing
    swipe.bind.onPointerDown(e);
    longPressFired.current = false;
    longPressTimer.current = setTimeout(() => {
      longPressFired.current = true;
      onLongPress();
    }, 300);
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (editing) return;
    swipe.bind.onPointerMove(e);
    if (longPressTimer.current && Math.abs(e.movementX) + Math.abs(e.movementY) > 4) {
      clearTimeout(longPressTimer.current);
      longPressTimer.current = null;
    }
  };

  const handlePointerUp = () => {
    if (editing) return;
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
    if (editing) return; // Don't open arc menu or select while editing
    swipe.bind.onClickCapture(e);
    if (e.defaultPrevented) return;

    if (longPressFired.current) {
      longPressFired.current = false;
      return;
    }

    if (selectMode) {
      onToggleSelect();
      return;
    }
    onTap(e);
  };

  // Auto-focus the edit input via ref callback
  const editInputRef = useCallback(
    (node: HTMLInputElement | null) => {
      if (node && editing) {
        requestAnimationFrame(() => {
          node.focus();
          node.setSelectionRange(node.value.length, node.value.length);
        });
      }
    },
    [editing]
  );

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
      {/* Swipe reveal */}
      <div className="absolute inset-0 flex">
        <div className="flex w-full items-center bg-emerald-500/15 px-4 text-emerald-700">
          <Check size={18} />
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
        className={[
          "relative flex items-center gap-1.5 bg-[var(--bg)] px-2 py-1.5 md:gap-2 md:px-3",
          editing
            ? "border-l-2 border-l-[var(--primary)] border-b border-b-[var(--border)]"
            : "border-b border-[var(--border)]",
        ].join(" ")}
      >
        {/* Checkbox / select indicator */}
        {selectMode ? (
          <div
            className={[
              "h-8 w-8 shrink-0 rounded-full border md:h-10 md:w-10",
              selected
                ? "border-[var(--primary)] bg-[var(--primary)]/10"
                : "border-[var(--border)] bg-[var(--surface)]",
            ].join(" ")}
          />
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
              "grid place-items-center",
              todo.completed
                ? "border-[var(--primary)] bg-[var(--primary)] text-[var(--primary-fg)]"
                : "border-[var(--border)] bg-[var(--surface)] text-[var(--muted)]",
            ].join(" ")}
            aria-label={
              todo.completed ? "Mark as not completed" : "Mark as completed"
            }
          >
            {todo.completed ? <Check size={14} /> : <Circle size={14} />}
          </button>
        )}

        {/* Text or edit input */}
        <div className="min-w-0 flex-1">
          {editing ? (
            <form
              onSubmit={(e) => {
                e.preventDefault();
                e.stopPropagation();
                onEditSave();
              }}
              onClick={(e) => e.stopPropagation()}
            >
              <input
                ref={editInputRef}
                value={editDraft}
                enterKeyHint="done"
                onChange={(e) => onEditChange(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Escape") {
                    e.preventDefault();
                    e.stopPropagation();
                    onEditCancel();
                  }
                }}
                className="w-full bg-transparent text-base leading-6 text-[var(--fg)] outline-none"
              />
            </form>
          ) : (
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
          )}
        </div>

        {/* Project dots (right-aligned) */}
        {hasProjects && !editing && (
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
                  className="flex h-7 w-7 items-center justify-center rounded-full text-[11px] font-bold"
                  style={{
                    backgroundColor: `${config.color}20`,
                    color: config.color,
                  }}
                  aria-label={`Edit project ${p}`}
                  title={p}
                >
                  {p.charAt(0).toUpperCase()}
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
