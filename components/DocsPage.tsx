"use client";

import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { useMountEffect } from "@/hooks/useMountEffect";
import { useThemeStore } from "@/stores/theme-store";

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="space-y-2">
      <h2 className="text-base font-semibold">{title}</h2>
      {children}
    </section>
  );
}

function Code({ children }: { children: React.ReactNode }) {
  return (
    <code className="rounded bg-[var(--chip)] px-1 py-0.5 text-sm text-[var(--chip-fg)]">
      {children}
    </code>
  );
}

function Example({ text, note }: { text: string; note: string }) {
  return (
    <div className="rounded-md border border-[var(--border)] bg-[var(--surface)] px-3 py-2">
      <div className="font-mono text-sm">{text}</div>
      <div className="mt-1 text-xs text-[var(--muted)]">{note}</div>
    </div>
  );
}

export function DocsPage() {
  const hydrateTheme = useThemeStore((s) => s.hydrateFromStorage);
  useMountEffect(() => {
    hydrateTheme();
  });

  return (
    <div className="flex min-h-dvh flex-col bg-[var(--bg)] text-[var(--fg)]">
      <header className="sticky top-0 z-10 flex items-center gap-2 border-b border-[var(--border)] bg-[var(--surface)] px-2 py-2">
        <Link
          href="/settings"
          className="flex h-10 w-10 items-center justify-center rounded-md text-[var(--muted)]"
          aria-label="Back to settings"
        >
          <ArrowLeft size={18} />
        </Link>
        <span className="text-base font-semibold">How to use TodoTXT</span>
      </header>

      <div className="flex-1 space-y-6 px-4 py-4 text-sm leading-relaxed">
        <Section title="Writing a todo">
          <p>
            Each todo is a single line of text. Just type what you need to do
            and hit enter.
          </p>
          <Example
            text="Buy groceries"
            note="Simple todo, no extras"
          />
        </Section>

        <Section title="Priority">
          <p>
            Start with a letter and a dash to set urgency.{" "}
            <Code>A-</Code> is the most urgent, <Code>D-</Code> is low priority.
          </p>
          <Example
            text="A- Fix the login bug"
            note="Urgent priority (A)"
          />
          <Example
            text="C- Read that article"
            note="Medium priority (C)"
          />
          <p className="text-[var(--muted)]">
            The colored bar next to each todo shows its priority level.
          </p>
        </Section>

        <Section title="Projects (tags)">
          <p>
            Add <Code>+ProjectName</Code> anywhere in your todo to tag it with
            a project. You can have multiple projects on one todo.
          </p>
          <Example
            text="A- Fix login bug +AppV2 +Backend"
            note="Tagged with two projects"
          />
          <p>
            The project prefix (<Code>+</Code> by default) can be changed in
            Settings. Some people prefer <Code>#</Code> or <Code>/</Code>.
          </p>
          <p>
            You can even write them without spaces:{" "}
            <Code>+Work+Urgent</Code> creates two tags.
          </p>
        </Section>

        <Section title="Contexts">
          <p>
            Add <Code>@context</Code> to note where or how you will do
            something.
          </p>
          <Example
            text="Call dentist @phone"
            note="Do this when you have your phone"
          />
          <p className="text-[var(--muted)]">
            The context prefix (<Code>@</Code> by default) is also customizable in Settings.
          </p>
        </Section>

        <Section title="Metadata">
          <p>
            Add <Code>key:value</Code> pairs for extra info like due dates.
          </p>
          <Example
            text="A- Submit report +Work due:2026-04-01"
            note="Due date as metadata"
          />
        </Section>

        <Section title="Gestures">
          <p>This app is designed for your thumb. Everything is a tap or swipe.</p>
          <div className="space-y-2">
            <div className="flex items-start gap-3 rounded-md border border-[var(--border)] bg-[var(--surface)] px-3 py-2">
              <span className="mt-0.5 shrink-0 font-semibold text-[var(--muted)]">Tap</span>
              <span>Opens a fan of action icons right where you tapped — complete, edit, tag, or delete.</span>
            </div>
            <div className="flex items-start gap-3 rounded-md border border-[var(--border)] bg-[var(--surface)] px-3 py-2">
              <span className="mt-0.5 shrink-0 font-semibold text-[var(--muted)]">Swipe right</span>
              <span>Mark a todo as done (or undo it). You will feel a small vibration at the threshold.</span>
            </div>
            <div className="flex items-start gap-3 rounded-md border border-[var(--border)] bg-[var(--surface)] px-3 py-2">
              <span className="mt-0.5 shrink-0 font-semibold text-[var(--muted)]">Long press</span>
              <span>Enter selection mode. Tap more todos to select them, then use the bar at the bottom for bulk actions.</span>
            </div>
          </div>
        </Section>

        <Section title="The arc menu">
          <p>
            When you tap a todo, four icons fan out in a semicircle below your finger:
          </p>
          <ul className="list-inside list-disc space-y-1 text-[var(--muted)]">
            <li><strong className="text-[var(--fg)]">Check</strong> — mark as done</li>
            <li><strong className="text-[var(--fg)]">Pencil</strong> — edit the todo inline (the row expands into an input)</li>
            <li><strong className="text-[var(--fg)]">Tag</strong> — add or remove project tags</li>
            <li><strong className="text-[var(--fg)]">Trash</strong> — delete (you can undo this)</li>
          </ul>
        </Section>

        <Section title="Batch actions">
          <p>
            Long-press any todo to enter selection mode. Then tap others to
            select them. A bar appears at the bottom with:
          </p>
          <ul className="list-inside list-disc space-y-1 text-[var(--muted)]">
            <li><strong className="text-[var(--fg)]">Select all</strong> — selects every visible todo</li>
            <li><strong className="text-[var(--fg)]">Complete</strong> — marks all selected as done</li>
            <li><strong className="text-[var(--fg)]">Tag</strong> — add a project to all selected</li>
            <li><strong className="text-[var(--fg)]">Delete</strong> — removes all selected</li>
          </ul>
          <p className="text-[var(--muted)]">
            Selected todos show a strikethrough so you can see what will be affected.
          </p>
        </Section>

        <Section title="Undo and redo">
          <p>
            Every action is recorded. The undo and redo buttons in the bottom
            bar let you step backward and forward through up to 1,000 changes.
          </p>
          <p className="text-[var(--muted)]">
            On desktop: <Code>Ctrl+Z</Code> to undo, <Code>Ctrl+Shift+Z</Code> to redo
            (only when you are not typing in an input).
          </p>
        </Section>

        <Section title="Project colors">
          <p>
            Each project gets a color and a letter badge on the right side of the
            todo row. Tap the badge to change the project's emoji, color, or name.
          </p>
        </Section>

        <div className="pb-8 pt-4 text-center text-xs text-[var(--muted)]">
          TodoTXT PWA — offline-first, gesture-driven
        </div>
      </div>
    </div>
  );
}
