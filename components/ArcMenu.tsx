"use client";

import { useCallback, useEffect, useRef, useState, type ReactNode } from "react";
import { createPortal } from "react-dom";
import { Check, Pencil, Tag, Trash2 } from "lucide-react";
import { useEscapeKey } from "@/hooks/useEscapeKey";
import { tick } from "@/lib/haptics";

export type ArcAction = "complete" | "edit" | "tag" | "delete";

const ITEMS: { action: ArcAction; icon: ReactNode; label: string }[] = [
  { action: "complete", icon: <Check size={18} />, label: "Done" },
  { action: "edit", icon: <Pencil size={18} />, label: "Edit" },
  { action: "tag", icon: <Tag size={18} />, label: "Tag" },
  { action: "delete", icon: <Trash2 size={18} />, label: "Delete" },
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

  // Track open transitions — schedule side effects via microtask to avoid
  // running them during render (React rules)
  if (open && !prevOpen.current) {
    queueMicrotask(() => {
      setRevealed(true);
      tick();
    });
  } else if (!open && prevOpen.current) {
    setRevealed(false);
  }
  prevOpen.current = open;

  const menuRef = useRef<HTMLDivElement>(null);

  const handleClose = useCallback(() => {
    if (open) onClose();
  }, [open, onClose]);

  useEscapeKey(handleClose);

  // Close on outside pointerdown (replaces backdrop overlay)
  useEffect(() => {
    if (!open) return;
    const handler = (e: PointerEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        onClose();
      }
    };
    document.addEventListener("pointerdown", handler);
    return () => document.removeEventListener("pointerdown", handler);
  }, [open, onClose]);

  if (!open) return null;

  const vw = typeof window !== "undefined" ? window.innerWidth : 400;
  const vh = typeof window !== "undefined" ? window.innerHeight : 800;
  const ox = Math.max(RADIUS + 8, Math.min(position.x, vw - RADIUS - 8));
  const oy = Math.max(8, Math.min(position.y, vh - RADIUS - 52));

  return createPortal(
    <>
      <div
        ref={menuRef}
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
                "border border-[var(--border)] bg-[var(--surface)] shadow-md",
                "transition-all duration-150",
                item.action === "delete"
                  ? "text-red-500 active:bg-red-500/20"
                  : item.action === "complete"
                    ? "text-emerald-600 active:bg-emerald-500/20"
                    : "text-[var(--fg)] active:bg-[var(--surface-2)]",
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
