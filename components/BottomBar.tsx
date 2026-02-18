"use client";

import { useEffect, useRef } from "react";

export function BottomBar({
  input,
  onInputChange,
  onAdd,
  onCopyAll,
  onDownloadAll
}: {
  input: string;
  onInputChange: (value: string) => void;
  onAdd: () => Promise<void>;
  onCopyAll: () => Promise<void>;
  onDownloadAll: () => void;
}) {
  const inputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        inputRef.current?.focus();
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  return (
    <footer className="sticky bottom-0 z-10 border-t border-[var(--border)] bg-[var(--surface)] px-3 py-2">
      <form
        className="flex items-center gap-2"
        onSubmit={async (e) => {
          e.preventDefault();
          await onAdd();
        }}
      >
        <button
          type="button"
          onClick={() => void onCopyAll()}
          className="h-11 w-11 rounded-md border border-[var(--border)] text-sm text-[var(--muted)]"
          aria-label="Copy all todos as todo.txt"
          title="Copy all"
        >
          ⧉
        </button>
        <button
          type="button"
          onClick={onDownloadAll}
          className="h-11 w-11 rounded-md border border-[var(--border)] text-sm text-[var(--muted)]"
          aria-label="Download todo.txt"
          title="Download"
        >
          ⇩
        </button>

        <input
          ref={inputRef}
          value={input}
          onChange={(e) => onInputChange(e.target.value)}
          placeholder='Add todo.txt (e.g. "(A) Call dentist +Health due:2026-03-15")'
          className={[
            "h-11 flex-1 rounded-md border px-3 text-sm",
            "border-[var(--border)] bg-[var(--surface)] text-[var(--fg)] placeholder:text-[var(--muted)]"
          ].join(" ")}
        />
        <button
          type="submit"
          className="h-11 w-16 rounded-md bg-[var(--primary)] text-sm font-semibold text-[var(--primary-fg)]"
        >
          +
        </button>
      </form>
    </footer>
  );
}

