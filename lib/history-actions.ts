import type { ChangeAction } from "@/types/history";
import type { Todo } from "@/types/todo";
import { dbPutTodo, dbDeleteTodo } from "@/lib/db";

type SetFn = (fn: (state: { todos: Todo[] }) => void) => void;

export async function applyUndo(action: ChangeAction, set: SetFn): Promise<void> {
  switch (action.type) {
    case "add":
      await dbDeleteTodo(action.todoId);
      set((s) => {
        s.todos = s.todos.filter((t) => t.id !== action.todoId);
      });
      break;

    case "updateLine":
    case "toggleCompleted":
    case "toggleProject":
      await dbPutTodo(action.previousTodo);
      set((s) => {
        const idx = s.todos.findIndex((t) => t.id === action.todoId);
        if (idx !== -1) s.todos[idx] = action.previousTodo;
      });
      break;

    case "delete":
      await dbPutTodo(action.previousTodo);
      set((s) => {
        const idx = Math.min(action.previousIndex, s.todos.length);
        s.todos.splice(idx, 0, action.previousTodo);
      });
      break;

    case "reorder":
      set((s) => {
        const [item] = s.todos.splice(action.toIndex, 1);
        s.todos.splice(action.fromIndex, 0, item);
      });
      break;

    case "bulkComplete":
    case "bulkAddProject":
      for (const { previousTodo } of action.items) {
        await dbPutTodo(previousTodo);
      }
      set((s) => {
        for (const { previousTodo } of action.items) {
          const idx = s.todos.findIndex((t) => t.id === previousTodo.id);
          if (idx !== -1) s.todos[idx] = previousTodo;
        }
      });
      break;

    case "bulkDelete": {
      const sorted = [...action.items].sort((a, b) => a.index - b.index);
      for (const { previousTodo } of sorted) {
        await dbPutTodo(previousTodo);
      }
      set((s) => {
        for (const { previousTodo, index } of sorted) {
          const idx = Math.min(index, s.todos.length);
          s.todos.splice(idx, 0, previousTodo);
        }
      });
      break;
    }
  }
}

export async function applyRedo(action: ChangeAction, set: SetFn): Promise<void> {
  switch (action.type) {
    case "add":
      await dbPutTodo(action.todo);
      set((s) => {
        s.todos.unshift(action.todo);
      });
      break;

    case "updateLine":
    case "toggleCompleted":
    case "toggleProject":
      await dbPutTodo(action.updatedTodo);
      set((s) => {
        const idx = s.todos.findIndex((t) => t.id === action.todoId);
        if (idx !== -1) s.todos[idx] = action.updatedTodo;
      });
      break;

    case "delete":
      await dbDeleteTodo(action.previousTodo.id);
      set((s) => {
        s.todos = s.todos.filter((t) => t.id !== action.previousTodo.id);
      });
      break;

    case "reorder":
      set((s) => {
        const [item] = s.todos.splice(action.fromIndex, 1);
        s.todos.splice(action.toIndex, 0, item);
      });
      break;

    case "bulkComplete":
    case "bulkAddProject":
      for (const { updatedTodo } of action.items) {
        await dbPutTodo(updatedTodo);
      }
      set((s) => {
        for (const { updatedTodo } of action.items) {
          const idx = s.todos.findIndex((t) => t.id === updatedTodo.id);
          if (idx !== -1) s.todos[idx] = updatedTodo;
        }
      });
      break;

    case "bulkDelete":
      for (const { previousTodo } of action.items) {
        await dbDeleteTodo(previousTodo.id);
      }
      set((s) => {
        const ids = new Set(action.items.map((i) => i.previousTodo.id));
        s.todos = s.todos.filter((t) => !ids.has(t.id));
      });
      break;
  }
}
