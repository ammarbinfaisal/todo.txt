"use client";

import { useMemo, useRef, useState } from "react";
import { Plus, Undo2, Redo2 } from "lucide-react";
import { useMountEffect } from "@/hooks/useMountEffect";
import { useProjectStore } from "@/stores/project-store";
import { useSettingsStore } from "@/stores/settings-store";
import { matchesShortcut } from "@/types/settings";

export function BottomBar({
  input,
  onInputChange,
  onAdd,
  onUndo,
  onRedo,
  canUndo,
  canRedo,
  undoLabel,
  redoLabel,
  hidden,
}: {
  input: string;
  onInputChange: (value: string) => void;
  onAdd: () => Promise<void>;
  onUndo: () => void;
  onRedo: () => void;
  canUndo: boolean;
  canRedo: boolean;
  undoLabel?: string;
  redoLabel?: string;
  hidden?: boolean;
}) {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const onUndoRef = useRef(onUndo);
  const onRedoRef = useRef(onRedo);
  const onAddRef = useRef(onAdd);
  onUndoRef.current = onUndo;
  onRedoRef.current = onRedo;
  onAddRef.current = onAdd;

  const configs = useProjectStore((s) => s.configs);
  const projectPrefix = useSettingsStore((s) => s.projectPrefix);
  const [ghostAccepted, setGhostAccepted] = useState(false);

  useMountEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      const shortcuts = useSettingsStore.getState().shortcuts;
      const tag = (e.target as HTMLElement)?.tagName;
      const isEditable = tag === "INPUT" || tag === "TEXTAREA" || (e.target as HTMLElement)?.isContentEditable;

      if (matchesShortcut(e, shortcuts.focusInput)) {
        e.preventDefault();
        inputRef.current?.focus();
        return;
      }
      if (matchesShortcut(e, shortcuts.newTodo)) {
        e.preventDefault();
        inputRef.current?.focus();
        return;
      }
      if (!isEditable) {
        if (matchesShortcut(e, shortcuts.undo)) {
          e.preventDefault();
          onUndoRef.current();
          return;
        }
        if (matchesShortcut(e, shortcuts.redo)) {
          e.preventDefault();
          onRedoRef.current();
          return;
        }
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  });

  // Ghost autocomplete using current project prefix
  const ghost = useMemo(() => {
    const escaped = projectPrefix.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const re = new RegExp(`${escaped}(\\S*)$`);
    const match = input.match(re);
    if (!match) return "";
    const partial = match[1].toLowerCase();
    if (partial.length === 0) return "";
    const allNames = Object.keys(configs);
    const found = allNames
      .filter((n) => n.toLowerCase().startsWith(partial) && n.toLowerCase() !== partial)
      .sort((a, b) => a.length - b.length);
    return found.length > 0 ? found[0].slice(partial.length) : "";
  }, [input, configs, projectPrefix]);

  const acceptGhost = () => {
    if (ghost) {
      onInputChange(input + ghost);
      setGhostAccepted(true);
    }
  };

  if (hidden) return null;

  return (
    <footer className="sticky bottom-0 z-10 border-t border-[var(--border)] bg-[var(--surface)] px-2 py-1.5 md:px-3 md:py-2">
      <form
        className="flex items-center gap-1.5 md:gap-2"
        onSubmit={async (e) => {
          e.preventDefault();
          if (ghost && !ghostAccepted) {
            acceptGhost();
            return;
          }
          setGhostAccepted(false);
          await onAdd();
        }}
      >
        <button
          type="button"
          onClick={onUndo}
          disabled={!canUndo}
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md border border-[var(--border)] text-[var(--muted)] disabled:opacity-30"
          aria-label={undoLabel ?? "Undo"}
          title={undoLabel ?? "Undo"}
        >
          <Undo2 size={16} />
        </button>
        <button
          type="button"
          onClick={onRedo}
          disabled={!canRedo}
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md border border-[var(--border)] text-[var(--muted)] disabled:opacity-30"
          aria-label={redoLabel ?? "Redo"}
          title={redoLabel ?? "Redo"}
        >
          <Redo2 size={16} />
        </button>

        <div className="relative min-w-0 flex-1">
          <input
            ref={inputRef}
            value={input}
            onChange={(e) => {
              onInputChange(e.target.value);
              setGhostAccepted(false);
            }}
            onKeyDown={(e) => {
              // Tab accepts ghost autocomplete
              if (e.key === "Tab" && ghost) {
                e.preventDefault();
                acceptGhost();
              }
            }}
            placeholder="A- Task +Project @ctx"
            className="h-10 w-full rounded-md border border-[var(--border)] bg-[var(--surface)] px-2.5 text-base text-[var(--fg)] placeholder:text-[var(--muted)]"
          />
          {ghost && (
            <div className="pointer-events-none absolute inset-0 flex items-center px-2.5">
              <span className="invisible text-base">{input}</span>
              <span className="text-base text-[var(--muted)]/40">{ghost}</span>
            </div>
          )}
        </div>

        <button
          type="submit"
          className="flex h-10 w-12 shrink-0 items-center justify-center rounded-md bg-[var(--primary)] text-[var(--primary-fg)]"
        >
          <Plus size={20} />
        </button>
      </form>
    </footer>
  );
}
