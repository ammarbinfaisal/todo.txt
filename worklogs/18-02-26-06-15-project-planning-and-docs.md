# Project Planning and Documentation Setup

**Agent**: Claude Opus 4.6
**Session**: 18-02-26 06:15 - 06:45 (approx)

## What was done
- Researched todo.txt format specification from official repo
- Researched Next.js 16 and 16.1 features (Turbopack, Cache Components, proxy.ts, React 19.2)
- Designed complete UI/UX layout for mobile-first PWA
- Designed tag system with emoji + color + label, expandable inline editing
- Designed project notes system for per-project thought capture
- Designed swipe gesture mapping (complete, priority, edit, delete)
- Created full project specification in INSTRUCTIONS.md
- Created CLAUDE.md with project context for Claude agents
- Created AGENTS.md with multi-agent workflow rules
- Initialized git repository, created worklogs directory, added .gitignore

## Files changed
- `INSTRUCTIONS.md` - Full project specification (format, stack, UI/UX, data model, routes, milestones)
- `CLAUDE.md` - Claude-specific context, key decisions, patterns, commands
- `AGENTS.md` - Multi-agent workflow rules, worklog format, commit discipline
- `.gitignore` - Standard Next.js gitignore
- `worklogs/` - Created directory for session logs

## Decisions made
- **Offline-first with IndexedDB**: No server persistence in v1, everything client-side for speed and simplicity
- **zustand + immer over Redux**: Lighter weight, less boilerplate, sufficient for this app's complexity
- **Tags as extended metadata in todo.txt line**: `tag:slug emoji:🔥 color:#ef4444` preserves todo.txt compatibility
- **Notes separate from todo.txt**: Stored in IndexedDB only, not in the todo.txt format (too complex for single-line format)
- **@use-gesture/react over Hammer.js**: Better React integration, spring physics with react-spring
- **Worklog naming**: DD-MM-YY-HH-MM-description.md for chronological sorting and quick identification

## Next steps
- Scaffold Next.js 16 project with `create-next-app`
- Install dependencies (zustand, immer, idb, @use-gesture/react, react-spring, lucide-react, @tanstack/react-virtual)
- Implement todo.txt parser/serializer with tests
- Set up IndexedDB schema
- Build core TodoList and TodoItem components
