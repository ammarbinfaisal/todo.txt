"use client";

import { create } from "zustand";
import { immer } from "zustand/middleware/immer";

import { dbDeleteTodo, dbGetAllTodos, dbPutTodo } from "@/lib/db";
import { applyRedo, applyUndo } from "@/lib/history-actions";
import { parseTodoLine, serializeTodoLine, type ParseOptions, type SerializeOptions } from "@/lib/todo-parser";
import { useHistoryStore } from "@/stores/history-store";
import { useSettingsStore } from "@/stores/settings-store";
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

  load: () => Promise<void>;
  add: (line: string) => Promise<void>;
  updateLine: (id: string, line: string) => Promise<void>;
  toggleCompleted: (id: string) => Promise<void>;
  remove: (id: string) => Promise<void>;
  toggleProject: (id: string, project: string) => Promise<void>;
  bulkComplete: (ids: string[]) => Promise<void>;
  bulkDelete: (ids: string[]) => Promise<void>;
  bulkAddProject: (ids: string[], project: string) => Promise<void>;
  reorder: (fromIndex: number, toIndex: number) => void;
  performUndo: () => Promise<void>;
  performRedo: () => Promise<void>;
  exportTodoTxt: () => string;
  setStatusFilter: (status: StatusFilter) => void;
  setPriorityFilter: (priority?: TodoPriority) => void;
}

function nowIso() {
  return new Date().toISOString();
}

function prefixOpts(): ParseOptions & SerializeOptions {
  const { projectPrefix, contextPrefix } = useSettingsStore.getState();
  return { projectPrefix, contextPrefix };
}

function createTodoFromLine(line: string): Todo {
  const opts = prefixOpts();
  const parsed = parseTodoLine(line, opts);
  const normalizedLine = serializeTodoLine(parsed, opts);
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
    updatedAt: timestamp,
  };
}

function updateTodoFromLine(existing: Todo, line: string): Todo {
  const opts = prefixOpts();
  const parsed = parseTodoLine(line, opts);
  const normalizedLine = serializeTodoLine(parsed, opts);
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
    updatedAt: nowIso(),
  };
}

const history = () => useHistoryStore.getState();

export const useTodoStore = create<TodoState>()(
  immer((set, get) => ({
    todos: [],
    loading: false,
    error: undefined,
    filters: { status: "all" },

    load: async () => {
      set((s) => {
        s.loading = true;
        s.error = undefined;
      });
      try {
        const raw = await dbGetAllTodos();
        const opts = prefixOpts();
        // Re-derive internal fields from DSL line (source of truth)
        const todos = raw.map((t) => {
          const parsed = parseTodoLine(t.line, opts);
          return {
            ...t,
            completed: parsed.completed,
            completionDate: parsed.completionDate,
            priority: parsed.priority,
            creationDate: parsed.creationDate,
            text: parsed.text,
            projects: parsed.projects,
            contexts: parsed.contexts,
            meta: parsed.meta,
          };
        });
        todos.sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
        set((s) => {
          s.todos = todos;
          s.loading = false;
        });
      } catch (err) {
        set((s) => {
          s.loading = false;
          s.error = err instanceof Error ? err.message : "Failed to load todos.";
        });
      }
    },

    exportTodoTxt: () => get().todos.map((t) => t.line).join("\n"),

    add: async (line) => {
      const trimmed = line.trim();
      if (!trimmed) return;
      const todo = createTodoFromLine(trimmed);
      await dbPutTodo(todo);
      set((s) => {
        s.todos.unshift(todo);
      });
      await history().push(
        { type: "add", todoId: todo.id, todo },
        `Add: ${todo.text.slice(0, 40)}`
      );
    },

    updateLine: async (id, line) => {
      const trimmed = line.trim();
      if (!trimmed) return;
      const current = get().todos.find((t) => t.id === id);
      if (!current) return;
      const previousTodo = { ...current };
      const updated = updateTodoFromLine(current, trimmed);
      await dbPutTodo(updated);
      set((s) => {
        const idx = s.todos.findIndex((t) => t.id === id);
        if (idx !== -1) s.todos[idx] = updated;
      });
      await history().push(
        { type: "updateLine", todoId: id, previousTodo, updatedTodo: updated },
        `Edit: ${previousTodo.text.slice(0, 40)}`
      );
    },

    toggleCompleted: async (id) => {
      const current = get().todos.find((t) => t.id === id);
      if (!current) return;
      const previousTodo = { ...current };
      const completionDate = !current.completed ? nowIso().slice(0, 10) : undefined;
      const line = serializeTodoLine({
        completed: !current.completed,
        completionDate,
        priority: current.priority,
        creationDate: current.creationDate,
        text: current.text,
        projects: current.projects,
        contexts: current.contexts,
        meta: current.meta,
      }, prefixOpts());
      const updated = updateTodoFromLine(current, line);
      await dbPutTodo(updated);
      set((s) => {
        const idx = s.todos.findIndex((t) => t.id === id);
        if (idx !== -1) s.todos[idx] = updated;
      });
      await history().push(
        { type: "toggleCompleted", todoId: id, previousTodo, updatedTodo: updated },
        `${updated.completed ? "Complete" : "Uncomplete"}: ${current.text.slice(0, 40)}`
      );
    },

    remove: async (id) => {
      const index = get().todos.findIndex((t) => t.id === id);
      const todo = get().todos[index];
      if (!todo) return;
      const previousTodo = { ...todo };
      await dbDeleteTodo(id);
      set((s) => {
        s.todos = s.todos.filter((t) => t.id !== id);
      });
      await history().push(
        { type: "delete", previousTodo, previousIndex: index },
        `Delete: ${todo.text.slice(0, 40)}`
      );
    },

    toggleProject: async (id, project) => {
      const current = get().todos.find((t) => t.id === id);
      if (!current) return;
      const previousTodo = { ...current };
      const hasProject = current.projects.includes(project);
      const newProjects = hasProject
        ? current.projects.filter((p) => p !== project)
        : [...current.projects, project];
      const line = serializeTodoLine({
        completed: current.completed,
        completionDate: current.completionDate,
        priority: current.priority,
        creationDate: current.creationDate,
        text: current.text,
        projects: newProjects,
        contexts: current.contexts,
        meta: current.meta,
      }, prefixOpts());
      const updated = updateTodoFromLine(current, line);
      await dbPutTodo(updated);
      set((s) => {
        const idx = s.todos.findIndex((t) => t.id === id);
        if (idx !== -1) s.todos[idx] = updated;
      });
      await history().push(
        { type: "toggleProject", todoId: id, previousTodo, updatedTodo: updated },
        `${hasProject ? "Remove" : "Add"} +${project}`
      );
    },

    bulkComplete: async (ids) => {
      const idSet = new Set(ids);
      const todosToUpdate = get().todos.filter((t) => idSet.has(t.id) && !t.completed);
      const items: Array<{ previousTodo: Todo; updatedTodo: Todo; index: number }> = [];
      for (const current of todosToUpdate) {
        const previousTodo = { ...current };
        const line = serializeTodoLine({
          completed: true,
          completionDate: nowIso().slice(0, 10),
          priority: current.priority,
          creationDate: current.creationDate,
          text: current.text,
          projects: current.projects,
          contexts: current.contexts,
          meta: current.meta,
        }, prefixOpts());
        const updated = updateTodoFromLine(current, line);
        await dbPutTodo(updated);
        const index = get().todos.findIndex((t) => t.id === current.id);
        items.push({ previousTodo, updatedTodo: updated, index });
        set((s) => {
          const idx = s.todos.findIndex((t) => t.id === current.id);
          if (idx !== -1) s.todos[idx] = updated;
        });
      }
      if (items.length > 0) {
        await history().push(
          { type: "bulkComplete", items },
          `Complete ${items.length} todo${items.length > 1 ? "s" : ""}`
        );
      }
    },

    bulkDelete: async (ids) => {
      const items: Array<{ previousTodo: Todo; index: number }> = [];
      for (const id of ids) {
        const index = get().todos.findIndex((t) => t.id === id);
        const todo = get().todos[index];
        if (todo) {
          items.push({ previousTodo: { ...todo }, index });
          await dbDeleteTodo(id);
        }
      }
      set((s) => {
        const idSet = new Set(ids);
        s.todos = s.todos.filter((t) => !idSet.has(t.id));
      });
      if (items.length > 0) {
        await history().push(
          { type: "bulkDelete", items },
          `Delete ${items.length} todo${items.length > 1 ? "s" : ""}`
        );
      }
    },

    bulkAddProject: async (ids, project) => {
      const idSet = new Set(ids);
      const todosToUpdate = get().todos.filter(
        (t) => idSet.has(t.id) && !t.projects.includes(project)
      );
      const items: Array<{ previousTodo: Todo; updatedTodo: Todo; index: number }> = [];
      for (const current of todosToUpdate) {
        const previousTodo = { ...current };
        const line = serializeTodoLine({
          completed: current.completed,
          completionDate: current.completionDate,
          priority: current.priority,
          creationDate: current.creationDate,
          text: current.text,
          projects: [...current.projects, project],
          contexts: current.contexts,
          meta: current.meta,
        }, prefixOpts());
        const updated = updateTodoFromLine(current, line);
        await dbPutTodo(updated);
        const index = get().todos.findIndex((t) => t.id === current.id);
        items.push({ previousTodo, updatedTodo: updated, index });
        set((s) => {
          const idx = s.todos.findIndex((t) => t.id === current.id);
          if (idx !== -1) s.todos[idx] = updated;
        });
      }
      if (items.length > 0) {
        await history().push(
          { type: "bulkAddProject", items },
          `Tag ${items.length} todo${items.length > 1 ? "s" : ""} +${project}`
        );
      }
    },

    reorder: (fromIndex, toIndex) => {
      set((s) => {
        const [item] = s.todos.splice(fromIndex, 1);
        s.todos.splice(toIndex, 0, item);
      });
      void history().push(
        { type: "reorder", fromIndex, toIndex },
        "Reorder"
      );
    },

    performUndo: async () => {
      const entry = history().undo();
      if (!entry) return;
      await applyUndo(entry.action, set);
    },

    performRedo: async () => {
      const entry = history().redo();
      if (!entry) return;
      await applyRedo(entry.action, set);
    },

    setStatusFilter: (status) => {
      set((s) => {
        s.filters.status = status;
      });
    },

    setPriorityFilter: (priority) => {
      set((s) => {
        s.filters.priority = priority;
      });
    },
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
