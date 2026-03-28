"use client";

import type { ButtonHTMLAttributes } from "react";

export function IconButton({
  icon,
  label,
  className,
  ...props
}: {
  icon: string;
  label?: string;
} & ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      type="button"
      {...props}
      className={[
        "flex h-10 items-center justify-center rounded-md text-base",
        label ? "w-10 md:w-auto md:gap-1.5 md:px-3" : "w-10",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
    >
      <span>{icon}</span>
      {label && <span className="hidden text-sm md:inline">{label}</span>}
    </button>
  );
}
