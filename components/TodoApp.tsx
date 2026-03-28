"use client";

import { useMemo, useState } from "react";

import { AppHeader } from "@/components/AppHeader";
import { ArcMenu, type ArcAction } from "@/components/ArcMenu";
import { BatchBar } from "@/components/BatchBar";
import { BottomBar } from "@/components/BottomBar";
import { EditSheet } from "@/components/EditSheet";
import { ProjectChipEditor, useProjectChipEditor } from "@/components/ProjectChipEditor";
import { TagPicker } from "@/components/TagPicker";
import { TodoItem } from "@/components/TodoItem";
import { useBatchSelect } from "@/hooks/useBatchSelect";
import { useMountEffect } from "@/hooks/useMountEffect";
import { usePopover } from "@/hooks/usePopover";
import { bump, heavy } from "@/lib/haptics";
import {
  useHistoryStore,
  selectCanUndo,
  selectCanRedo,
  selectUndoLabel,
  selectRedoLabel,
} from "@/stores/history-store";
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
  const remove = useTodoStore((s) => s.remove);
  const exportTodoTxt = useTodoStore((s) => s.exportTodoTxt);
  const setStatusFilter = useTodoStore((s) => s.setStatusFilter);
  const setPriorityFilter = useTodoStore((s) => s.setPriorityFilter);
  const toggleProject = useTodoStore((s) => s.toggleProject);
  const bulkComplete = useTodoStore((s) => s.bulkComplete);
  const bulkDelete = useTodoStore((s) => s.bulkDelete);
  const performUndo = useTodoStore((s) => s.performUndo);
  const performRedo = useTodoStore((s) => s.performRedo);

  // History
  const loadHistory = useHistoryStore((s) => s.load);
  const canUndo = useHistoryStore(selectCanUndo);
  const canRedo = useHistoryStore(selectCanRedo);
  const undoLabel = useHistoryStore(selectUndoLabel);
  const redoLabel = useHistoryStore(selectRedoLabel);

  // Projects
  const loadProjects = useProjectStore((s) => s.load);

  // Arc menu state
  const [arcMenu, setArcMenu] = useState<{
    todoId: string;
    x: number;
    y: number;
  } | null>(null);

  // Inline edit state
  const [editingTodoId, setEditingTodoId] = useState<string | null>(null);
  const [editDraft, setEditDraft] = useState("");

  // Tag picker popover
  const tagPicker = usePopover();
  const [tagPickerTodoId, setTagPickerTodoId] = useState<string | null>(null);

  // Project chip editor
  const chipEditor = useProjectChipEditor();

  // Edit sheet (full edit)
  const [editSheetTodoId, setEditSheetTodoId] = useState<string | null>(null);

  // Batch select
  const batch = useBatchSelect();

  // Hydrate on mount
  useMountEffect(() => {
    hydrateTheme();
    void load();
    void loadProjects();
    void loadHistory();
  });

  const counts = useMemo(() => {
    const done = allTodos.filter((t) => t.completed).length;
    const active = allTodos.length - done;
    return { active, done, total: allTodos.length };
  }, [allTodos]);

  const todos = useMemo(
    () => selectFilteredTodos({ todos: allTodos, filters }),
    [allTodos, filters]
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
    const { todoId } = arcMenu;
    setArcMenu(null);

    switch (action) {
      case "complete":
        bump();
        void toggleCompleted(todoId);
        break;
      case "delete":
        heavy();
        void remove(todoId);
        break;
      case "edit": {
        const todo = allTodos.find((t) => t.id === todoId);
        if (todo) {
          setEditingTodoId(todoId);
          setEditDraft(todo.line);
        }
        break;
      }
      case "tag":
        setTagPickerTodoId(todoId);
        tagPicker.open({ clientX: arcMenu.x, clientY: arcMenu.y });
        break;
    }
  };

  const handleEditSave = () => {
    if (editingTodoId && editDraft.trim()) {
      bump();
      void updateLine(editingTodoId, editDraft.trim());
    }
    setEditingTodoId(null);
    setEditDraft("");
  };

  const handleEditCancel = () => {
    setEditingTodoId(null);
    setEditDraft("");
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
        onCopyAll={async () => {
          const text = exportTodoTxt().trim();
          await navigator.clipboard.writeText(text.length ? `${text}\n` : "");
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
                editing={editingTodoId === todo.id}
                editDraft={editingTodoId === todo.id ? editDraft : ""}
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
                onEditChange={setEditDraft}
                onEditSave={handleEditSave}
                onEditCancel={handleEditCancel}
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

      {/* Batch Select Bar or Bottom Bar */}
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
            tagPicker.open({
              clientX: window.innerWidth / 2,
              clientY: window.innerHeight - 120,
            });
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
          onUndo={() => void performUndo()}
          onRedo={() => void performRedo()}
          canUndo={canUndo}
          canRedo={canRedo}
          undoLabel={undoLabel ? `Undo: ${undoLabel}` : undefined}
          redoLabel={redoLabel ? `Redo: ${redoLabel}` : undefined}
        />
      )}
    </div>
  );
}
