"use client";

import { useCallback, useRef, useState } from "react";

import { useTodoStore } from "@/stores/todo-store";

function formatMs(ms: number) {
  const seconds = Math.max(0, Math.ceil(ms / 1000));
  return `${seconds}s`;
}

export function UndoToast() {
  const undo = useTodoStore((s) => s.undo);
  const undoRemove = useTodoStore((s) => s.undoRemove);
  const clearUndo = useTodoStore((s) => s.clearUndo);

  const [now, setNow] = useState(() => Date.now());
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const trackedUndoId = useRef<string | null>(null);

  // Manage timers by comparing current undo to previously tracked undo
  // This replaces two useEffects with synchronous render-time logic
  const undoId = undo?.todo.id ?? null;

  if (undoId !== trackedUndoId.current) {
    // Clean up previous timers
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }

    trackedUndoId.current = undoId;

    if (undo) {
      // Start countdown interval
      intervalRef.current = setInterval(() => setNow(Date.now()), 250);
      // Schedule auto-clear
      const remaining = Math.max(0, undo.expiresAt - Date.now());
      timeoutRef.current = setTimeout(() => clearUndo(), remaining);
    }
  }

  const remainingMs = undo ? Math.max(0, undo.expiresAt - now) : 0;

  if (!undo) return null;

  return (
    <div className="fixed bottom-16 left-3 z-50">
      <div className="flex items-center gap-2 rounded-md border border-[var(--border)] bg-[var(--surface)] px-3 py-2 text-sm">
        <span className="text-[var(--muted)]">Deleted</span>
        <span className="text-[11px] text-[var(--muted-2)]">
          {formatMs(remainingMs)}
        </span>
        <button
          type="button"
          onClick={() => void undoRemove()}
          className="rounded px-2 py-1 text-[var(--fg)]"
          aria-label="Undo delete"
        >
          Undo
        </button>
      </div>
    </div>
  );
}
