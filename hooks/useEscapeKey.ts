import { useRef } from "react";
import { useMountEffect } from "./useMountEffect";

/** Register a global Escape key handler. Uses a ref to keep the callback fresh. */
export function useEscapeKey(onEscape: () => void) {
  const callbackRef = useRef(onEscape);
  callbackRef.current = onEscape;

  useMountEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") callbackRef.current();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  });
}
