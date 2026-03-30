import type { TodoMeta, TodoPriority } from "@/types/todo";

const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;
const OLD_PRIORITY_RE = /^\([A-Z]\)$/;
const NEW_PRIORITY_RE = /^[A-Z]-$/;
const META_RE = /^[^:\s]+:[^\s]+$/;

export interface ParseOptions {
  projectPrefix?: string;
  contextPrefix?: string;
}

export interface ParsedTodoLine {
  completed: boolean;
  completionDate?: string;
  priority?: TodoPriority;
  creationDate?: string;
  text: string;
  projects: string[];
  contexts: string[];
  meta: TodoMeta;
}

export function parseTodoLine(
  line: string,
  opts: ParseOptions = {}
): ParsedTodoLine {
  const pp = opts.projectPrefix ?? "+";
  const cp = opts.contextPrefix ?? "@";
  const trimmed = line.trim();

  if (trimmed.length === 0) {
    return {
      completed: false,
      text: "",
      projects: [],
      contexts: [],
      meta: {},
    };
  }

  const tokens = trimmed.split(/\s+/);
  let index = 0;

  let completed = false;
  let completionDate: string | undefined;
  let priority: TodoPriority | undefined;
  let creationDate: string | undefined;

  if (tokens[index] === "x") {
    completed = true;
    index += 1;
    if (tokens[index] && DATE_RE.test(tokens[index])) {
      completionDate = tokens[index];
      index += 1;
    }
  }

  // New format: A- (letter + dash)
  if (tokens[index] && NEW_PRIORITY_RE.test(tokens[index])) {
    priority = tokens[index].charAt(0) as TodoPriority;
    index += 1;
  }
  // Old format: (A)
  else if (tokens[index] && OLD_PRIORITY_RE.test(tokens[index])) {
    priority = tokens[index].slice(1, 2) as TodoPriority;
    index += 1;
  }

  if (tokens[index] && DATE_RE.test(tokens[index])) {
    creationDate = tokens[index];
    index += 1;
  }

  const projects: string[] = [];
  const contexts: string[] = [];
  const meta: TodoMeta = {};
  const textTokens: string[] = [];

  for (; index < tokens.length; index += 1) {
    const token = tokens[index];
    if (token.startsWith(pp) && token.length > pp.length) {
      // Support prefix+foo+bar → multiple projects (split on prefix char)
      const rest = token.slice(pp.length);
      const parts = rest.split(pp).filter((s) => s.length > 0);
      for (const part of parts) projects.push(part);
      continue;
    }
    if (token.startsWith(cp) && token.length > cp.length) {
      contexts.push(token.slice(cp.length));
      continue;
    }
    if (META_RE.test(token)) {
      const splitAt = token.indexOf(":");
      const key = token.slice(0, splitAt);
      const value = token.slice(splitAt + 1);
      if (key.length > 0 && value.length > 0) meta[key] = value;
      continue;
    }
    textTokens.push(token);
  }

  return {
    completed,
    completionDate,
    priority,
    creationDate,
    text: textTokens.join(" "),
    projects,
    contexts,
    meta,
  };
}

export interface SerializeOptions {
  projectPrefix?: string;
  contextPrefix?: string;
}

export type SerializeTodoParts = ParsedTodoLine;

export function serializeTodoLine(
  parts: SerializeTodoParts,
  opts: SerializeOptions = {}
): string {
  const pp = opts.projectPrefix ?? "+";
  const cp = opts.contextPrefix ?? "@";
  const tokens: string[] = [];

  if (parts.completed) {
    tokens.push("x");
    if (parts.completionDate) tokens.push(parts.completionDate);
  }

  if (parts.priority) tokens.push(`${parts.priority}-`);
  if (parts.creationDate) tokens.push(parts.creationDate);

  if (parts.text.trim().length > 0) tokens.push(parts.text.trim());

  for (const project of parts.projects) {
    if (project.trim().length > 0) tokens.push(`${pp}${project.trim()}`);
  }
  for (const context of parts.contexts) {
    if (context.trim().length > 0) tokens.push(`${cp}${context.trim()}`);
  }
  for (const [key, value] of Object.entries(parts.meta)) {
    if (key.trim().length > 0 && value.trim().length > 0) {
      tokens.push(`${key.trim()}:${value.trim()}`);
    }
  }

  return tokens.join(" ").trim();
}
