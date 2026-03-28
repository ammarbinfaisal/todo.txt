import type { TodoPriority } from "@/types/todo";

/** Priority rendered as a colored bar. Color uses CSS vars so each theme
 *  provides its own best-contrast shade. A = most urgent (bright), D+ = low. */
export function PriorityBadge({ priority }: { priority?: TodoPriority }) {
  if (!priority) return null;

  const level =
    priority === "A" ? "a"
      : priority === "B" ? "b"
        : priority === "C" ? "c"
          : "d";

  return (
    <span
      className="inline-block h-4 w-1 shrink-0 rounded-full"
      style={{ backgroundColor: `var(--priority-${level})` }}
      aria-label={`Priority ${priority}`}
      title={`Priority ${priority}`}
    />
  );
}
