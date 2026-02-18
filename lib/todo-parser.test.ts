import { describe, expect, it } from "vitest";

import { parseTodoLine, serializeTodoLine } from "./todo-parser";

describe("todo parser", () => {
  it("parses plain text", () => {
    expect(parseTodoLine("Buy milk")).toEqual({
      completed: false,
      completionDate: undefined,
      priority: undefined,
      creationDate: undefined,
      text: "Buy milk",
      projects: [],
      contexts: [],
      meta: {}
    });
  });

  it("parses completion marker with date", () => {
    expect(parseTodoLine("x 2026-02-18 Done thing")).toMatchObject({
      completed: true,
      completionDate: "2026-02-18",
      text: "Done thing"
    });
  });

  it("parses priority and creation date", () => {
    expect(parseTodoLine("(A) 2026-02-18 Call dentist +Health @phone")).toEqual({
      completed: false,
      completionDate: undefined,
      priority: "A",
      creationDate: "2026-02-18",
      text: "Call dentist",
      projects: ["Health"],
      contexts: ["phone"],
      meta: {}
    });
  });

  it("parses metadata key:value", () => {
    expect(parseTodoLine("Pay rent +Home due:2026-03-01 rec:+1m")).toEqual({
      completed: false,
      completionDate: undefined,
      priority: undefined,
      creationDate: undefined,
      text: "Pay rent",
      projects: ["Home"],
      contexts: [],
      meta: { due: "2026-03-01", rec: "+1m" }
    });
  });

  it("serializes back to a valid line", () => {
    const parsed = parseTodoLine("x 2026-02-18 (B) 2026-02-01 Fix bug +App @work due:2026-02-20");
    const line = serializeTodoLine(parsed);

    expect(line.startsWith("x 2026-02-18")).toBe(true);
    expect(line).toContain("(B)");
    expect(line).toContain("2026-02-01");
    expect(line).toContain("Fix bug");
    expect(line).toContain("+App");
    expect(line).toContain("@work");
    expect(line).toContain("due:2026-02-20");
  });
});

