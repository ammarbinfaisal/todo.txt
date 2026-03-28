"use client";

import { useState } from "react";
import { Popover } from "@/components/Popover";
import { useProjectStore } from "@/stores/project-store";
import { bump } from "@/lib/haptics";
import type { CSSProperties, RefObject } from "react";

export function TagPicker({
  open,
  currentProjects,
  onToggleProject,
  onClose,
  popoverRef,
  style,
}: {
  open: boolean;
  currentProjects: string[];
  onToggleProject: (name: string) => void;
  onClose: () => void;
  popoverRef: RefObject<HTMLDivElement | null>;
  style: CSSProperties;
}) {
  const configs = useProjectStore((s) => s.configs);
  const getConfig = useProjectStore((s) => s.getConfig);
  const upsert = useProjectStore((s) => s.upsert);
  const [newName, setNewName] = useState("");

  const allProjects = Object.keys(configs);
  const currentSet = new Set(currentProjects);

  return (
    <Popover
      open={open}
      onClose={onClose}
      popoverRef={popoverRef}
      style={style}
      className="w-52 p-2"
    >
      <div className="mb-1.5 text-xs font-medium text-[var(--muted)]">Projects</div>
      {allProjects.length === 0 && currentProjects.length === 0 && (
        <div className="py-2 text-center text-xs text-[var(--muted)]">No projects yet</div>
      )}
      <div className="max-h-48 overflow-y-auto">
        {allProjects.map((name) => {
          const config = getConfig(name);
          const attached = currentSet.has(name);
          return (
            <button
              key={name}
              type="button"
              onClick={() => {
                bump();
                onToggleProject(name);
              }}
              className={[
                "flex w-full items-center gap-2 rounded px-2 py-1.5 text-sm",
                attached ? "bg-[var(--primary)]/5" : "hover:bg-[var(--surface-2)]",
              ].join(" ")}
            >
              <span className="text-base">{config.emoji}</span>
              <span className="flex-1 text-left">{name}</span>
              {attached && (
                <span className="text-xs text-[var(--primary)]">✓</span>
              )}
            </button>
          );
        })}
        {/* Show current projects not yet in config store */}
        {currentProjects
          .filter((p) => !allProjects.includes(p))
          .map((name) => {
            const config = getConfig(name);
            return (
              <button
                key={name}
                type="button"
                onClick={() => {
                  bump();
                  onToggleProject(name);
                }}
                className="flex w-full items-center gap-2 rounded bg-[var(--primary)]/5 px-2 py-1.5 text-sm"
              >
                <span className="text-base">{config.emoji}</span>
                <span className="flex-1 text-left">{name}</span>
                <span className="text-xs text-[var(--primary)]">✓</span>
              </button>
            );
          })}
      </div>
      <form
        className="mt-1.5 flex gap-1.5 border-t border-[var(--border)] pt-1.5"
        onSubmit={(e) => {
          e.preventDefault();
          const trimmed = newName.trim();
          if (!trimmed) return;
          bump();
          void upsert(trimmed, {});
          onToggleProject(trimmed);
          setNewName("");
        }}
      >
        <input
          value={newName}
          onChange={(e) => setNewName(e.target.value)}
          placeholder="New project…"
          className="h-8 flex-1 rounded border border-[var(--border)] bg-[var(--bg)] px-2 text-sm text-[var(--fg)] placeholder:text-[var(--muted)]"
        />
        <button
          type="submit"
          className="flex h-8 w-8 items-center justify-center rounded bg-[var(--primary)] text-sm text-[var(--primary-fg)]"
          aria-label="Add project"
        >
          +
        </button>
      </form>
    </Popover>
  );
}
