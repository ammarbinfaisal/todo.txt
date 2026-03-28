"use client";

import type { ReactNode } from "react";
import { List, Circle, Check } from "lucide-react";
import type { TodoPriority } from "@/types/todo";

type Status = "all" | "active" | "done";

function Chip({
  active,
  icon,
  label,
  ariaLabel,
  onClick,
}: {
  active: boolean;
  icon: ReactNode;
  label?: string;
  ariaLabel: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={ariaLabel}
      title={ariaLabel}
      className={[
        "flex h-8 items-center gap-1 rounded-full px-3 text-sm font-medium",
        "border",
        active
          ? "border-[var(--primary)] bg-[var(--primary)] text-[var(--primary-fg)]"
          : "border-[var(--border)] bg-[var(--surface)] text-[var(--muted)]",
      ].join(" ")}
    >
      {icon}
      {label && <span className="hidden md:inline">{label}</span>}
    </button>
  );
}

const PRIORITY_LEVELS: { key: TodoPriority; label: string; cssVar: string }[] = [
  { key: "A", label: "Urgent", cssVar: "var(--priority-a)" },
  { key: "B", label: "High", cssVar: "var(--priority-b)" },
  { key: "C", label: "Medium", cssVar: "var(--priority-c)" },
  { key: "D", label: "Low", cssVar: "var(--priority-d)" },
];

export function FilterChips({
  status,
  priority,
  onStatusChange,
  onPriorityChange,
}: {
  status: Status;
  priority?: TodoPriority;
  onStatusChange: (s: Status) => void;
  onPriorityChange: (p?: TodoPriority) => void;
}) {
  return (
    <div className="flex gap-1.5 overflow-x-auto pb-1 [-webkit-overflow-scrolling:touch] md:gap-2">
      <Chip
        active={status === "all"}
        icon={<List size={14} />}
        label="All"
        ariaLabel="Show all"
        onClick={() => onStatusChange("all")}
      />
      <Chip
        active={status === "active"}
        icon={<Circle size={14} />}
        label="Active"
        ariaLabel="Show active"
        onClick={() => onStatusChange("active")}
      />
      <Chip
        active={status === "done"}
        icon={<Check size={14} />}
        label="Done"
        ariaLabel="Show done"
        onClick={() => onStatusChange("done")}
      />
      <div className="w-px self-stretch bg-[var(--border)]" />
      <Chip
        active={!priority}
        icon={<span className="h-2.5 w-2.5 rounded-full bg-[var(--muted)]" />}
        ariaLabel="Any priority"
        onClick={() => onPriorityChange(undefined)}
      />
      {PRIORITY_LEVELS.map((p) => (
        <Chip
          key={p.key}
          active={priority === p.key}
          icon={
            <span
              className="h-2.5 w-2.5 rounded-full"
              style={{ backgroundColor: p.cssVar }}
            />
          }
          label={p.label}
          ariaLabel={`Priority ${p.key} — ${p.label}`}
          onClick={() => onPriorityChange(p.key)}
        />
      ))}
    </div>
  );
}
