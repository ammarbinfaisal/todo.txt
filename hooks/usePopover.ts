"use client";

import { useCallback, useRef, useState, useLayoutEffect } from "react";
import type { CSSProperties, RefObject } from "react";

interface PopoverPosition {
  x: number;
  y: number;
}

interface PopoverState {
  isOpen: boolean;
  position: PopoverPosition;
  open: (e: { clientX: number; clientY: number }) => void;
  close: () => void;
  popoverRef: RefObject<HTMLDivElement | null>;
  style: CSSProperties;
}

const MARGIN = 8;

export function usePopover(): PopoverState {
  const [isOpen, setIsOpen] = useState(false);
  const [position, setPosition] = useState<PopoverPosition>({ x: 0, y: 0 });
  const [clamped, setClamped] = useState<{ top: number; left: number } | null>(null);
  const popoverRef = useRef<HTMLDivElement>(null);

  const open = useCallback((e: { clientX: number; clientY: number }) => {
    setPosition({ x: e.clientX, y: e.clientY });
    setClamped(null);
    setIsOpen(true);
  }, []);

  const close = useCallback(() => {
    setIsOpen(false);
  }, []);

  useLayoutEffect(() => {
    if (!isOpen || !popoverRef.current) return;
    const el = popoverRef.current;
    const rect = el.getBoundingClientRect();
    const vw = window.innerWidth;
    const vh = window.innerHeight;

    let left = position.x;
    let top = position.y;

    if (left + rect.width > vw - MARGIN) left = vw - rect.width - MARGIN;
    if (left < MARGIN) left = MARGIN;
    if (top + rect.height > vh - MARGIN) top = position.y - rect.height - MARGIN;
    if (top < MARGIN) top = MARGIN;

    setClamped({ top, left });
  }, [isOpen, position]);

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
