import type { TodoPriority } from "@/types/todo";

const PRIORITY_STYLES: Record<TodoPriority, string> = {
  A: "bg-red-500/20 text-red-500",
  B: "bg-orange-500/20 text-orange-500",
  C: "bg-yellow-500/25 text-yellow-600",
  D: "bg-neutral-500/15 text-[var(--muted)]",
  E: "bg-neutral-500/15 text-[var(--muted)]",
  F: "bg-neutral-500/15 text-[var(--muted)]",
  G: "bg-neutral-500/15 text-[var(--muted)]",
  H: "bg-neutral-500/15 text-[var(--muted)]",
  I: "bg-neutral-500/15 text-[var(--muted)]",
  J: "bg-neutral-500/15 text-[var(--muted)]",
  K: "bg-neutral-500/15 text-[var(--muted)]",
  L: "bg-neutral-500/15 text-[var(--muted)]",
  M: "bg-neutral-500/15 text-[var(--muted)]",
  N: "bg-neutral-500/15 text-[var(--muted)]",
  O: "bg-neutral-500/15 text-[var(--muted)]",
  P: "bg-neutral-500/15 text-[var(--muted)]",
  Q: "bg-neutral-500/15 text-[var(--muted)]",
  R: "bg-neutral-500/15 text-[var(--muted)]",
  S: "bg-neutral-500/15 text-[var(--muted)]",
  T: "bg-neutral-500/15 text-[var(--muted)]",
  U: "bg-neutral-500/15 text-[var(--muted)]",
  V: "bg-neutral-500/15 text-[var(--muted)]",
  W: "bg-neutral-500/15 text-[var(--muted)]",
  X: "bg-neutral-500/15 text-[var(--muted)]",
  Y: "bg-neutral-500/15 text-[var(--muted)]",
  Z: "bg-neutral-500/15 text-[var(--muted)]"
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
