"use client";

import { useCallback, useRef, useState } from "react";
import type { MouseEvent, PointerEvent } from "react";
import { tick } from "@/lib/haptics";

function clamp(value: number, min: number, max: number) {
  return Math.max(min, Math.min(max, value));
}

export function useSwipeRow({
  onSwipeRight,
  threshold = 80,
  max = 140,
}: {
  onSwipeRight: () => void;
  threshold?: number;
  max?: number;
}) {
  const startX = useRef(0);
  const startY = useRef(0);
  const dragging = useRef(false);
  const lockedAxis = useRef<"none" | "x" | "y">("none");
  const didSwipe = useRef(false);
  const crossedThreshold = useRef(false);

  const [x, setX] = useState(0);
  const [active, setActive] = useState(false);

  const reset = useCallback(() => {
    setActive(false);
    setX(0);
    dragging.current = false;
    lockedAxis.current = "none";
    crossedThreshold.current = false;
  }, []);

  const onPointerDown = useCallback((e: PointerEvent) => {
    if (e.button !== 0) return;
    startX.current = e.clientX;
    startY.current = e.clientY;
    dragging.current = true;
    lockedAxis.current = "none";
    didSwipe.current = false;
    crossedThreshold.current = false;
    setActive(true);
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
  }, []);

  const onPointerMove = useCallback(
    (e: PointerEvent) => {
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

      // Right swipe only — clamp left at 0
      const clamped = clamp(dx, 0, max);
      setX(clamped);

      // Haptic tick when crossing threshold
      if (clamped >= threshold && !crossedThreshold.current) {
        crossedThreshold.current = true;
        tick();
      } else if (clamped < threshold && crossedThreshold.current) {
        crossedThreshold.current = false;
      }
    },
    [max, threshold]
  );

  const finish = useCallback(() => {
    const dx = x;
    const shouldFire = dx >= threshold;
    reset();
    if (shouldFire) onSwipeRight();
  }, [x, threshold, onSwipeRight, reset]);

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
      onClickCapture,
    },
  };
}
