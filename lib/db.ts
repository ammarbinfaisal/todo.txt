import { openDB, type DBSchema, type IDBPDatabase } from "idb";

import type { ProjectConfig } from "@/types/project";
import type { Todo } from "@/types/todo";

interface TodoTxtDB extends DBSchema {
  todos: {
    key: string;
    value: Todo;
    indexes: { "by-updatedAt": string; "by-createdAt": string };
  };
  projects: {
    key: string;
    value: ProjectConfig;
  };
}

let dbPromise: Promise<IDBPDatabase<TodoTxtDB>> | null = null;

function getDb(): Promise<IDBPDatabase<TodoTxtDB>> {
  if (typeof window === "undefined") {
    return Promise.reject(new Error("IndexedDB is not available on the server."));
  }

  if (!dbPromise) {
    dbPromise = openDB<TodoTxtDB>("todotxt", 2, {
      upgrade(db, oldVersion) {
        if (oldVersion < 1) {
          const store = db.createObjectStore("todos", { keyPath: "id" });
          store.createIndex("by-updatedAt", "updatedAt");
          store.createIndex("by-createdAt", "createdAt");
        }
        if (oldVersion < 2) {
          db.createObjectStore("projects", { keyPath: "name" });
        }
      }
    });
  }

  return dbPromise;
}

// --- Todos ---

export async function dbGetAllTodos(): Promise<Todo[]> {
  const db = await getDb();
  return db.getAll("todos");
}

export async function dbPutTodo(todo: Todo): Promise<void> {
  const db = await getDb();
  await db.put("todos", todo);
}

export async function dbDeleteTodo(id: string): Promise<void> {
  const db = await getDb();
  await db.delete("todos", id);
}

export async function dbClearTodos(): Promise<void> {
  const db = await getDb();
  await db.clear("todos");
}

// --- Projects ---

export async function dbGetAllProjectConfigs(): Promise<ProjectConfig[]> {
  const db = await getDb();
  return db.getAll("projects");
}

export async function dbPutProjectConfig(config: ProjectConfig): Promise<void> {
  const db = await getDb();
  await db.put("projects", config);
}

export async function dbDeleteProjectConfig(name: string): Promise<void> {
  const db = await getDb();
  await db.delete("projects", name);
}
