"use client";

import { useEffect, type CSSProperties, type ReactNode, type RefObject } from "react";
import { createPortal } from "react-dom";

export function Popover({
  open,
  onClose,
  popoverRef,
  style,
  children,
  className,
}: {
  open: boolean;
  onClose: () => void;
  popoverRef: RefObject<HTMLDivElement | null>;
  style: CSSProperties;
  children: ReactNode;
  className?: string;
}) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open) return null;

  return createPortal(
    <>
      <div
        className="fixed inset-0 z-[99]"
        onClick={onClose}
        aria-hidden="true"
      />
      <div
        ref={popoverRef}
        style={style}
        className={[
          "rounded-lg border border-[var(--border)] bg-[var(--surface)] shadow-lg",
          className,
        ]
          .filter(Boolean)
          .join(" ")}
      >
        {children}
      </div>
    </>,
    document.body
  );
}
