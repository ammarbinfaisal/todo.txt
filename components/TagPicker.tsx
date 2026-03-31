"use client";

import { useMemo } from "react";
import { Check } from "lucide-react";
import { Popover } from "@/components/Popover";
import { useProjectStore } from "@/stores/project-store";
import { useTodoStore } from "@/stores/todo-store";
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
  const todos = useTodoStore((s) => s.todos);

  const projectList = useMemo(() => {
    const seen = new Set<string>(Object.keys(configs));
    for (const t of todos) {
      for (const p of t.projects) seen.add(p);
    }
    for (const p of currentProjects) seen.add(p);
    return [...seen];
  }, [configs, todos, currentProjects]);
  const currentSet = new Set(currentProjects);

  return (
    <Popover
      open={open}
      onClose={onClose}
      popoverRef={popoverRef}
      style={style}
      className="w-48 p-2"
    >
      <div className="mb-1.5 text-xs font-medium text-[var(--muted)]">Projects</div>
      {projectList.length === 0 && (
        <div className="py-3 text-center text-xs text-[var(--muted)]">
          No projects yet
        </div>
      )}
      <div className="max-h-52 overflow-y-auto">
        {projectList.map((name) => {
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
              <span
                className="flex h-5 w-5 items-center justify-center rounded-full text-[10px] font-bold"
                style={{ backgroundColor: `${config.color}20`, color: config.color }}
              >
                {name.charAt(0).toUpperCase()}
              </span>
              <span className="flex-1 text-left">{name}</span>
              {attached && <Check size={14} className="text-[var(--primary)]" />}
            </button>
          );
        })}
      </div>
    </Popover>
  );
}
