"use client";

import type { MouseEvent } from "react";
import { useProjectStore } from "@/stores/project-store";

export function ProjectChip({
  name,
  onEdit,
}: {
  name: string;
  onEdit: (e: MouseEvent) => void;
}) {
  const configs = useProjectStore((s) => s.configs);
  const getConfig = useProjectStore((s) => s.getConfig);
  const config = getConfig(name);

  return (
    <button
      type="button"
      onClick={(e) => {
        e.stopPropagation();
        onEdit(e);
      }}
      className="inline-flex items-center gap-0.5 rounded px-1.5 py-px text-xs font-medium leading-5"
      style={{
        backgroundColor: `${config.color}20`,
        color: config.color,
      }}
    >
      <span>{config.emoji}</span>
      <span>{name}</span>
    </button>
  );
}
