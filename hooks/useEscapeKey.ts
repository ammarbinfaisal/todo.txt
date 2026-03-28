import { useCallback } from "react";
import { useMountEffect } from "./useMountEffect";

/** Register a global Escape key handler on mount. Caller controls whether to act. */
export function useEscapeKey(onEscape: () => void) {
  const handler = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === "Escape") onEscape();
    },
    [onEscape]
  );

  useMountEffect(() => {
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  });
}
