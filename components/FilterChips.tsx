"use client";

import type { TodoPriority } from "@/types/todo";

type Status = "all" | "active" | "done";

function Chip({
  active,
  label,
  onClick
}: {
  active: boolean;
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={[
        "h-8 rounded-full px-3 text-xs font-medium",
        "border",
        active
          ? "border-neutral-900 bg-neutral-900 text-white dark:border-neutral-50 dark:bg-neutral-50 dark:text-neutral-950"
          : "border-neutral-200 bg-white text-neutral-700 dark:border-neutral-800 dark:bg-neutral-950 dark:text-neutral-200"
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
      <Chip active={status === "all"} label="All" onClick={() => onStatusChange("all")} />
      <Chip
        active={status === "active"}
        label="Active"
        onClick={() => onStatusChange("active")}
      />
      <Chip active={status === "done"} label="Done" onClick={() => onStatusChange("done")} />
      <div className="w-px self-stretch bg-neutral-200 dark:bg-neutral-800" />
      <Chip active={!priority} label="Any" onClick={() => onPriorityChange(undefined)} />
      {priorities.map((p) => (
        <Chip key={p} active={priority === p} label={`(${p})`} onClick={() => onPriorityChange(p)} />
      ))}
    </div>
  );
}

