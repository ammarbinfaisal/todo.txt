"use client";

import { useState } from "react";
import { ArrowLeft, Moon, Sun, Square, HelpCircle } from "lucide-react";
import Link from "next/link";
import { useMountEffect } from "@/hooks/useMountEffect";
import { useSettingsStore } from "@/stores/settings-store";
import { useThemeStore, type Theme } from "@/stores/theme-store";

const THEMES: { key: Theme; icon: typeof Sun; label: string }[] = [
  { key: "light", icon: Sun, label: "Light" },
  { key: "beige", icon: Square, label: "Beige" },
  { key: "dark", icon: Moon, label: "Dark" },
];

export function SettingsPage() {
  const theme = useThemeStore((s) => s.theme);
  const setTheme = useThemeStore((s) => s.setTheme);
  const hydrateTheme = useThemeStore((s) => s.hydrateFromStorage);

  const projectPrefix = useSettingsStore((s) => s.projectPrefix);
  const contextPrefix = useSettingsStore((s) => s.contextPrefix);
  const updateSettings = useSettingsStore((s) => s.update);
  const loadSettings = useSettingsStore((s) => s.load);

  const [ppDraft, setPpDraft] = useState(projectPrefix);
  const [cpDraft, setCpDraft] = useState(contextPrefix);

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

  return (
    <div className="flex min-h-dvh flex-col bg-[var(--bg)] text-[var(--fg)]">
      {/* Header */}
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
              <label className="mb-1 block text-sm text-[var(--muted)]">
                Project prefix
              </label>
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
              <label className="mb-1 block text-sm text-[var(--muted)]">
                Context prefix
              </label>
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
            <p className="text-xs text-[var(--muted)]">
              Priority uses <code className="rounded bg-[var(--chip)] px-1">A-</code> format.
              Example: <code className="rounded bg-[var(--chip)] px-1">A- Buy milk {ppDraft}Home</code>
            </p>
          </div>
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
