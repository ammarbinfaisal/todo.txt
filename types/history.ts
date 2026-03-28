import type { Todo } from "./todo";

interface AddAction {
  type: "add";
  todoId: string;
  todo: Todo;
}

interface UpdateLineAction {
  type: "updateLine";
  todoId: string;
  previousTodo: Todo;
  updatedTodo: Todo;
}

interface ToggleCompletedAction {
  type: "toggleCompleted";
  todoId: string;
  previousTodo: Todo;
  updatedTodo: Todo;
}

interface DeleteAction {
  type: "delete";
  previousTodo: Todo;
  previousIndex: number;
}

interface ToggleProjectAction {
  type: "toggleProject";
  todoId: string;
  previousTodo: Todo;
  updatedTodo: Todo;
}

interface ReorderAction {
  type: "reorder";
  fromIndex: number;
  toIndex: number;
}

interface BulkCompleteAction {
  type: "bulkComplete";
  items: Array<{ previousTodo: Todo; updatedTodo: Todo; index: number }>;
}

interface BulkDeleteAction {
  type: "bulkDelete";
  items: Array<{ previousTodo: Todo; index: number }>;
}

interface BulkAddProjectAction {
  type: "bulkAddProject";
  items: Array<{ previousTodo: Todo; updatedTodo: Todo; index: number }>;
}

export type ChangeAction =
  | AddAction
  | UpdateLineAction
  | ToggleCompletedAction
  | DeleteAction
  | ToggleProjectAction
  | ReorderAction
  | BulkCompleteAction
  | BulkDeleteAction
  | BulkAddProjectAction;

export interface ChangeEntry {
  id?: number;
  seq: number;
  action: ChangeAction;
  timestamp: string;
  label: string;
}
