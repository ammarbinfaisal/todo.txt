export interface KeyboardShortcuts {
  undo: string;
  redo: string;
  focusInput: string;
  newTodo: string;
}

export interface AppSettings {
  projectPrefix: string;
  contextPrefix: string;
  shortcuts: KeyboardShortcuts;
}

export const DEFAULT_SHORTCUTS: KeyboardShortcuts = {
  undo: "mod+z",
  redo: "mod+shift+z",
  focusInput: "mod+k",
  newTodo: "mod+n",
};

export const DEFAULT_SETTINGS: AppSettings = {
  projectPrefix: "+",
  contextPrefix: "@",
  shortcuts: DEFAULT_SHORTCUTS,
};

/** Human-readable label for a shortcut key */
export function formatShortcut(combo: string): string {
  const isMac = typeof navigator !== "undefined" && /Mac/.test(navigator.userAgent);
  return combo
    .replace("mod", isMac ? "⌘" : "Ctrl")
    .replace("shift", isMac ? "⇧" : "Shift")
    .replace("alt", isMac ? "⌥" : "Alt")
    .replace(/\+/g, " + ")
    .trim();
}

/** Check if a KeyboardEvent matches a shortcut string like "mod+shift+z" */
export function matchesShortcut(e: KeyboardEvent, combo: string): boolean {
  const parts = combo.toLowerCase().split("+");
  const needsMod = parts.includes("mod");
  const needsShift = parts.includes("shift");
  const needsAlt = parts.includes("alt");
  const key = parts.filter((p) => p !== "mod" && p !== "shift" && p !== "alt")[0];

  if (needsMod && !(e.ctrlKey || e.metaKey)) return false;
  if (!needsMod && (e.ctrlKey || e.metaKey)) return false;
  if (needsShift !== e.shiftKey) return false;
  if (needsAlt !== e.altKey) return false;
  return e.key.toLowerCase() === key;
}
