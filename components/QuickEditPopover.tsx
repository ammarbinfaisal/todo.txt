"use client";

import { useEffect, useRef, useState } from "react";
import { Popover } from "@/components/Popover";
import { usePopover } from "@/hooks/usePopover";
import { bump } from "@/lib/haptics";
import type { CSSProperties, RefObject } from "react";

export function QuickEditPopover({
  open,
  initialText,
  onSave,
  onClose,
  onExpand,
  popoverRef,
  style,
}: {
  open: boolean;
  initialText: string;
  onSave: (text: string) => void;
  onClose: () => void;
  onExpand: () => void;
  popoverRef: RefObject<HTMLDivElement | null>;
  style: CSSProperties;
}) {
  const [value, setValue] = useState(initialText);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setValue(initialText);
  }, [initialText]);

  useEffect(() => {
    if (open) {
      requestAnimationFrame(() => inputRef.current?.focus());
    }
  }, [open]);

  return (
    <Popover
      open={open}
      onClose={onClose}
      popoverRef={popoverRef}
      style={style}
      className="w-72 p-2"
    >
      <form
        onSubmit={(e) => {
          e.preventDefault();
          const trimmed = value.trim();
          if (trimmed) {
            bump();
            onSave(trimmed);
          }
        }}
        className="flex gap-1.5"
      >
        <input
          ref={inputRef}
          value={value}
          onChange={(e) => setValue(e.target.value)}
          className="h-9 flex-1 rounded border border-[var(--border)] bg-[var(--bg)] px-2 text-base text-[var(--fg)]"
        />
        <button
          type="submit"
          className="flex h-9 w-9 items-center justify-center rounded bg-[var(--primary)] text-sm text-[var(--primary-fg)]"
          aria-label="Save"
        >
          ✓
        </button>
      </form>
      <button
        type="button"
        onClick={onExpand}
        className="mt-1.5 w-full rounded py-1.5 text-center text-xs text-[var(--muted)] hover:bg-[var(--surface-2)]"
      >
        Full edit ↓
      </button>
    </Popover>
  );
}
