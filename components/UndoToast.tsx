"use client";

import { useEffect, useMemo, useState } from "react";

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

  useEffect(() => {
    if (!undo) return;
    const interval = window.setInterval(() => setNow(Date.now()), 250);
    return () => window.clearInterval(interval);
  }, [undo]);

  const remainingMs = useMemo(() => {
    if (!undo) return 0;
    return Math.max(0, undo.expiresAt - now);
  }, [undo, now]);

  useEffect(() => {
    if (!undo) return;
    const timeout = window.setTimeout(() => clearUndo(), Math.max(0, undo.expiresAt - Date.now()));
    return () => window.clearTimeout(timeout);
  }, [undo, clearUndo]);

  if (!undo) return null;

  return (
    <div className="fixed bottom-16 left-3 z-50">
      <div className="flex items-center gap-2 rounded-md border border-[var(--border)] bg-[var(--surface)] px-3 py-2 text-sm">
        <span className="text-[var(--muted)]">Deleted</span>
        <span className="text-[11px] text-[var(--muted-2)]">{formatMs(remainingMs)}</span>
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
