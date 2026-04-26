"use client";

import type { CSSProperties, ReactNode } from "react";
import { createPortal } from "react-dom";
import { useEscapeKey } from "@/hooks/useEscapeKey";

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
  popoverRef: (node: HTMLDivElement | null) => void;
  style: CSSProperties;
  children: ReactNode;
  className?: string;
}) {
  useEscapeKey(onClose);

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
