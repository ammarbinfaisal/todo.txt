import { openDB, type DBSchema, type IDBPDatabase } from "idb";

import type { ChangeEntry } from "@/types/history";
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
  history: {
    key: number;
    value: ChangeEntry;
    indexes: { "by-seq": number };
  };
}

let dbPromise: Promise<IDBPDatabase<TodoTxtDB>> | null = null;

function getDb(): Promise<IDBPDatabase<TodoTxtDB>> {
  if (typeof window === "undefined") {
    return Promise.reject(new Error("IndexedDB is not available on the server."));
  }

  if (!dbPromise) {
    dbPromise = openDB<TodoTxtDB>("todotxt", 3, {
      upgrade(db, oldVersion) {
        if (oldVersion < 1) {
          const store = db.createObjectStore("todos", { keyPath: "id" });
          store.createIndex("by-updatedAt", "updatedAt");
          store.createIndex("by-createdAt", "createdAt");
        }
        if (oldVersion < 2) {
          db.createObjectStore("projects", { keyPath: "name" });
        }
        if (oldVersion < 3) {
          const historyStore = db.createObjectStore("history", {
            keyPath: "id",
            autoIncrement: true,
          });
          historyStore.createIndex("by-seq", "seq", { unique: true });
        }
      },
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

// --- History ---

export async function dbAddChangeEntry(entry: ChangeEntry): Promise<number> {
  const db = await getDb();
  return (await db.add("history", entry)) as number;
}

export async function dbGetAllChangeEntries(): Promise<ChangeEntry[]> {
  const db = await getDb();
  return db.getAllFromIndex("history", "by-seq");
}

export async function dbDeleteChangeEntriesAboveSeq(seq: number): Promise<void> {
  const db = await getDb();
  const tx = db.transaction("history", "readwrite");
  const index = tx.store.index("by-seq");
  let cursor = await index.openCursor(IDBKeyRange.lowerBound(seq, true));
  while (cursor) {
    await cursor.delete();
    cursor = await cursor.continue();
  }
  await tx.done;
}

export async function dbDeleteOldestChangeEntries(keepCount: number): Promise<void> {
  const db = await getDb();
  const tx = db.transaction("history", "readwrite");
  const index = tx.store.index("by-seq");
  const totalCount = await index.count();
  if (totalCount <= keepCount) {
    await tx.done;
    return;
  }
  const deleteCount = totalCount - keepCount;
  let cursor = await index.openCursor();
  let deleted = 0;
  while (cursor && deleted < deleteCount) {
    await cursor.delete();
    deleted++;
    cursor = await cursor.continue();
  }
  await tx.done;
}

export async function dbClearHistory(): Promise<void> {
  const db = await getDb();
  await db.clear("history");
}
