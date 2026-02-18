import type { TodoPriority } from "@/types/todo";

const PRIORITY_STYLES: Record<TodoPriority, string> = {
  A: "bg-red-500/15 text-red-700 dark:bg-red-400/15 dark:text-red-300",
  B: "bg-orange-500/15 text-orange-700 dark:bg-orange-400/15 dark:text-orange-300",
  C: "bg-yellow-500/20 text-yellow-800 dark:bg-yellow-400/15 dark:text-yellow-200",
  D: "bg-neutral-500/15 text-neutral-700 dark:bg-neutral-400/15 dark:text-neutral-200",
  E: "bg-neutral-500/15 text-neutral-700 dark:bg-neutral-400/15 dark:text-neutral-200",
  F: "bg-neutral-500/15 text-neutral-700 dark:bg-neutral-400/15 dark:text-neutral-200",
  G: "bg-neutral-500/15 text-neutral-700 dark:bg-neutral-400/15 dark:text-neutral-200",
  H: "bg-neutral-500/15 text-neutral-700 dark:bg-neutral-400/15 dark:text-neutral-200",
  I: "bg-neutral-500/15 text-neutral-700 dark:bg-neutral-400/15 dark:text-neutral-200",
  J: "bg-neutral-500/15 text-neutral-700 dark:bg-neutral-400/15 dark:text-neutral-200",
  K: "bg-neutral-500/15 text-neutral-700 dark:bg-neutral-400/15 dark:text-neutral-200",
  L: "bg-neutral-500/15 text-neutral-700 dark:bg-neutral-400/15 dark:text-neutral-200",
  M: "bg-neutral-500/15 text-neutral-700 dark:bg-neutral-400/15 dark:text-neutral-200",
  N: "bg-neutral-500/15 text-neutral-700 dark:bg-neutral-400/15 dark:text-neutral-200",
  O: "bg-neutral-500/15 text-neutral-700 dark:bg-neutral-400/15 dark:text-neutral-200",
  P: "bg-neutral-500/15 text-neutral-700 dark:bg-neutral-400/15 dark:text-neutral-200",
  Q: "bg-neutral-500/15 text-neutral-700 dark:bg-neutral-400/15 dark:text-neutral-200",
  R: "bg-neutral-500/15 text-neutral-700 dark:bg-neutral-400/15 dark:text-neutral-200",
  S: "bg-neutral-500/15 text-neutral-700 dark:bg-neutral-400/15 dark:text-neutral-200",
  T: "bg-neutral-500/15 text-neutral-700 dark:bg-neutral-400/15 dark:text-neutral-200",
  U: "bg-neutral-500/15 text-neutral-700 dark:bg-neutral-400/15 dark:text-neutral-200",
  V: "bg-neutral-500/15 text-neutral-700 dark:bg-neutral-400/15 dark:text-neutral-200",
  W: "bg-neutral-500/15 text-neutral-700 dark:bg-neutral-400/15 dark:text-neutral-200",
  X: "bg-neutral-500/15 text-neutral-700 dark:bg-neutral-400/15 dark:text-neutral-200",
  Y: "bg-neutral-500/15 text-neutral-700 dark:bg-neutral-400/15 dark:text-neutral-200",
  Z: "bg-neutral-500/15 text-neutral-700 dark:bg-neutral-400/15 dark:text-neutral-200"
};

export function PriorityBadge({ priority }: { priority?: TodoPriority }) {
  if (!priority) return null;
  return (
    <span
      className={[
        "inline-flex items-center rounded px-1.5 py-0.5 text-[11px] font-semibold tabular-nums",
        PRIORITY_STYLES[priority]
      ].join(" ")}
    >
      ({priority})
    </span>
  );
}

