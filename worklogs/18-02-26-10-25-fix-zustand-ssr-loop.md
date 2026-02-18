# Fix client-side crash from Zustand selector SSR loop

**Agent**: GPT-5.2 (Codex CLI)
**Session**: 18-02-26 10:25 - 10:35 (approx)

## What was done
- Reproduced the Vercel “client-side exception” with a headless Playwright run (using `--no-sandbox`).
- Diagnosed the issue locally in `next dev`: React warned about `getServerSnapshot` and hit “Maximum update depth exceeded”.
- Fixed the Zustand usage by avoiding selectors that allocate new objects/arrays (which breaks `useSyncExternalStore` expectations during SSR/hydration).

## Files changed
- `components/TodoApp.tsx` - Removed derived/aggregated selectors; select raw store slices and derive filtered todos with `useMemo`.

## Decisions made
- Prefer separate `useTodoStore` selectors for stable references; compute derived lists in component via memoization.

## Issues encountered
- The built-in Playwright MCP browser couldn’t launch Chrome due to Linux sandbox restrictions; used `playwright-core` with system Chrome and `--no-sandbox` for verification.

## Next steps
- After Vercel redeploys, re-run the runtime check to confirm the crash is gone.

