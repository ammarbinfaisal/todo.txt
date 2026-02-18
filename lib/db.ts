import { openDB, type DBSchema, type IDBPDatabase } from "idb";

import type { Todo } from "@/types/todo";

interface TodoTxtDB extends DBSchema {
  todos: {
    key: string;
    value: Todo;
    indexes: { "by-updatedAt": string; "by-createdAt": string };
  };
}

let dbPromise: Promise<IDBPDatabase<TodoTxtDB>> | null = null;

function getDb(): Promise<IDBPDatabase<TodoTxtDB>> {
  if (typeof window === "undefined") {
    return Promise.reject(new Error("IndexedDB is not available on the server."));
  }

  if (!dbPromise) {
    dbPromise = openDB<TodoTxtDB>("todotxt", 1, {
      upgrade(db) {
        const store = db.createObjectStore("todos", { keyPath: "id" });
        store.createIndex("by-updatedAt", "updatedAt");
        store.createIndex("by-createdAt", "createdAt");
      }
    });
  }

  return dbPromise;
}

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

