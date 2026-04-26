"use client";

import { useCallback, useRef, useState } from "react";
import type { CSSProperties } from "react";

interface PopoverPosition {
  x: number;
  y: number;
}

interface PopoverState {
  isOpen: boolean;
  position: PopoverPosition;
  open: (e: { clientX: number; clientY: number }) => void;
  close: () => void;
  popoverRef: (node: HTMLDivElement | null) => void;
  style: CSSProperties;
}

const MARGIN = 8;

export function usePopover(): PopoverState {
  const [isOpen, setIsOpen] = useState(false);
  const [position, setPosition] = useState<PopoverPosition>({ x: 0, y: 0 });
  const [clamped, setClamped] = useState<{ top: number; left: number } | null>(null);

  // Track the latest desired anchor without re-running the ref callback.
  const positionRef = useRef<PopoverPosition>({ x: 0, y: 0 });
  positionRef.current = position;

  const open = useCallback((e: { clientX: number; clientY: number }) => {
    setPosition({ x: e.clientX, y: e.clientY });
    setClamped(null);
    setIsOpen(true);
  }, []);

  const close = useCallback(() => {
    setIsOpen(false);
  }, []);

  // Callback ref: React calls this synchronously after mount, replacing the
  // useLayoutEffect that previously measured the popover. When the node mounts
  // we measure once and clamp into the viewport; when it unmounts we reset.
  const popoverRef = useCallback((node: HTMLDivElement | null) => {
    if (!node) {
      setClamped(null);
      return;
    }
    const rect = node.getBoundingClientRect();
    const vw = window.innerWidth;
    const vh = window.innerHeight;
    const { x, y } = positionRef.current;

    let left = x;
    let top = y;
    if (left + rect.width > vw - MARGIN) left = vw - rect.width - MARGIN;
    if (left < MARGIN) left = MARGIN;
    if (top + rect.height > vh - MARGIN) top = y - rect.height - MARGIN;
    if (top < MARGIN) top = MARGIN;

    setClamped({ top, left });
  }, []);

  const style: CSSProperties = isOpen
    ? {
        position: "fixed",
        zIndex: 100,
        top: clamped?.top ?? position.y,
        left: clamped?.left ?? position.x,
        opacity: clamped ? 1 : 0,
        transform: clamped ? "scale(1)" : "scale(0.95)",
        transition: "opacity 120ms ease-out, transform 120ms ease-out",
      }
    : { position: "fixed", zIndex: 100, opacity: 0, pointerEvents: "none" };

  return { isOpen, position, open, close, popoverRef, style };
}
