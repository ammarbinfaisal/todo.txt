"use client";

import { useMemo, useRef, useState } from "react";
import { useMountEffect } from "@/hooks/useMountEffect";
import { useProjectStore } from "@/stores/project-store";

export function BottomBar({
  input,
  onInputChange,
  onAdd,
  onCopyAll,
  onDownloadAll,
  hidden,
}: {
  input: string;
  onInputChange: (value: string) => void;
  onAdd: () => Promise<void>;
  onCopyAll: () => Promise<void>;
  onDownloadAll: () => void;
  hidden?: boolean;
}) {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const configs = useProjectStore((s) => s.configs);
  const [ghostAccepted, setGhostAccepted] = useState(false);

  useMountEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        inputRef.current?.focus();
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  });

  // Find ghost autocomplete for the last +word being typed
  const ghost = useMemo(() => {
    const match = input.match(/\+(\S*)$/);
    if (!match) return "";
    const partial = match[1].toLowerCase();
    if (partial.length === 0) return "";
    const allNames = Object.keys(configs);
    const found = allNames
      .filter((n) => n.toLowerCase().startsWith(partial) && n.toLowerCase() !== partial)
      .sort((a, b) => a.length - b.length);
    return found.length > 0 ? found[0].slice(partial.length) : "";
  }, [input, configs]);

  if (hidden) return null;

  return (
    <footer className="sticky bottom-0 z-10 border-t border-[var(--border)] bg-[var(--surface)] px-2 py-1.5 md:px-3 md:py-2">
      <form
        className="flex items-center gap-1.5 md:gap-2"
        onSubmit={async (e) => {
          e.preventDefault();
          // Double-enter: first accept ghost, then submit
          if (ghost && !ghostAccepted) {
            onInputChange(input + ghost);
            setGhostAccepted(true);
            return;
          }
          setGhostAccepted(false);
          await onAdd();
        }}
      >
        <button
          type="button"
          onClick={() => void onCopyAll()}
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md border border-[var(--border)] text-base text-[var(--muted)]"
          aria-label="Copy all todos"
          title="Copy all"
        >
          ⧉
        </button>
        <button
          type="button"
          onClick={onDownloadAll}
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md border border-[var(--border)] text-base text-[var(--muted)]"
          aria-label="Download todo.txt"
          title="Export"
        >
          ⇩
        </button>

        <div className="relative min-w-0 flex-1">
          <input
            ref={inputRef}
            value={input}
            onChange={(e) => {
              onInputChange(e.target.value);
              setGhostAccepted(false);
            }}
            placeholder="(A) Task +Project @ctx"
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
          className="flex h-10 w-12 shrink-0 items-center justify-center rounded-md bg-[var(--primary)] text-base font-semibold text-[var(--primary-fg)]"
        >
          +
        </button>
      </form>
    </footer>
  );
}
