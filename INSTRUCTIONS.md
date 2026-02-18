# TodoTXT PWA - Project Instructions

> A mobile-first Progressive Web App built with Next.js 16 for managing tasks using the [todo.txt](https://github.com/todotxt/todo.txt) format, extended with per-project notes and visual tagging.

## 1. todo.txt Format Reference

Every task is a single line following this grammar:

```
[x YYYY-MM-DD ] [(A-Z) ] [YYYY-MM-DD ] description [+Project...] [@Context...] [key:value...]
```

| Element | Rule |
|---------|------|
| **Completion** | Lowercase `x` + space at line start, followed by completion date `YYYY-MM-DD` |
| **Priority** | `(A)` through `(Z)`, must be first on incomplete tasks |
| **Creation date** | `YYYY-MM-DD` after priority (or at start if no priority) |
| **Projects** | `+ProjectName` anywhere in text, preceded by space |
| **Contexts** | `@ContextName` anywhere in text, preceded by space |
| **Metadata** | `key:value` pairs, e.g. `due:2026-03-01`, `rec:+7d` |

### Extended Metadata Keys (app-specific)

| Key | Purpose | Example |
|-----|---------|---------|
| `due:` | Due date | `due:2026-03-15` |
| `rec:` | Recurrence | `rec:+7d`, `rec:+1m` |
| `tag:` | Visual tag slug | `tag:urgent`, `tag:idea` |
| `emoji:` | Visual emoji label | `emoji:🔥` |
| `color:` | Tag color (hex) | `color:#ef4444` |
| `note:` | Linked note ID | `note:abc123` |

---

## 2. Tech Stack

| Layer | Choice | Why |
|-------|--------|-----|
| Framework | **Next.js 16.1** (App Router) | Turbopack, Cache Components, React 19.2 |
| Runtime | React 19.2 | View Transitions, Activity, useEffectEvent |
| Styling | **Tailwind CSS 4** | Utility-first, minimal CSS, fast iteration |
| State | `zustand` + `immer` | Lightweight, no boilerplate, immutable updates |
| Storage | **IndexedDB** via `idb` | Offline-first, large storage, structured data |
| Gestures | `@use-gesture/react` + `react-spring` | Native-feel swipe, drag, spring physics |
| PWA | `next-pwa` or `@serwist/next` | Service worker, manifest, offline caching |
| Icons | `lucide-react` | Clean, consistent, tree-shakeable |
| Testing | `vitest` + `@testing-library/react` | Fast, modern, component-level |

---

## 3. UI/UX Design

### 3.1 Design Principles

- **Dense by default**: Minimal padding (4-6px vertical per item), maximize visible todos on phone viewport
- **Touch-native**: All primary actions via swipe, tap, long-press. No tiny buttons
- **Clean, not fancy**: No gradients, shadows, or decorative elements. Monochrome with accent colors only for priority/tags
- **Instant feedback**: Optimistic UI, spring animations on gestures, haptic-style visual feedback

### 3.2 Layout Structure

```
┌─────────────────────────────────┐
│ [☰]  TodoTXT        [+] [⌕] [⋮]│  ← Sticky header, 40px
├─────────────────────────────────┤
│ Filter chips: All | A | B | C   │  ← Horizontal scroll, 32px
│ +Project  @Context  #tag        │
├─────────────────────────────────┤
│                                 │
│  ┌─ Todo Item ────────────────┐ │
│  │ ○ (A) Call dentist +Health │ │  ← 36-40px per row
│  │      @phone  due:Mar 15   │ │
│  │      🔥 urgent             │ │  ← Tag line (if tags exist)
│  └────────────────────────────┘ │
│  ┌─ Todo Item ────────────────┐ │
│  │ ○ Fix login bug +AppV2    │ │
│  │      @work  🐛 bug         │ │
│  └────────────────────────────┘ │
│  ┌─ Completed ────────────────┐ │
│  │ ✓ Buy groceries  +Home    │ │  ← Muted, strikethrough
│  └────────────────────────────┘ │
│           ...                   │
│                                 │
├─────────────────────────────────┤
│  📋 Todos  │ 📁 Projects │ ⚙  │  ← Bottom nav, 56px
└─────────────────────────────────┘
```

### 3.3 Todo Item Anatomy

```
┌──────────────────────────────────────────────┐
│ ○  (A)  Task description text +Project @Ctx  │
│         🔥 urgent  🐛 bug  📅 Mar 15         │
└──────────────────────────────────────────────┘
 ↑   ↑    ↑                    ↑
 │   │    │                    └─ Project/Context chips (muted)
 │   │    └─ Main text, truncate to 2 lines max
 │   └─ Priority badge: A=red, B=orange, C=yellow, D+=gray
 └─ Checkbox circle, 20px tap target with 44px touch area
```

**Tag display row** (below main text, only if tags/emoji/due exist):
- Each tag: `[emoji] [label]` as a small colored chip
- Tap a tag chip → inline expand to edit mode
- Due date shown as 📅 chip with relative date ("tomorrow", "3d")

### 3.4 Swipe Gestures

| Gesture | Action | Visual |
|---------|--------|--------|
| Swipe right (short, ~80px) | Toggle complete | Green background reveals, checkmark icon |
| Swipe right (long, ~160px) | Set priority | Priority picker slides in |
| Swipe left (short, ~80px) | Quick edit | Edit panel slides in from right |
| Swipe left (long, ~160px) | Delete (with undo) | Red background, trash icon |
| Long press | Multi-select mode | Subtle haptic, selection checkboxes appear |
| Tap | View/Edit detail | Inline expand or bottom sheet |

### 3.5 Tag System

Tags provide visual categorization beyond todo.txt's `+Project` and `@Context`:

**Default tag palette** (user-customizable):

| Tag | Emoji | Color | Use |
|-----|-------|-------|-----|
| `urgent` | 🔥 | `#ef4444` red | Time-sensitive |
| `idea` | 💡 | `#eab308` yellow | Feature ideas |
| `bug` | 🐛 | `#f97316` orange | Bug reports |
| `blocked` | 🚧 | `#6b7280` gray | Waiting on something |
| `review` | 👀 | `#3b82f6` blue | Needs review |
| `quick` | ⚡ | `#22c55e` green | < 5 min task |

**Tag interaction**:
1. Tags display as small inline chips: `🔥 urgent`
2. Tap a tag → expands inline showing: `[🔥] [urgent] [#ef4444 ●] [✕]`
   - Tap emoji → emoji picker
   - Tap label → inline text edit
   - Tap color dot → color picker (6 presets + custom)
   - Tap ✕ → remove tag
3. "+" button at end of tag row → add new tag
4. Tags stored as `tag:slug emoji:🔥 color:#ef4444` in the todo.txt line

### 3.6 Project Notes

Each `+Project` can have associated notes for capturing thoughts, ideas, and plans:

**Projects view** (`/projects`):
```
┌──────────────────────────────────┐
│ +AppV2                    12 📋  │  ← Project card
│ 3 active · 9 done · 2 notes     │
│ ├─ 💡 Add dark mode toggle      │  ← Recent notes preview
│ └─ 🐛 Login redirect fails      │
├──────────────────────────────────┤
│ +Health                    5 📋  │
│ 2 active · 3 done · 0 notes     │
└──────────────────────────────────┘
```

**Project detail** (`/projects/[name]`):
- Tab bar: `Tasks | Notes`
- Tasks tab: filtered todo list for this project
- Notes tab: list of notes with type badges

**Note structure** (stored in IndexedDB, not in todo.txt):
```typescript
interface ProjectNote {
  id: string;               // nanoid
  project: string;          // "+AppV2"
  type: 'idea' | 'bug' | 'plan' | 'general';
  content: string;          // Markdown text
  emoji?: string;           // Visual label
  createdAt: string;        // ISO date
  updatedAt: string;
}
```

**Note creation**: FAB (+) button in notes tab → bottom sheet with:
- Type selector: 💡 Idea | 🐛 Bug | 📝 Plan | 📌 General
- Text area (auto-focus, auto-grow)
- Optional: link to specific todo item

### 3.7 Quick Add

Bottom-right FAB or keyboard shortcut:
- Opens bottom sheet with single text input
- Auto-parses `+Project`, `@Context`, `(A)` as you type
- Live preview of parsed todo below input
- Chips auto-highlight as recognized: `(A)` turns red, `+Project` turns blue, `@Context` turns purple
- Submit with Enter or tap button

### 3.8 Search & Filter

Top bar search (`⌕`):
- Full-text search across all todos
- Results highlight matching text
- Filter chips below search: priority, project, context, tag, status (active/done)
- Filters are combinable (AND logic)
- Active filter count shown as badge on filter icon

### 3.9 Color System

```
--bg:           #ffffff / #0a0a0a (dark)
--bg-surface:   #f5f5f5 / #171717
--text:         #171717 / #fafafa
--text-muted:   #737373 / #a3a3a3
--border:       #e5e5e5 / #262626
--priority-a:   #ef4444 (red)
--priority-b:   #f97316 (orange)
--priority-c:   #eab308 (yellow)
--priority-d:   #6b7280 (gray)
--accent:       #3b82f6 (blue)
--success:      #22c55e (green)
--danger:       #ef4444 (red)
```

Dark mode: auto-detect `prefers-color-scheme`, manual toggle in settings.

---

## 4. Data Architecture

### 4.1 Storage Strategy

```
IndexedDB ("todotxt-db")
├── todos          // Todo items (parsed from todo.txt format)
├── projects       // Project metadata (colors, order, emoji)
├── notes          // Project notes
├── tags           // Tag definitions (slug, emoji, color)
└── settings       // User preferences
```

### 4.2 Todo Data Model

```typescript
interface Todo {
  id: string;              // nanoid
  raw: string;             // Original todo.txt line
  completed: boolean;
  completionDate?: string; // YYYY-MM-DD
  priority?: string;       // A-Z
  creationDate?: string;   // YYYY-MM-DD
  description: string;     // Text without metadata
  projects: string[];      // ["+Project1", "+Project2"]
  contexts: string[];      // ["@phone", "@work"]
  metadata: Record<string, string>; // key:value pairs
  tags: string[];          // tag slugs from tag:xxx
  sortOrder: number;       // Manual sort position
}
```

### 4.3 Import/Export

- **Import**: Paste or upload `todo.txt` file → parse into DB
- **Export**: Generate `todo.txt` from DB → download or copy
- **Sync**: Future - file system API or cloud sync (out of scope for v1)

---

## 5. App Routes (Next.js App Router)

```
app/
├── layout.tsx              // Root: PWA meta, theme, providers
├── page.tsx                // Main todo list
├── projects/
│   ├── page.tsx            // All projects overview
│   └── [name]/
│       └── page.tsx        // Single project: tasks + notes
├── settings/
│   └── page.tsx            // Preferences, import/export, tag management
├── manifest.ts             // PWA manifest (dynamic)
├── sw.ts                   // Service worker registration
└── icon.tsx                // Dynamic app icon
```

---

## 6. Component Hierarchy

```
<RootLayout>
  <ThemeProvider>
  <StoreProvider>
    <Header />                    // Sticky top bar
    <FilterBar />                 // Horizontal chip scroll
    <main>
      <TodoList>                  // Virtualized list
        <TodoItem>                // Swipeable row
          <PriorityBadge />
          <TodoText />
          <TagChips>
            <TagChip />           // Expandable tag
          </TagChips>
        </TodoItem>
      </TodoList>
    </main>
    <BottomNav />                 // Tabs: Todos, Projects, Settings
    <QuickAddFAB />               // Floating action button
    <QuickAddSheet />             // Bottom sheet for new todo
    <EditSheet />                 // Bottom sheet for editing
  </StoreProvider>
  </ThemeProvider>
</RootLayout>
```

---

## 7. Key Implementation Details

### 7.1 Virtualized List

Use `@tanstack/react-virtual` for the todo list:
- Variable row heights (tags add a second line)
- Smooth scrolling on iOS/Android
- Only render visible items + 5 overscan

### 7.2 Swipe Implementation

```typescript
// Pseudocode for swipe behavior
const bind = useGesture({
  onDrag: ({ movement: [mx], direction: [dx], cancel }) => {
    if (mx > 160 && dx > 0) {
      // Long swipe right → priority picker
      cancel();
      openPriorityPicker(todo.id);
    }
    // Animate spring to follow finger
    api.start({ x: mx, immediate: true });
  },
  onDragEnd: ({ movement: [mx] }) => {
    if (mx > 80) toggleComplete(todo.id);
    else if (mx < -80 && mx > -160) openEdit(todo.id);
    else if (mx < -160) deleteTodo(todo.id);
    api.start({ x: 0 }); // Spring back
  },
});
```

### 7.3 Todo Parser

```typescript
function parseTodoLine(line: string): Todo {
  // Regex-based parser following todo.txt spec
  const COMPLETED = /^x\s+(\d{4}-\d{2}-\d{2})\s+/;
  const PRIORITY = /^\(([A-Z])\)\s+/;
  const DATE = /^(\d{4}-\d{2}-\d{2})\s+/;
  const PROJECT = /(?:^|\s)\+(\S+)/g;
  const CONTEXT = /(?:^|\s)@(\S+)/g;
  const METADATA = /(?:^|\s)(\S+):(\S+)/g;
  // ... parse and return Todo object
}

function serializeTodo(todo: Todo): string {
  // Reconstruct todo.txt line from Todo object
}
```

### 7.4 PWA Configuration

```typescript
// manifest.ts
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'TodoTXT',
    short_name: 'TodoTXT',
    start_url: '/',
    display: 'standalone',
    background_color: '#0a0a0a',
    theme_color: '#0a0a0a',
    icons: [
      { src: '/icon-192.png', sizes: '192x192', type: 'image/png' },
      { src: '/icon-512.png', sizes: '512x512', type: 'image/png' },
    ],
  };
}
```

### 7.5 Offline Support

- Service worker caches all app shell assets
- IndexedDB stores all data locally
- App works fully offline
- No server-side data fetching needed for v1

---

## 8. Development Workflow

### 8.1 Commands

```bash
npm run dev          # Start dev server (Turbopack)
npm run build        # Production build
npm run start        # Start production server
npm run lint         # ESLint + type check
npm run test         # Run vitest
npm run test:watch   # Watch mode
```

### 8.2 File Conventions

- Components: `PascalCase.tsx` in `components/`
- Hooks: `use-kebab-case.ts` in `hooks/`
- Utils: `kebab-case.ts` in `lib/`
- Types: co-located or in `types/`
- Tests: `*.test.tsx` co-located with components

### 8.3 Code Style

- TypeScript strict mode
- Functional components only
- Named exports (no default except pages)
- Tailwind for all styling, no CSS modules
- Prefer composition over prop drilling
- Keep components under 150 lines; extract hooks for logic

---

## 9. Milestone Plan

### v0.1 - Core (MVP)
- [ ] Project scaffold (Next.js 16, Tailwind, PWA)
- [ ] Todo parser/serializer (todo.txt format)
- [ ] IndexedDB storage layer
- [ ] Todo list with virtual scroll
- [ ] Add/edit/delete todos
- [ ] Priority badges with colors
- [ ] Basic filter (priority, completed)
- [ ] Dark/light mode

### v0.2 - Gestures & Tags
- [ ] Swipe to complete/delete/edit
- [ ] Tag system (emoji + color + label)
- [ ] Expandable tag chips
- [ ] Quick add bottom sheet with live parsing
- [ ] Search with highlight

### v0.3 - Projects & Notes
- [ ] Projects overview page
- [ ] Per-project notes (idea/bug/plan/general)
- [ ] Note editor with markdown
- [ ] Project stats (active/done/notes count)

### v0.4 - Polish
- [ ] Import/export todo.txt files
- [ ] Settings page (tag management, theme, data)
- [ ] Haptic feedback (Vibration API)
- [ ] View transitions between pages
- [ ] Multi-select mode (long press)

### v1.0 - Release
- [ ] PWA install prompt
- [ ] Performance audit (Lighthouse 95+)
- [ ] Accessibility audit (WCAG 2.1 AA)
- [ ] Cross-browser testing
