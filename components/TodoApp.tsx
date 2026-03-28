"use client";

import { useEffect, useMemo, useState } from "react";

import { AppHeader } from "@/components/AppHeader";
import { ArcMenu, type ArcAction } from "@/components/ArcMenu";
import { BatchBar } from "@/components/BatchBar";
import { BottomBar } from "@/components/BottomBar";
import { EditSheet } from "@/components/EditSheet";
import { ProjectChipEditor, useProjectChipEditor } from "@/components/ProjectChipEditor";
import { QuickEditPopover } from "@/components/QuickEditPopover";
import { TagPicker } from "@/components/TagPicker";
import { TodoItem } from "@/components/TodoItem";
import { UndoToast } from "@/components/UndoToast";
import { useBatchSelect } from "@/hooks/useBatchSelect";
import { usePopover } from "@/hooks/usePopover";
import { bump, heavy } from "@/lib/haptics";
import { useProjectStore } from "@/stores/project-store";
import { useThemeStore } from "@/stores/theme-store";
import { selectFilteredTodos, useTodoStore } from "@/stores/todo-store";

export function TodoApp() {
  const [input, setInput] = useState("");

  // Theme
  const theme = useThemeStore((s) => s.theme);
  const cycleTheme = useThemeStore((s) => s.cycle);
  const hydrateTheme = useThemeStore((s) => s.hydrateFromStorage);

  // Todos
  const allTodos = useTodoStore((s) => s.todos);
  const loading = useTodoStore((s) => s.loading);
  const error = useTodoStore((s) => s.error);
  const filters = useTodoStore((s) => s.filters);
  const load = useTodoStore((s) => s.load);
  const add = useTodoStore((s) => s.add);
  const toggleCompleted = useTodoStore((s) => s.toggleCompleted);
  const updateLine = useTodoStore((s) => s.updateLine);
  const removeWithUndo = useTodoStore((s) => s.removeWithUndo);
  const exportTodoTxt = useTodoStore((s) => s.exportTodoTxt);
  const setStatusFilter = useTodoStore((s) => s.setStatusFilter);
  const setPriorityFilter = useTodoStore((s) => s.setPriorityFilter);
  const toggleProject = useTodoStore((s) => s.toggleProject);
  const bulkComplete = useTodoStore((s) => s.bulkComplete);
  const bulkDelete = useTodoStore((s) => s.bulkDelete);
  const bulkAddProject = useTodoStore((s) => s.bulkAddProject);

  // Projects
  const loadProjects = useProjectStore((s) => s.load);

  // Arc menu state
  const [arcMenu, setArcMenu] = useState<{
    todoId: string;
    x: number;
    y: number;
  } | null>(null);

  // Quick edit popover
  const quickEdit = usePopover();
  const [quickEditTodoId, setQuickEditTodoId] = useState<string | null>(null);

  // Tag picker popover
  const tagPicker = usePopover();
  const [tagPickerTodoId, setTagPickerTodoId] = useState<string | null>(null);

  // Project chip editor
  const chipEditor = useProjectChipEditor();

  // Edit sheet (full edit)
  const [editSheetTodoId, setEditSheetTodoId] = useState<string | null>(null);

  // Batch select
  const batch = useBatchSelect();

  // Hydrate
  useEffect(() => {
    hydrateTheme();
  }, [hydrateTheme]);

  useEffect(() => {
    void load();
    void loadProjects();
  }, [load, loadProjects]);

  const counts = useMemo(() => {
    const done = allTodos.filter((t) => t.completed).length;
    const active = allTodos.length - done;
    return { active, done, total: allTodos.length };
  }, [allTodos]);

  const todos = useMemo(
    () => selectFilteredTodos({ todos: allTodos, filters }),
    [allTodos, filters]
  );

  const arcTodo = useMemo(
    () => (arcMenu ? allTodos.find((t) => t.id === arcMenu.todoId) : undefined),
    [allTodos, arcMenu]
  );

  const quickEditTodo = useMemo(
    () =>
      quickEditTodoId ? allTodos.find((t) => t.id === quickEditTodoId) : undefined,
    [allTodos, quickEditTodoId]
  );

  const tagPickerTodo = useMemo(
    () =>
      tagPickerTodoId ? allTodos.find((t) => t.id === tagPickerTodoId) : undefined,
    [allTodos, tagPickerTodoId]
  );

  const editSheetTodo = useMemo(
    () =>
      editSheetTodoId ? allTodos.find((t) => t.id === editSheetTodoId) : undefined,
    [allTodos, editSheetTodoId]
  );

  // Arc menu action handler
  const handleArcAction = (action: ArcAction) => {
    if (!arcMenu) return;
    const { todoId, x, y } = arcMenu;
    setArcMenu(null);

    switch (action) {
      case "complete":
        bump();
        void toggleCompleted(todoId);
        break;
      case "delete":
        heavy();
        void removeWithUndo(todoId);
        break;
      case "edit":
        setQuickEditTodoId(todoId);
        quickEdit.open({ clientX: x, clientY: y });
        break;
      case "tag":
        setTagPickerTodoId(todoId);
        tagPicker.open({ clientX: x, clientY: y });
        break;
    }
  };

  return (
    <div className="flex min-h-dvh flex-col">
      <AppHeader
        counts={{ active: counts.active, done: counts.done }}
        theme={theme}
        onCycleTheme={cycleTheme}
        filters={filters}
        onStatusChange={setStatusFilter}
        onPriorityChange={setPriorityFilter}
      />

      <section className="relative flex-1 overflow-y-auto">
        {error && (
          <div className="px-4 py-3 text-sm text-red-700">{error}</div>
        )}

        {loading ? (
          <div className="px-4 py-4 text-sm text-[var(--muted)]">Loading…</div>
        ) : todos.length === 0 ? (
          <div className="px-4 py-4 text-sm text-[var(--muted)]">
            No todos yet.
          </div>
        ) : (
          <ul>
            {todos.map((todo) => (
              <TodoItem
                key={todo.id}
                todo={todo}
                selected={batch.isSelected(todo.id)}
                selectMode={batch.selectMode}
                onTap={(e) => {
                  setArcMenu({
                    todoId: todo.id,
                    x: e.clientX,
                    y: e.clientY,
                  });
                }}
                onLongPress={() => {
                  if (!batch.selectMode) {
                    batch.enter();
                  }
                  batch.toggle(todo.id);
                }}
                onToggle={() => void toggleCompleted(todo.id)}
                onToggleSelect={() => batch.toggle(todo.id)}
                onEditProjectDot={(name, e) => {
                  chipEditor.openForProject(name, e);
                }}
              />
            ))}
          </ul>
        )}
      </section>

      {/* Arc Fan Menu */}
      <ArcMenu
        open={!!arcMenu}
        position={arcMenu ?? { x: 0, y: 0 }}
        onAction={handleArcAction}
        onClose={() => setArcMenu(null)}
      />

      {/* Quick Edit Popover */}
      <QuickEditPopover
        open={quickEdit.isOpen}
        initialText={quickEditTodo?.line ?? ""}
        onSave={(line) => {
          if (quickEditTodoId) {
            void updateLine(quickEditTodoId, line);
          }
          quickEdit.close();
          setQuickEditTodoId(null);
        }}
        onClose={() => {
          quickEdit.close();
          setQuickEditTodoId(null);
        }}
        onExpand={() => {
          quickEdit.close();
          setEditSheetTodoId(quickEditTodoId);
          setQuickEditTodoId(null);
        }}
        popoverRef={quickEdit.popoverRef}
        style={quickEdit.style}
      />

      {/* Tag Picker Popover */}
      <TagPicker
        open={tagPicker.isOpen}
        currentProjects={tagPickerTodo?.projects ?? []}
        onToggleProject={(name) => {
          if (tagPickerTodoId) {
            void toggleProject(tagPickerTodoId, name);
          }
        }}
        onClose={() => {
          tagPicker.close();
          setTagPickerTodoId(null);
        }}
        popoverRef={tagPicker.popoverRef}
        style={tagPicker.style}
      />

      {/* Project Chip Editor Popover */}
      {chipEditor.editingProject && (
        <ProjectChipEditor
          name={chipEditor.editingProject}
          open={chipEditor.isOpen}
          onClose={chipEditor.close}
          popoverRef={chipEditor.popoverRef}
          style={chipEditor.style}
        />
      )}

      {/* Full Edit Sheet */}
      <EditSheet
        open={!!editSheetTodoId}
        todo={editSheetTodo}
        onSave={(line) => {
          if (editSheetTodoId) {
            void updateLine(editSheetTodoId, line);
          }
          setEditSheetTodoId(null);
        }}
        onCopy={async (line) => {
          if (line) await navigator.clipboard.writeText(line);
        }}
        onClose={() => setEditSheetTodoId(null)}
      />

      {/* Batch Select Bar */}
      {batch.selectMode ? (
        <BatchBar
          count={batch.count}
          totalCount={todos.length}
          onSelectAll={() => batch.selectAll(todos.map((t) => t.id))}
          onComplete={() => {
            bump();
            void bulkComplete([...batch.selectedIds]);
            batch.exit();
          }}
          onDelete={() => {
            heavy();
            void bulkDelete([...batch.selectedIds]);
            batch.exit();
          }}
          onTag={() => {
            // Open tag picker for batch — reuse tagPicker at bottom center
            tagPicker.open({
              clientX: window.innerWidth / 2,
              clientY: window.innerHeight - 120,
            });
            // Store batch IDs in tagPickerTodoId as special marker
            setTagPickerTodoId(null);
          }}
          onCancel={batch.exit}
        />
      ) : (
        <BottomBar
          input={input}
          onInputChange={setInput}
          onAdd={async () => {
            const value = input.trim();
            if (!value) return;
            await add(value);
            setInput("");
          }}
          onCopyAll={async () => {
            const text = exportTodoTxt().trim();
            await navigator.clipboard.writeText(
              text.length ? `${text}\n` : ""
            );
          }}
          onDownloadAll={() => {
            const text = exportTodoTxt();
            const blob = new Blob([text.length ? `${text}\n` : ""], {
              type: "text/plain;charset=utf-8",
            });
            const url = URL.createObjectURL(blob);
            const a = document.createElement("a");
            a.href = url;
            a.download = "todo.txt";
            document.body.appendChild(a);
            a.click();
            a.remove();
            URL.revokeObjectURL(url);
          }}
        />
      )}

      <UndoToast />
    </div>
  );
}
