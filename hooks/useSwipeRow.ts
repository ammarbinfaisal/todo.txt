"use client";

import { useCallback, useRef, useState } from "react";
import type { MouseEvent, PointerEvent } from "react";

type SwipeAction = "none" | "left" | "right";

function clamp(value: number, min: number, max: number) {
  return Math.max(min, Math.min(max, value));
}

export function useSwipeRow({
  onSwipeLeft,
  onSwipeRight,
  threshold = 80,
  max = 140
}: {
  onSwipeLeft: () => void;
  onSwipeRight: () => void;
  threshold?: number;
  max?: number;
}) {
  const startX = useRef(0);
  const startY = useRef(0);
  const dragging = useRef(false);
  const lockedAxis = useRef<"none" | "x" | "y">("none");
  const didSwipe = useRef(false);

  const [x, setX] = useState(0);
  const [active, setActive] = useState(false);

  const reset = useCallback(() => {
    setActive(false);
    setX(0);
    dragging.current = false;
    lockedAxis.current = "none";
  }, []);

  const onPointerDown = useCallback((e: PointerEvent) => {
    if (e.button !== 0) return;
    startX.current = e.clientX;
    startY.current = e.clientY;
    dragging.current = true;
    lockedAxis.current = "none";
    didSwipe.current = false;
    setActive(true);
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
  }, []);

  const onPointerMove = useCallback((e: PointerEvent) => {
    if (!dragging.current) return;
    const dx = e.clientX - startX.current;
    const dy = e.clientY - startY.current;

    if (lockedAxis.current === "none") {
      const adx = Math.abs(dx);
      const ady = Math.abs(dy);
      if (adx < 4 && ady < 4) return;
      lockedAxis.current = adx > ady * 1.3 ? "x" : "y";
    }

    if (lockedAxis.current === "y") {
      setActive(false);
      return;
    }

    didSwipe.current = true;
    e.preventDefault();
    setX(clamp(dx, -max, max));
  }, [max]);

  const finish = useCallback(() => {
    const dx = x;
    const direction: SwipeAction =
      dx <= -threshold ? "left" : dx >= threshold ? "right" : "none";

    reset();
    if (direction === "left") onSwipeLeft();
    if (direction === "right") onSwipeRight();
  }, [x, threshold, onSwipeLeft, onSwipeRight, reset]);

  const onPointerUp = useCallback(() => {
    if (!dragging.current) return;
    finish();
  }, [finish]);

  const onPointerCancel = useCallback(() => {
    if (!dragging.current) return;
    reset();
  }, [reset]);

  const onClickCapture = useCallback((e: MouseEvent) => {
    if (didSwipe.current) {
      e.preventDefault();
      e.stopPropagation();
    }
  }, []);

  return {
    x,
    active,
    bind: {
      onPointerDown,
      onPointerMove,
      onPointerUp,
      onPointerCancel,
      onClickCapture
    }
  };
}
