"use client";

import { create } from "zustand";
import { immer } from "zustand/middleware/immer";

import { dbDeleteTodo, dbGetAllTodos, dbPutTodo } from "@/lib/db";
import { parseTodoLine, serializeTodoLine } from "@/lib/todo-parser";
import type { Todo, TodoPriority } from "@/types/todo";

type StatusFilter = "all" | "active" | "done";

interface TodoFilters {
  status: StatusFilter;
  priority?: TodoPriority;
}

interface TodoState {
  todos: Todo[];
  loading: boolean;
  error?: string;
  filters: TodoFilters;
  undo?: { todo: Todo; index: number; expiresAt: number };

  load: () => Promise<void>;
  add: (line: string) => Promise<void>;
  updateLine: (id: string, line: string) => Promise<void>;
  toggleCompleted: (id: string) => Promise<void>;
  removeWithUndo: (id: string) => Promise<void>;
  undoRemove: () => Promise<void>;
  clearUndo: () => void;
  exportTodoTxt: () => string;
  setStatusFilter: (status: StatusFilter) => void;
  setPriorityFilter: (priority?: TodoPriority) => void;
}

function nowIso() {
  return new Date().toISOString();
}

function createTodoFromLine(line: string): Todo {
  const parsed = parseTodoLine(line);
  const normalizedLine = serializeTodoLine(parsed);
  const timestamp = nowIso();

  return {
    id: crypto.randomUUID(),
    line: normalizedLine,
    completed: parsed.completed,
    completionDate: parsed.completionDate,
    priority: parsed.priority,
    creationDate: parsed.creationDate,
    text: parsed.text,
    projects: parsed.projects,
    contexts: parsed.contexts,
    meta: parsed.meta,
    createdAt: timestamp,
    updatedAt: timestamp
  };
}

function updateTodoFromLine(existing: Todo, line: string): Todo {
  const parsed = parseTodoLine(line);
  const normalizedLine = serializeTodoLine(parsed);
  return {
    ...existing,
    line: normalizedLine,
    completed: parsed.completed,
    completionDate: parsed.completionDate,
    priority: parsed.priority,
    creationDate: parsed.creationDate,
    text: parsed.text,
    projects: parsed.projects,
    contexts: parsed.contexts,
    meta: parsed.meta,
    updatedAt: nowIso()
  };
}

export const useTodoStore = create<TodoState>()(
  immer((set, get) => ({
    todos: [],
    loading: false,
    error: undefined,
    filters: { status: "all" },
    undo: undefined,

    load: async () => {
      set((state) => {
        state.loading = true;
        state.error = undefined;
      });

      try {
        const todos = await dbGetAllTodos();
        todos.sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
        set((state) => {
          state.todos = todos;
          state.loading = false;
        });
      } catch (err) {
        set((state) => {
          state.loading = false;
          state.error = err instanceof Error ? err.message : "Failed to load todos.";
        });
      }
    },

    exportTodoTxt: () => get().todos.map((t) => t.line).join("\n"),

    add: async (line) => {
      const trimmed = line.trim();
      if (!trimmed) return;
      const todo = createTodoFromLine(trimmed);
      await dbPutTodo(todo);
      set((state) => {
        state.todos.unshift(todo);
      });
    },

    updateLine: async (id, line) => {
      const trimmed = line.trim();
      if (!trimmed) return;
      const current = get().todos.find((t) => t.id === id);
      if (!current) return;
      const updated = updateTodoFromLine(current, trimmed);
      await dbPutTodo(updated);
      set((state) => {
        const idx = state.todos.findIndex((t) => t.id === id);
        if (idx !== -1) state.todos[idx] = updated;
      });
    },

    toggleCompleted: async (id) => {
      const current = get().todos.find((t) => t.id === id);
      if (!current) return;

      const completionDate = !current.completed
        ? nowIso().slice(0, 10)
        : undefined;

      const line = serializeTodoLine({
        completed: !current.completed,
        completionDate,
        priority: current.priority,
        creationDate: current.creationDate,
        text: current.text,
        projects: current.projects,
        contexts: current.contexts,
        meta: current.meta
      });

      const updated = updateTodoFromLine(current, line);
      await dbPutTodo(updated);
      set((state) => {
        const idx = state.todos.findIndex((t) => t.id === id);
        if (idx !== -1) state.todos[idx] = updated;
      });
    },

    clearUndo: () => {
      set((state) => {
        state.undo = undefined;
      });
    },

    removeWithUndo: async (id) => {
      const index = get().todos.findIndex((t) => t.id === id);
      const todo = get().todos[index];
      if (!todo) return;

      await dbDeleteTodo(id);
      const expiresAt = Date.now() + 5000;
      set((state) => {
        state.todos = state.todos.filter((t) => t.id !== id);
        state.undo = { todo, index, expiresAt };
      });
    },

    undoRemove: async () => {
      const undo = get().undo;
      if (!undo) return;
      if (Date.now() > undo.expiresAt) {
        get().clearUndo();
        return;
      }

      await dbPutTodo(undo.todo);
      set((state) => {
        const idx = Math.max(0, Math.min(undo.index, state.todos.length));
        state.todos.splice(idx, 0, undo.todo);
        state.undo = undefined;
      });
    },

    setStatusFilter: (status) => {
      set((state) => {
        state.filters.status = status;
      });
    },

    setPriorityFilter: (priority) => {
      set((state) => {
        state.filters.priority = priority;
      });
    }
  }))
);

export function selectFilteredTodos(state: Pick<TodoState, "todos" | "filters">) {
  const { status, priority } = state.filters;
  return state.todos.filter((todo) => {
    if (status === "active" && todo.completed) return false;
    if (status === "done" && !todo.completed) return false;
    if (priority && todo.priority !== priority) return false;
    return true;
  });
}
