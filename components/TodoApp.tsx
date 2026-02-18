"use client";

import { useEffect, useMemo, useState } from "react";

import { AppHeader } from "@/components/AppHeader";
import { TodoItem } from "@/components/TodoItem";
import { useThemeStore } from "@/stores/theme-store";
import { selectFilteredTodos, useTodoStore } from "@/stores/todo-store";

export function TodoApp() {
  const [input, setInput] = useState("");

  const theme = useThemeStore((s) => s.theme);
  const toggleTheme = useThemeStore((s) => s.toggle);
  const hydrateTheme = useThemeStore((s) => s.hydrateFromStorage);

  const todos = useTodoStore((s) => selectFilteredTodos(s));
  const allTodos = useTodoStore((s) => s.todos);
  const loading = useTodoStore((s) => s.loading);
  const error = useTodoStore((s) => s.error);
  const filters = useTodoStore((s) => s.filters);
  const load = useTodoStore((s) => s.load);
  const add = useTodoStore((s) => s.add);
  const toggleCompleted = useTodoStore((s) => s.toggleCompleted);
  const remove = useTodoStore((s) => s.remove);
  const updateLine = useTodoStore((s) => s.updateLine);
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

  return (
    <>
      <AppHeader
        counts={{ active: counts.active, done: counts.done }}
        theme={theme}
        onToggleTheme={toggleTheme}
        filters={filters}
        onStatusChange={setStatusFilter}
        onPriorityChange={setPriorityFilter}
        input={input}
        onInputChange={setInput}
        onAdd={async () => {
          const value = input.trim();
          if (!value) return;
          await add(value);
          setInput("");
        }}
      />

      <section className="flex-1">
        {error && (
          <div className="px-4 py-3 text-sm text-red-700 dark:text-red-300">
            {error}
          </div>
        )}

        {loading ? (
          <div className="px-4 py-4 text-sm text-neutral-500 dark:text-neutral-400">
            Loading…
          </div>
        ) : todos.length === 0 ? (
          <div className="px-4 py-4 text-sm text-neutral-500 dark:text-neutral-400">
            No todos yet.
          </div>
        ) : (
          <ul className="divide-y divide-neutral-100 dark:divide-neutral-900">
            {todos.map((todo) => (
              <TodoItem
                key={todo.id}
                todo={todo}
                onToggle={() => void toggleCompleted(todo.id)}
                onDelete={() => void remove(todo.id)}
                onUpdateLine={(line) => void updateLine(todo.id, line)}
              />
            ))}
          </ul>
        )}
      </section>
    </>
  );
}
