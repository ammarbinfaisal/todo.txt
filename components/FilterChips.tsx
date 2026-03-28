"use client";

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
  icon: string;
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
      <span>{icon}</span>
      {label && <span className="hidden md:inline">{label}</span>}
    </button>
  );
}

export function FilterChips({
  status,
  priority,
  onStatusChange,
  onPriorityChange
}: {
  status: Status;
  priority?: TodoPriority;
  onStatusChange: (s: Status) => void;
  onPriorityChange: (p?: TodoPriority) => void;
}) {
  const priorities: TodoPriority[] = ["A", "B", "C", "D"];

  return (
    <div className="flex gap-1.5 overflow-x-auto pb-1 [-webkit-overflow-scrolling:touch] md:gap-2">
      <Chip
        active={status === "all"}
        icon="≡"
        label="All"
        ariaLabel="Show all"
        onClick={() => onStatusChange("all")}
      />
      <Chip
        active={status === "active"}
        icon="○"
        label="Active"
        ariaLabel="Show active"
        onClick={() => onStatusChange("active")}
      />
      <Chip
        active={status === "done"}
        icon="✓"
        label="Done"
        ariaLabel="Show done"
        onClick={() => onStatusChange("done")}
      />
      <div className="w-px self-stretch bg-[var(--border)]" />
      <Chip
        active={!priority}
        icon="•"
        ariaLabel="Any priority"
        onClick={() => onPriorityChange(undefined)}
      />
      {priorities.map((p) => (
        <Chip
          key={p}
          active={priority === p}
          icon={p}
          ariaLabel={`Priority ${p}`}
          onClick={() => onPriorityChange(p)}
        />
      ))}
    </div>
  );
}
