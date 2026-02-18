# Themes, bottom input, swipe + drawer

**Agent**: GPT-5.2 (Codex CLI)
**Session**: 18-02-26 11:10 - 11:40 (approx)

## What was done
- Added light/off-white, beige, and dark-gray theme palettes using CSS variables and a 3-way theme cycle button.
- Moved the quick-add input bar to a sticky bottom bar and added copy/download export actions.
- Reworked todo rows to be denser and swipe-enabled (right = complete, left = delete).
- Added a left-side sliding drawer for viewing/editing full todo details; tapping outside closes and discards changes.
- Implemented delete undo via a small bottom-left toast.
- Added an app icon (SVG) and set metadata icons to reduce favicon 404s in production.

## Files changed
- `app/globals.css` - Added CSS variable theme palettes (light/beige/dark).
- `app/layout.tsx` - Switched body colors to CSS variables and set `data-theme`.
- `app/page.tsx` - Simplified container so `TodoApp` owns the layout.
- `public/icon.svg` - Added a minimal icon used by metadata.
- `stores/theme-store.ts` - Added `beige` theme and `cycle()`; apply theme via `data-theme`.
- `stores/todo-store.ts` - Added undo state/actions and todo.txt export helper.
- `components/AppHeader.tsx` - Removed add form; updated to new theme + palette variables.
- `components/FilterChips.tsx` - Switched to icon-like labels + palette variables.
- `components/TodoApp.tsx` - Added drawer + bottom bar + undo toast; list shifts when drawer opens.
- `components/TodoItem.tsx` - Dense row UI with swipe gestures and tap-to-open.
- `components/PriorityBadge.tsx` - Updated styles to work with the new palette approach.
- `components/BottomBar.tsx` - New sticky bottom input + export actions.
- `components/TodoDrawer.tsx` - New sliding left drawer editor with copy/save.
- `components/UndoToast.tsx` - New undo toast with countdown.
- `hooks/useSwipeRow.ts` - New pointer-based swipe hook for list rows.

## Decisions made
- Implemented swipe gestures with pointer events (no new gesture deps yet) to keep MVP lightweight while matching the UX direction.
- Used `data-theme` + CSS variables for palette control (supports multiple light themes, not just `dark:` variants).
- Implemented the editor as a left drawer that shifts the list so the list remains partially visible while editing.

## Issues encountered
- Next.js build failed due to an unused `@ts-expect-error`; replaced with typed CSS-var style keys.
- ESLint rule disallowed `setState` inside an effect; moved drawer draft state to `TodoApp` so it’s set on open, not via effect.

## Next steps
- Add richer drawer content (projects/contexts/meta editing, due/tag UI) and import workflow.
- Replace the simple pointer swipe with `@use-gesture/react` + `react-spring` for better physics and velocity-based thresholds.
- Add long-press / multi-select and additional swipe actions as described in `INSTRUCTIONS.md`.
