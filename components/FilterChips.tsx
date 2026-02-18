"use client";

import type { TodoPriority } from "@/types/todo";

type Status = "all" | "active" | "done";

function Chip({
  active,
  label,
  ariaLabel,
  onClick
}: {
  active: boolean;
  label: string;
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
        "h-8 rounded-full px-3 text-xs font-medium",
        "border",
        active
          ? "border-[var(--primary)] bg-[var(--primary)] text-[var(--primary-fg)]"
          : "border-[var(--border)] bg-[var(--surface)] text-[var(--muted)]"
      ].join(" ")}
    >
      {label}
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
    <div className="flex gap-2 overflow-x-auto pb-1 [-webkit-overflow-scrolling:touch]">
      <Chip
        active={status === "all"}
        label="≡"
        ariaLabel="Show all"
        onClick={() => onStatusChange("all")}
      />
      <Chip
        active={status === "active"}
        label="○"
        ariaLabel="Show active"
        onClick={() => onStatusChange("active")}
      />
      <Chip
        active={status === "done"}
        label="✓"
        ariaLabel="Show done"
        onClick={() => onStatusChange("done")}
      />
      <div className="w-px self-stretch bg-[var(--border)]" />
      <Chip
        active={!priority}
        label="•"
        ariaLabel="Any priority"
        onClick={() => onPriorityChange(undefined)}
      />
      {priorities.map((p) => (
        <Chip
          key={p}
          active={priority === p}
          label={p}
          ariaLabel={`Priority ${p}`}
          onClick={() => onPriorityChange(p)}
        />
      ))}
    </div>
  );
}
