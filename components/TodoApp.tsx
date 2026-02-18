"use client";

import type { CSSProperties } from "react";
import { useEffect, useMemo, useState } from "react";

import { AppHeader } from "@/components/AppHeader";
import { BottomBar } from "@/components/BottomBar";
import { TodoDrawer } from "@/components/TodoDrawer";
import { TodoItem } from "@/components/TodoItem";
import { UndoToast } from "@/components/UndoToast";
import { useThemeStore } from "@/stores/theme-store";
import { selectFilteredTodos, useTodoStore } from "@/stores/todo-store";

export function TodoApp() {
  const [input, setInput] = useState("");
  const [openTodoId, setOpenTodoId] = useState<string | null>(null);
  const [drawerDraft, setDrawerDraft] = useState("");

  const theme = useThemeStore((s) => s.theme);
  const cycleTheme = useThemeStore((s) => s.cycle);
  const hydrateTheme = useThemeStore((s) => s.hydrateFromStorage);

  const allTodos = useTodoStore((s) => s.todos);
  const loading = useTodoStore((s) => s.loading);
  const error = useTodoStore((s) => s.error);
  const filters = useTodoStore((s) => s.filters);
  const load = useTodoStore((s) => s.load);
  const add = useTodoStore((s) => s.add);
  const toggleCompleted = useTodoStore((s) => s.toggleCompleted);
  const updateLine = useTodoStore((s) => s.updateLine);
  const removeWithUndo = useTodoStore((s) => s.removeWithUndo);
  const exportTodoTxt = useTodoStore((s) => s.exportTodoTxt);
  const setStatusFilter = useTodoStore((s) => s.setStatusFilter);
  const setPriorityFilter = useTodoStore((s) => s.setPriorityFilter);

  useEffect(() => {
    hydrateTheme();
  }, [hydrateTheme]);

  useEffect(() => {
    void load();
  }, [load]);

  const counts = useMemo(() => {
    const done = allTodos.filter((t) => t.completed).length;
    const active = allTodos.length - done;
    return { active, done, total: allTodos.length };
  }, [allTodos]);

  const todos = useMemo(
    () => selectFilteredTodos({ todos: allTodos, filters }),
    [allTodos, filters]
  );

  const openTodo = useMemo(() => {
    if (!openTodoId) return undefined;
    return allTodos.find((t) => t.id === openTodoId);
  }, [allTodos, openTodoId]);

  return (
    <div
      className="flex min-h-dvh flex-col"
      style={
        {
          ["--drawer-w" as unknown as keyof CSSProperties]: "18rem",
          ["--drawer-shift" as unknown as keyof CSSProperties]: "12rem"
        } as CSSProperties
      }
    >
      <AppHeader
        counts={{ active: counts.active, done: counts.done }}
        theme={theme}
        onCycleTheme={cycleTheme}
        filters={filters}
        onStatusChange={setStatusFilter}
        onPriorityChange={setPriorityFilter}
      />

      <section className="relative flex-1 overflow-hidden">
        <TodoDrawer
          open={!!openTodoId}
          todo={openTodo}
          draft={drawerDraft}
          onDraftChange={setDrawerDraft}
          onClose={() => {
            setOpenTodoId(null);
            setDrawerDraft("");
          }}
          onSaveLine={async (line) => {
            if (!openTodoId) return;
            await updateLine(openTodoId, line);
            setOpenTodoId(null);
            setDrawerDraft("");
          }}
          onCopyLine={async (line) => {
            const value = line.trim();
            if (!value) return;
            await navigator.clipboard.writeText(value);
          }}
        />

        <div
          className="h-full"
          style={{
            transform: openTodoId ? "translateX(var(--drawer-shift))" : undefined,
            transition: "transform 200ms ease-out"
          }}
        >
        {error && (
          <div className="px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}

        {loading ? (
          <div className="px-4 py-4 text-sm text-[var(--muted)]">
            Loading…
          </div>
        ) : todos.length === 0 ? (
          <div className="px-4 py-4 text-sm text-[var(--muted)]">
            No todos yet.
          </div>
        ) : (
          <ul>
            {todos.map((todo) => (
              <TodoItem
                key={todo.id}
                todo={todo}
                onToggle={() => void toggleCompleted(todo.id)}
                onDelete={() => void removeWithUndo(todo.id)}
                onOpen={() => {
                  setOpenTodoId(todo.id);
                  setDrawerDraft(todo.line);
                }}
              />
            ))}
          </ul>
        )}
        </div>
      </section>

      <BottomBar
        input={input}
        onInputChange={setInput}
        onAdd={async () => {
          const value = input.trim();
          if (!value) return;
          await add(value);
          setInput("");
        }}
        onCopyAll={async () => {
          const text = exportTodoTxt().trim();
          await navigator.clipboard.writeText(text.length ? `${text}\n` : "");
        }}
        onDownloadAll={() => {
          const text = exportTodoTxt();
          const blob = new Blob([text.length ? `${text}\n` : ""], { type: "text/plain;charset=utf-8" });
          const url = URL.createObjectURL(blob);
          const a = document.createElement("a");
          a.href = url;
          a.download = "todo.txt";
          document.body.appendChild(a);
          a.click();
          a.remove();
          URL.revokeObjectURL(url);
        }}
      />

      <UndoToast />
    </div>
  );
}
