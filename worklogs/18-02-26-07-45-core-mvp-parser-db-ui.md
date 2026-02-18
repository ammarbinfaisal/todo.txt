# Core MVP: parser, IndexedDB, and mobile UI

**Agent**: GPT-5.2 (Codex CLI)
**Session**: 18-02-26 07:45 - 07:55 (approx)

## What was done
- Implemented a todo.txt parser + serializer with unit tests.
- Added IndexedDB storage via `idb` and a Zustand+Immer store for CRUD operations.
- Replaced the deploy smoke page with a minimal, mobile-first Todo list UI on `/`:
  - Add todo line input
  - Toggle complete
  - Inline edit (tap text)
  - Delete (with confirm)
  - Basic filters (All/Active/Done + priority A–D)
  - Dark/light mode toggle (class-based)

## Files changed
- `lib/todo-parser.ts` - Parse/serialize todo.txt lines.
- `lib/todo-parser.test.ts` - Parser tests.
- `types/todo.ts` - Shared Todo types.
- `lib/db.ts` - IndexedDB schema + CRUD helpers.
- `stores/todo-store.ts` - Zustand store backed by IndexedDB.
- `stores/theme-store.ts` - Theme toggle + localStorage hydration.
- `components/AppHeader.tsx` - Sticky header, filters, add form, theme toggle.
- `components/TodoApp.tsx` - App composition + load state.
- `components/TodoItem.tsx` - Dense item row with toggle/edit/delete.
- `components/FilterChips.tsx` - Filter chip UI.
- `components/PriorityBadge.tsx` - Priority badge styling.
- `app/page.tsx` - Root page now renders the app.
- `app/layout.tsx` - Dark-mode body classes.
- `tailwind.config.ts` - Enabled class-based dark mode and added globs.
- `package.json` / `bun.lock` - Added `idb`, `zustand`, `immer`.

## Decisions made
- Stored full normalized `line` plus derived fields to keep UI simple and edits predictable.
- Implemented inline editing as a minimal MVP (gestures/bottom sheets can come later per spec).

## Issues encountered
- ESLint rule `react-hooks/set-state-in-effect` blocked an edit-draft sync approach; switched to setting draft when entering edit mode instead.

## Next steps
- Add import/export of `todo.txt` file and an IndexedDB migration path.
- Start on gestures + virtualized list once the dataset grows.

