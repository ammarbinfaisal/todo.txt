"use client";

import { useCallback, useRef } from "react";
import type { MouseEvent } from "react";
import { CalendarClock, Check, Circle, Clock, Pencil, Tag, Trash2 } from "lucide-react";
import type { Todo, TodoMeta } from "@/types/todo";
import { useSwipeRow } from "@/hooks/useSwipeRow";
import { PriorityBadge } from "@/components/PriorityBadge";
import { useProjectStore } from "@/stores/project-store";
import { bump } from "@/lib/haptics";
import type { SwipeAction } from "@/types/settings";

const DAY_MS = 86_400_000;

function parseDateLocal(iso: string): Date | null {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(iso);
  if (!m) return null;
  const d = new Date(Number(m[1]), Number(m[2]) - 1, Number(m[3]));
  return Number.isNaN(d.getTime()) ? null : d;
}

function formatRelativeDay(iso: string): { label: string; overdue: boolean } | null {
  const target = parseDateLocal(iso);
  if (!target) return null;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const diffDays = Math.round((target.getTime() - today.getTime()) / DAY_MS);
  if (diffDays < 0) {
    const n = -diffDays;
    return { label: n === 1 ? "overdue 1d" : `overdue ${n}d`, overdue: true };
  }
  if (diffDays === 0) return { label: "today", overdue: false };
  if (diffDays === 1) return { label: "tomorrow", overdue: false };
  if (diffDays < 7) return { label: `in ${diffDays}d`, overdue: false };
  return { label: iso, overdue: false };
}

function MetaLine({ contexts, meta }: { contexts: string[]; meta: TodoMeta }) {
  const due = meta.due ? formatRelativeDay(meta.due) : null;
  const threshold = meta.t ? formatRelativeDay(meta.t) : null;
  const otherMeta = Object.entries(meta).filter(([k]) => k !== "due" && k !== "t");

  return (
    <div className="mt-0.5 flex min-w-0 items-center gap-2 truncate text-xs leading-4 text-[var(--muted)]">
      {due && (
        <span
          className={[
            "inline-flex items-center gap-1",
            due.overdue ? "text-[var(--priority-a)]" : "",
          ].join(" ")}
        >
          <Clock size={11} />
          {due.label}
        </span>
      )}
      {threshold && (
        <span className="inline-flex items-center gap-1">
          <CalendarClock size={11} />
          {threshold.label}
        </span>
      )}
      {contexts.length > 0 && (
        <span className="truncate">
          {contexts.map((c) => `@${c}`).join(" ")}
        </span>
      )}
      {otherMeta.length > 0 && (
        <span className="truncate">
          {otherMeta.map(([k, v]) => `${k}:${v}`).join(" ")}
        </span>
      )}
    </div>
  );
}

const SWIPE_REVEAL: Record<SwipeAction, { bg: string; fg: string; icon: typeof Check }> = {
  complete: { bg: "bg-emerald-500/15", fg: "text-emerald-700", icon: Check },
  delete: { bg: "bg-red-500/15", fg: "text-red-600", icon: Trash2 },
  edit: { bg: "bg-blue-500/15", fg: "text-blue-600", icon: Pencil },
  tag: { bg: "bg-violet-500/15", fg: "text-violet-600", icon: Tag },
  none: { bg: "", fg: "", icon: Check },
};

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
  onSwipeLeft,
  onSwipeRight,
  swipeLeftAction,
  swipeRightAction,
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
  onSwipeLeft?: () => void;
  onSwipeRight?: () => void;
  swipeLeftAction: SwipeAction;
  swipeRightAction: SwipeAction;
}) {
  const getConfig = useProjectStore((s) => s.getConfig);

  const swipe = useSwipeRow({
    onSwipeRight: onSwipeRight
      ? () => { bump(); onSwipeRight(); }
      : undefined,
    onSwipeLeft: onSwipeLeft
      ? () => { bump(); onSwipeLeft(); }
      : undefined,
  });

  const hasProjects = todo.projects.length > 0;
  const visibleDots = todo.projects.slice(0, 3);
  const overflow = todo.projects.length - 3;

  // Long press detection with proper tap suppression
  const longPressTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const longPressFired = useRef(false);
  const pressStart = useRef<{ x: number; y: number } | null>(null);

  const cancelLongPress = () => {
    if (longPressTimer.current) {
      clearTimeout(longPressTimer.current);
      longPressTimer.current = null;
    }
  };

  const handlePointerDown = (e: React.PointerEvent) => {
    if (editing) return; // Don't start swipe/longpress while editing
    swipe.bind.onPointerDown(e);
    longPressFired.current = false;
    pressStart.current = { x: e.clientX, y: e.clientY };
    longPressTimer.current = setTimeout(() => {
      longPressFired.current = true;
      longPressTimer.current = null;
      onLongPress();
    }, 400);
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (editing) return;
    swipe.bind.onPointerMove(e);
    // Cancel long-press as soon as cumulative movement crosses the slop threshold.
    // movementX/Y is per-event delta and underreports slow drags; use absolute distance instead.
    if (longPressTimer.current && pressStart.current) {
      const dx = e.clientX - pressStart.current.x;
      const dy = e.clientY - pressStart.current.y;
      if (dx * dx + dy * dy > 64) cancelLongPress(); // 8px radius
    }
  };

  const handlePointerUp = () => {
    if (editing) return;
    cancelLongPress();
    pressStart.current = null;
    swipe.bind.onPointerUp();
  };

  const handlePointerCancel = () => {
    cancelLongPress();
    pressStart.current = null;
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
      {/* Swipe reveal — right swipe (left side) */}
      {swipeRightAction !== "none" && (() => {
        const r = SWIPE_REVEAL[swipeRightAction];
        const Icon = r.icon;
        return (
          <div className={`absolute inset-y-0 left-0 right-1/2 flex items-center px-4 ${r.bg} ${r.fg}`}>
            <Icon size={18} />
          </div>
        );
      })()}
      {/* Swipe reveal — left swipe (right side) */}
      {swipeLeftAction !== "none" && (() => {
        const r = SWIPE_REVEAL[swipeLeftAction];
        const Icon = r.icon;
        return (
          <div className={`absolute inset-y-0 left-1/2 right-0 flex items-center justify-end px-4 ${r.bg} ${r.fg}`}>
            <Icon size={18} />
          </div>
        );
      })()}

      <div
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerCancel}
        onClick={handleRowClick}
        style={{
          transform: `translateX(${swipe.x}px)`,
          transition: swipe.active ? undefined : "transform 150ms ease-out",
          touchAction: "pan-y",
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
                onBlur={() => onEditSave()}
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
            <>
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
              {!todo.completed &&
                (todo.contexts.length > 0 || Object.keys(todo.meta).length > 0) && (
                  <MetaLine contexts={todo.contexts} meta={todo.meta} />
                )}
            </>
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
