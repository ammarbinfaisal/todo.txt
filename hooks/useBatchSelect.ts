"use client";

import { useCallback, useState } from "react";
import { heavy } from "@/lib/haptics";

export function useBatchSelect() {
  const [selectMode, setSelectMode] = useState(false);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  const enter = useCallback(() => {
    heavy();
    setSelectMode(true);
  }, []);

  const exit = useCallback(() => {
    setSelectMode(false);
    setSelectedIds(new Set());
  }, []);

  const toggle = useCallback((id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);

  const selectAll = useCallback((ids: string[]) => {
    setSelectedIds(new Set(ids));
  }, []);

  const isSelected = useCallback(
    (id: string) => selectedIds.has(id),
    [selectedIds]
  );

  return {
    selectMode,
    selectedIds,
    count: selectedIds.size,
    enter,
    exit,
    toggle,
    selectAll,
    isSelected,
  };
}
