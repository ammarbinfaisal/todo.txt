"use client";

import { useCallback, useRef, useState } from "react";
import { ArrowLeft, Moon, Sun, Square, HelpCircle, Download, Upload } from "lucide-react";
import Link from "next/link";
import { useMountEffect } from "@/hooks/useMountEffect";
import { useSettingsStore } from "@/stores/settings-store";
import { useThemeStore, type Theme } from "@/stores/theme-store";
import { formatShortcut, type KeyboardShortcuts } from "@/types/settings";

const THEMES: { key: Theme; icon: typeof Sun; label: string }[] = [
  { key: "light", icon: Sun, label: "Light" },
  { key: "beige", icon: Square, label: "Beige" },
  { key: "dark", icon: Moon, label: "Dark" },
];

const SHORTCUT_LABELS: Record<keyof KeyboardShortcuts, string> = {
  undo: "Undo",
  redo: "Redo",
  focusInput: "Focus input",
  newTodo: "New todo",
};

function ShortcutRow({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
}) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(value);

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    e.preventDefault();
    const parts: string[] = [];
    if (e.ctrlKey || e.metaKey) parts.push("mod");
    if (e.shiftKey) parts.push("shift");
    if (e.altKey) parts.push("alt");
    const key = e.key.toLowerCase();
    if (!["control", "meta", "shift", "alt"].includes(key)) {
      parts.push(key);
      const combo = parts.join("+");
      setDraft(combo);
      onChange(combo);
      setEditing(false);
    }
  }, [onChange]);

  return (
    <div className="flex items-center justify-between rounded-md border border-[var(--border)] bg-[var(--surface)] px-3 py-2">
      <span className="text-sm">{label}</span>
      {editing ? (
        <kbd
          tabIndex={0}
          onKeyDown={handleKeyDown}
          onBlur={() => setEditing(false)}
          className="rounded border border-[var(--primary)] bg-[var(--primary)]/5 px-2 py-1 text-xs text-[var(--primary)] outline-none"
          ref={(el) => el?.focus()}
        >
          Press keys…
        </kbd>
      ) : (
        <button
          type="button"
          onClick={() => {
            setDraft(value);
            setEditing(true);
          }}
          className="rounded bg-[var(--chip)] px-2 py-1 text-xs text-[var(--chip-fg)]"
        >
          {formatShortcut(value)}
        </button>
      )}
    </div>
  );
}

export function SettingsPage() {
  const theme = useThemeStore((s) => s.theme);
  const setTheme = useThemeStore((s) => s.setTheme);
  const hydrateTheme = useThemeStore((s) => s.hydrateFromStorage);

  const projectPrefix = useSettingsStore((s) => s.projectPrefix);
  const contextPrefix = useSettingsStore((s) => s.contextPrefix);
  const shortcuts = useSettingsStore((s) => s.shortcuts);
  const updateSettings = useSettingsStore((s) => s.update);
  const loadSettings = useSettingsStore((s) => s.load);
  const exportJson = useSettingsStore((s) => s.exportJson);
  const importJson = useSettingsStore((s) => s.importJson);

  const [ppDraft, setPpDraft] = useState(projectPrefix);
  const [cpDraft, setCpDraft] = useState(contextPrefix);
  const [importStatus, setImportStatus] = useState<"" | "ok" | "err">("");
  const fileRef = useRef<HTMLInputElement>(null);

  useMountEffect(() => {
    hydrateTheme();
    void loadSettings().then(() => {
      const s = useSettingsStore.getState();
      setPpDraft(s.projectPrefix);
      setCpDraft(s.contextPrefix);
    });
  });

  const savePrefix = (field: "projectPrefix" | "contextPrefix", value: string) => {
    const char = value.trim().charAt(0);
    if (!char) return;
    void updateSettings({ [field]: char });
  };

  const handleExport = () => {
    const json = exportJson();
    const blob = new Blob([json], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "todotxt-settings.json";
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  };

  const handleImport = async (file: File) => {
    const text = await file.text();
    const ok = await importJson(text);
    setImportStatus(ok ? "ok" : "err");
    if (ok) {
      const s = useSettingsStore.getState();
      setPpDraft(s.projectPrefix);
      setCpDraft(s.contextPrefix);
    }
    setTimeout(() => setImportStatus(""), 2000);
  };

  return (
    <div className="flex min-h-dvh flex-col bg-[var(--bg)] text-[var(--fg)]">
      <header className="sticky top-0 z-10 flex items-center gap-2 border-b border-[var(--border)] bg-[var(--surface)] px-2 py-2">
        <Link
          href="/"
          className="flex h-10 w-10 items-center justify-center rounded-md text-[var(--muted)]"
          aria-label="Back"
        >
          <ArrowLeft size={18} />
        </Link>
        <span className="text-base font-semibold">Settings</span>
      </header>

      <div className="flex-1 space-y-6 px-4 py-4">
        {/* Syntax */}
        <section>
          <h2 className="mb-3 text-xs font-semibold uppercase tracking-wide text-[var(--muted)]">
            Syntax
          </h2>
          <div className="space-y-3">
            <div>
              <label className="mb-1 block text-sm text-[var(--muted)]">Project prefix</label>
              <div className="flex items-center gap-2">
                <input
                  value={ppDraft}
                  onChange={(e) => setPpDraft(e.target.value)}
                  onBlur={() => savePrefix("projectPrefix", ppDraft)}
                  maxLength={1}
                  className="h-10 w-14 rounded-md border border-[var(--border)] bg-[var(--surface)] text-center text-lg text-[var(--fg)]"
                />
                <span className="text-sm text-[var(--muted)]">
                  e.g. <code className="rounded bg-[var(--chip)] px-1">{ppDraft}Health</code>
                </span>
              </div>
            </div>
            <div>
              <label className="mb-1 block text-sm text-[var(--muted)]">Context prefix</label>
              <div className="flex items-center gap-2">
                <input
                  value={cpDraft}
                  onChange={(e) => setCpDraft(e.target.value)}
                  onBlur={() => savePrefix("contextPrefix", cpDraft)}
                  maxLength={1}
                  className="h-10 w-14 rounded-md border border-[var(--border)] bg-[var(--surface)] text-center text-lg text-[var(--fg)]"
                />
                <span className="text-sm text-[var(--muted)]">
                  e.g. <code className="rounded bg-[var(--chip)] px-1">{cpDraft}work</code>
                </span>
              </div>
            </div>
          </div>
        </section>

        {/* Keyboard Shortcuts */}
        <section>
          <h2 className="mb-3 text-xs font-semibold uppercase tracking-wide text-[var(--muted)]">
            Keyboard Shortcuts
          </h2>
          <div className="space-y-2">
            {(Object.keys(SHORTCUT_LABELS) as (keyof KeyboardShortcuts)[]).map((key) => (
              <ShortcutRow
                key={key}
                label={SHORTCUT_LABELS[key]}
                value={shortcuts[key]}
                onChange={(combo) => {
                  void updateSettings({
                    shortcuts: { ...shortcuts, [key]: combo },
                  });
                }}
              />
            ))}
          </div>
          <p className="mt-2 text-xs text-[var(--muted)]">
            Click a shortcut, then press the new key combo. Tab accepts autocomplete in the input.
          </p>
        </section>

        {/* Theme */}
        <section>
          <h2 className="mb-3 text-xs font-semibold uppercase tracking-wide text-[var(--muted)]">
            Theme
          </h2>
          <div className="flex gap-2">
            {THEMES.map((t) => {
              const Icon = t.icon;
              return (
                <button
                  key={t.key}
                  type="button"
                  onClick={() => setTheme(t.key)}
                  className={[
                    "flex h-10 flex-1 items-center justify-center gap-1.5 rounded-md border text-sm",
                    theme === t.key
                      ? "border-[var(--primary)] bg-[var(--primary)] text-[var(--primary-fg)]"
                      : "border-[var(--border)] bg-[var(--surface)] text-[var(--muted)]",
                  ].join(" ")}
                >
                  <Icon size={14} />
                  {t.label}
                </button>
              );
            })}
          </div>
        </section>

        {/* Data */}
        <section>
          <h2 className="mb-3 text-xs font-semibold uppercase tracking-wide text-[var(--muted)]">
            Data
          </h2>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={handleExport}
              className="flex h-10 flex-1 items-center justify-center gap-1.5 rounded-md border border-[var(--border)] bg-[var(--surface)] text-sm text-[var(--fg)]"
            >
              <Download size={14} />
              Export settings
            </button>
            <button
              type="button"
              onClick={() => fileRef.current?.click()}
              className="flex h-10 flex-1 items-center justify-center gap-1.5 rounded-md border border-[var(--border)] bg-[var(--surface)] text-sm text-[var(--fg)]"
            >
              <Upload size={14} />
              Import settings
            </button>
            <input
              ref={fileRef}
              type="file"
              accept=".json"
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) void handleImport(file);
                e.target.value = "";
              }}
            />
          </div>
          {importStatus === "ok" && (
            <p className="mt-2 text-xs text-emerald-600">Settings imported</p>
          )}
          {importStatus === "err" && (
            <p className="mt-2 text-xs text-red-500">Invalid settings file</p>
          )}
        </section>

        {/* Help */}
        <section>
          <h2 className="mb-3 text-xs font-semibold uppercase tracking-wide text-[var(--muted)]">
            Help
          </h2>
          <Link
            href="/docs"
            className="flex items-center gap-2 rounded-md border border-[var(--border)] bg-[var(--surface)] px-3 py-2.5 text-sm text-[var(--fg)]"
          >
            <HelpCircle size={16} className="text-[var(--muted)]" />
            How to use TodoTXT
          </Link>
        </section>
      </div>
    </div>
  );
}
