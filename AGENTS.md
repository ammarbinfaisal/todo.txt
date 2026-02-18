# AGENTS.md - Multi-Agent Workflow Rules

> These rules apply to **all LLM agents** (Claude, GPT, Gemini, Codex, Copilot, etc.) working on this project. Read and internalize before writing any code.

## Required Reading

Before starting any work:
1. **Read `INSTRUCTIONS.md`** - Full project spec, UI/UX, architecture, milestones
2. **Read `CLAUDE.md`** - Project context, key decisions, code patterns
3. **Read this file** - Workflow rules, worklog format, commit discipline

## Worklog Convention

**Every work session must produce a worklog entry.** No exceptions.

### File naming

```
worklogs/DD-MM-YY-HH-MM-description.md
```

- `DD-MM-YY` - Date in day-month-year format
- `HH-MM` - Time (24h) when the session started
- `description` - Kebab-case summary of what was done (2-5 words)

Examples:
```
worklogs/18-02-26-14-30-project-scaffold-setup.md
worklogs/18-02-26-16-45-todo-parser-implementation.md
worklogs/19-02-26-09-00-swipe-gestures-added.md
```

### Worklog content format

```markdown
# [Brief descriptive title]

**Agent**: [Agent name/model, e.g. "Claude Opus 4.6", "GPT-4o", "Gemini 2.5"]
**Session**: DD-MM-YY HH:MM - HH:MM (approx)

## What was done
- Bullet points of concrete changes made
- Be specific: "Added TodoItem component with swipe gestures" not "worked on UI"

## Files changed
- `path/to/file.tsx` - Brief description of change
- `path/to/another.ts` - Brief description of change

## Decisions made
- Document any architectural or design decisions
- Explain WHY, not just what

## Issues encountered
- Any bugs, blockers, or unexpected problems
- How they were resolved (or if still open)

## Next steps
- What should the next agent/session pick up
- Any known gaps or TODO items remaining
```

## Commit Discipline

### Pre-commit checklist

Every commit MUST satisfy ALL of these:

1. **Build passes**: Run `npm run build` - it must succeed with zero errors
2. **Tests pass**: Run `npm run test` - all tests must pass (if tests exist)
3. **No lint errors**: Run `npm run lint` - clean output
4. **No debug artifacts**: No `console.log`, `debugger`, or commented-out code
5. **No secrets**: No API keys, tokens, or credentials in committed files

### Commit message format

```
type: one-line summary under 72 characters

- Detailed bullet point explaining what changed and why
- Another detail about a specific change
- Reference any related issues or decisions
```

**Types**: `feat`, `fix`, `refactor`, `chore`, `test`, `docs`, `style`, `perf`

### Commit examples

Good:
```
feat: add swipe-to-complete gesture on todo items

- Implemented right-swipe (80px threshold) to toggle completion
- Added spring animation with react-spring for natural feel
- Green background reveals during swipe with checkmark icon
- Haptic feedback via Vibration API on completion
```

Bad:
```
update stuff
```
```
wip
```
```
fix
```

### Commit frequency

- Commit after each **meaningful unit of work** (a component, a feature slice, a bug fix)
- Never leave a session with uncommitted, working changes
- Never commit broken code (build must pass)

### Push discipline

- Push after every few commits
- Always push at the end of a work session
- Push ensures other agents can pick up where you left off

## Code Coordination

### Before starting work

1. `git pull` to get latest changes
2. Read recent worklogs to understand current state
3. Check `INSTRUCTIONS.md` milestones for what to work on next
4. Check for any open issues or TODOs in the codebase

### During work

- Work on one milestone/feature at a time
- Don't refactor unrelated code while implementing a feature
- Keep changes focused and reviewable

### After finishing work

1. Run full build verification: `npm run build && npm run test && npm run lint`
2. Write worklog entry in `worklogs/`
3. Stage changes: `git add` specific files (not `git add .`)
4. Commit with descriptive message (format above)
5. Push to remote
6. Ensure the worklog accurately reflects what was done

## Code Quality Rules

### Do
- Follow existing patterns in the codebase
- Use TypeScript strict mode, no `any` types
- Write tests for parser logic and critical utilities
- Keep components small (< 150 lines)
- Use Tailwind utility classes for styling
- Handle loading/error states in UI
- Make the app work offline

### Don't
- Add dependencies without documenting why in the worklog
- Change the todo.txt parsing spec without updating INSTRUCTIONS.md
- Skip build verification before committing
- Leave TODO comments without creating a follow-up task
- Over-engineer: solve the current requirement, not hypothetical ones
- Add server-side data persistence (v1 is client-only)

## File Structure Convention

```
todo-txt/
├── INSTRUCTIONS.md           # Full project specification
├── CLAUDE.md                 # Claude-specific context
├── AGENTS.md                 # This file: workflow rules
├── worklogs/                 # Session worklogs (DD-MM-YY-HH-MM-desc.md)
├── app/                      # Next.js App Router pages
│   ├── layout.tsx
│   ├── page.tsx
│   ├── projects/
│   └── settings/
├── components/               # React components
├── hooks/                    # Custom React hooks
├── lib/                      # Utilities (parser, db, helpers)
├── stores/                   # Zustand state stores
├── types/                    # TypeScript type definitions
├── public/                   # Static assets, icons
├── next.config.ts
├── tailwind.config.ts
├── tsconfig.json
└── package.json
```

## Conflict Resolution

If you encounter conflicting instructions between files:
1. `INSTRUCTIONS.md` is the source of truth for **what to build**
2. `AGENTS.md` is the source of truth for **how to work**
3. `CLAUDE.md` is supplementary context for Claude specifically
4. When in doubt, prioritize: working software > spec compliance > code elegance
