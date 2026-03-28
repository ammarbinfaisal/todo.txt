"use client";

import { useState } from "react";
import { useProjectStore } from "@/stores/project-store";
import { Popover } from "@/components/Popover";
import { usePopover } from "@/hooks/usePopover";
import { bump } from "@/lib/haptics";
import type { CSSProperties, RefObject } from "react";

const EMOJI_PALETTE = [
  "📁", "💊", "🏠", "💻", "📞", "✈️", "📚", "🎯",
  "💰", "🔧", "🎨", "🧪", "📝", "🏋️", "🎵", "🍽️",
  "🚗", "🌱", "⭐", "🔥",
];

const COLOR_PALETTE = [
  "#3b82f6", "#10b981", "#8b5cf6", "#f59e0b",
  "#f43f5e", "#06b6d4", "#d946ef", "#84cc16",
];

export function ProjectChipEditor({
  name,
  open,
  onClose,
  popoverRef,
  style,
}: {
  name: string;
  open: boolean;
  onClose: () => void;
  popoverRef: RefObject<HTMLDivElement | null>;
  style: CSSProperties;
}) {
  const config = useProjectStore((s) => s.getConfig)(name);
  const upsert = useProjectStore((s) => s.upsert);
  const [editName, setEditName] = useState(name);

  const rename = useProjectStore((s) => s.rename);

  return (
    <Popover
      open={open}
      onClose={onClose}
      popoverRef={popoverRef}
      style={style}
      className="w-52 p-2.5"
    >
      <div className="mb-2 text-xs font-medium text-[var(--muted)]">Emoji</div>
      <div className="grid grid-cols-5 gap-1">
        {EMOJI_PALETTE.map((emoji) => (
          <button
            key={emoji}
            type="button"
            onClick={() => {
              bump();
              void upsert(name, { emoji });
            }}
            className={[
              "flex h-9 w-9 items-center justify-center rounded text-lg",
              config.emoji === emoji
                ? "bg-[var(--primary)]/10 ring-1 ring-[var(--primary)]"
                : "hover:bg-[var(--surface-2)]",
            ].join(" ")}
          >
            {emoji}
          </button>
        ))}
      </div>

      <div className="mb-2 mt-3 text-xs font-medium text-[var(--muted)]">Color</div>
      <div className="flex gap-1.5">
        {COLOR_PALETTE.map((color) => (
          <button
            key={color}
            type="button"
            onClick={() => {
              bump();
              void upsert(name, { color });
            }}
            className={[
              "h-7 w-7 rounded-full border-2",
              config.color === color ? "border-[var(--fg)]" : "border-transparent",
            ].join(" ")}
            style={{ backgroundColor: color }}
            aria-label={`Color ${color}`}
          />
        ))}
      </div>

      <div className="mb-1.5 mt-3 text-xs font-medium text-[var(--muted)]">Name</div>
      <form
        className="flex gap-1.5"
        onSubmit={(e) => {
          e.preventDefault();
          const trimmed = editName.trim();
          if (trimmed && trimmed !== name) {
            bump();
            void rename(name, trimmed);
          }
          onClose();
        }}
      >
        <input
          value={editName}
          onChange={(e) => setEditName(e.target.value)}
          className="h-8 flex-1 rounded border border-[var(--border)] bg-[var(--bg)] px-2 text-sm text-[var(--fg)]"
        />
        <button
          type="submit"
          className="flex h-8 w-8 items-center justify-center rounded bg-[var(--primary)] text-sm text-[var(--primary-fg)]"
          aria-label="Save name"
        >
          ✓
        </button>
      </form>
    </Popover>
  );
}

/** Convenience hook: manages popover state + the project name being edited */
export function useProjectChipEditor() {
  const popover = usePopover();
  const [editingProject, setEditingProject] = useState<string | null>(null);

  return {
    ...popover,
    editingProject,
    openForProject: (name: string, e: { clientX: number; clientY: number }) => {
      setEditingProject(name);
      popover.open(e);
    },
    close: () => {
      setEditingProject(null);
      popover.close();
    },
  };
}
