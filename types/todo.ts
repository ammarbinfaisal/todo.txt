export type TodoPriority =
  | "A"
  | "B"
  | "C"
  | "D"
  | "E"
  | "F"
  | "G"
  | "H"
  | "I"
  | "J"
  | "K"
  | "L"
  | "M"
  | "N"
  | "O"
  | "P"
  | "Q"
  | "R"
  | "S"
  | "T"
  | "U"
  | "V"
  | "W"
  | "X"
  | "Y"
  | "Z";

export type TodoMeta = Record<string, string>;

export interface Todo {
  id: string;
  line: string;

  completed: boolean;
  completionDate?: string;

  priority?: TodoPriority;
  creationDate?: string;

  text: string;
  projects: string[];
  contexts: string[];
  meta: TodoMeta;

  createdAt: string;
  updatedAt: string;
}

export type TodoDraft = Omit<Todo, "createdAt" | "updatedAt">;

