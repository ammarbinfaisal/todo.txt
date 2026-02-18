# CLAUDE.md - Claude Code Context

## Project Overview

This is **TodoTXT PWA** - a mobile-first Progressive Web App built with Next.js 16 for managing tasks using the todo.txt format, extended with per-project notes and visual tagging.

**Read `INSTRUCTIONS.md` first.** It contains the full specification: todo.txt format, UI/UX design, component hierarchy, data models, and milestone plan. Know it thoroughly before writing any code.

**Read `AGENTS.md` for workflow rules.** It defines worklog conventions, commit discipline, and coordination protocols that apply to all LLM agents including Claude.

## Key Decisions

- **Next.js 16.1** with App Router, Turbopack, Cache Components
- **React 19.2** with View Transitions and Activity
- **Tailwind CSS 4** for all styling
- **IndexedDB** via `idb` for offline-first storage
- **zustand + immer** for state management
- **@use-gesture/react + react-spring** for swipe gestures
- **@tanstack/react-virtual** for virtualized list
- No server-side data persistence in v1; everything is client-side

## Architecture Notes

- All routes under `app/` using App Router conventions
- `proxy.ts` (not middleware.ts) for any request interception (Next.js 16)
- Client components for interactive UI (`"use client"` directive)
- Shared types in `types/` directory
- Todo parser/serializer in `lib/todo-parser.ts`
- IndexedDB operations in `lib/db.ts`
- Zustand stores in `stores/`
- Reusable hooks in `hooks/`

## Code Style

- TypeScript strict mode, no `any`
- Functional components, named exports
- Tailwind utility classes only, no CSS modules
- Components under 150 lines, extract logic into hooks
- Co-locate tests: `Component.test.tsx` next to `Component.tsx`

## Worklog

**Every work session must produce a worklog entry.**

Create a markdown file in `worklogs/` named: `DD-MM-YY-HH-MM-description.md`

Example: `18-02-26-14-30-setup-project-scaffold.md`

Content format:
```markdown
# [Brief Title]

## What was done
- Bullet points of changes made

## Files changed
- `path/to/file.tsx` - what changed

## Decisions made
- Why certain approaches were chosen

## Next steps
- What should be done next
```

## Commit Discipline

1. **Never commit without building first**: `npm run build` must pass
2. **Commit message format**:
   ```
   feat/fix/refactor/chore: one-line summary (under 72 chars)

   - Detail 1: what and why
   - Detail 2: what and why
   - Detail 3: what and why
   ```
3. **Commit frequently**: after each meaningful unit of work
4. **Push regularly**: push after every few commits, always after a session ends
5. **No broken commits**: every commit should build and pass tests

## Common Commands

```bash
npm run dev          # Dev server with Turbopack
npm run build        # Production build (MUST pass before commit)
npm run start        # Production server
npm run lint         # Lint check
npm run test         # Run tests
```

## Important Patterns

### Adding a new todo feature
1. Update parser in `lib/todo-parser.ts` if format changes
2. Update `Todo` type in `types/`
3. Update zustand store action
4. Update IndexedDB schema/migration if needed
5. Update UI component
6. Add/update tests

### Adding a new page
1. Create route in `app/[route]/page.tsx`
2. Add to bottom nav in `components/BottomNav.tsx`
3. Use `"use client"` for interactive pages

### Adding a new tag
1. Tags are user-defined, stored in IndexedDB `tags` store
2. Default tags defined in `lib/default-tags.ts`
3. Tag UI in `components/TagChip.tsx`
