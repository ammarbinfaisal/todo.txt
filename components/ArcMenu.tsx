"use client";

import { useCallback, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { useEscapeKey } from "@/hooks/useEscapeKey";
import { tick } from "@/lib/haptics";

export type ArcAction = "complete" | "edit" | "tag" | "delete";

const ITEMS: { action: ArcAction; icon: string; label: string }[] = [
  { action: "complete", icon: "✓", label: "Done" },
  { action: "edit", icon: "✏", label: "Edit" },
  { action: "tag", icon: "🏷", label: "Tag" },
  { action: "delete", icon: "🗑", label: "Delete" },
];

const RADIUS = 56;
const ARC_START = -160;
const ARC_END = -20;

function getIconPosition(index: number, count: number) {
  const angleDeg =
    count === 1
      ? (ARC_START + ARC_END) / 2
      : ARC_START + (index / (count - 1)) * (ARC_END - ARC_START);
  const angleRad = (angleDeg * Math.PI) / 180;
  return {
    x: Math.cos(angleRad) * RADIUS,
    y: -Math.sin(angleRad) * RADIUS,
  };
}

export function ArcMenu({
  open,
  position,
  onAction,
  onClose,
}: {
  open: boolean;
  position: { x: number; y: number };
  onAction: (action: ArcAction) => void;
  onClose: () => void;
}) {
  const [revealed, setRevealed] = useState(false);
  const prevOpen = useRef(false);

  // Derive revealed state from open prop without useEffect
  if (open && !prevOpen.current) {
    // Just opened — schedule reveal on next frame
    requestAnimationFrame(() => setRevealed(true));
    tick();
  } else if (!open && prevOpen.current) {
    setRevealed(false);
  }
  prevOpen.current = open;

  const handleClose = useCallback(() => {
    if (open) onClose();
  }, [open, onClose]);

  useEscapeKey(handleClose);

  if (!open) return null;

  const vw = typeof window !== "undefined" ? window.innerWidth : 400;
  const vh = typeof window !== "undefined" ? window.innerHeight : 800;
  const ox = Math.max(RADIUS + 8, Math.min(position.x, vw - RADIUS - 8));
  const oy = Math.max(8, Math.min(position.y, vh - RADIUS - 52));

  return createPortal(
    <>
      <div
        className="fixed inset-0 z-[99]"
        onClick={onClose}
        aria-hidden="true"
      />
      <div
        className="fixed z-[100]"
        style={{ top: oy, left: ox }}
        role="menu"
        aria-label="Todo actions"
      >
        {ITEMS.map((item, i) => {
          const pos = getIconPosition(i, ITEMS.length);
          return (
            <button
              key={item.action}
              type="button"
              role="menuitem"
              onClick={() => onAction(item.action)}
              onPointerEnter={() => tick()}
              className={[
                "absolute flex h-11 w-11 items-center justify-center rounded-full",
                "border border-[var(--border)] bg-[var(--surface)] text-base shadow-md",
                "transition-all duration-150",
                item.action === "delete"
                  ? "active:bg-red-500/20"
                  : "active:bg-[var(--surface-2)]",
              ].join(" ")}
              style={{
                transform: revealed
                  ? `translate(${pos.x - 22}px, ${pos.y - 22}px) scale(1)`
                  : `translate(0px, 0px) scale(0)`,
                opacity: revealed ? 1 : 0,
                transitionDelay: `${i * 30}ms`,
              }}
              aria-label={item.label}
              title={item.label}
            >
              {item.icon}
            </button>
          );
        })}
      </div>
    </>,
    document.body
  );
}
