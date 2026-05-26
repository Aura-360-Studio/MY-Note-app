# MY Note - Product And Architecture Plan

## 1. Product Vision

MY Note is a local-first note-taking app inspired by Windows Notepad, Notepad++, terminal-style interfaces, and Kanban boards.

The goal is to keep note-taking fast and simple while adding a visual way to organize notes by dragging them between states.

Core idea:

> A modern terminal-style notepad with a board.

MY Note should feel personal, lightweight, focused, and useful for daily work.

## 2. Target Users

Primary users:

- People who use simple notepad apps every day.
- Web testers, developers, students, and knowledge workers.
- Users who want quick notes without creating an account.
- Users who want a visual board without using a full project management tool.

Initial use case:

- Personal notes.
- Study notes.
- Project planning.
- Everyday scratchpad.
- Lightweight task tracking.

## 3. MVP Scope

The MVP should include:

- Create notes.
- Edit notes.
- Delete or archive notes.
- Drag notes between Kanban columns.
- Search notes.
- Add tags or labels.
- Save notes locally in the browser.
- Export workspace backup.
- Import workspace backup.
- Dark terminal-inspired UI.

The MVP should not include:

- User login.
- Cloud sync.
- Collaboration.
- Shared boards.
- AI assistant.
- Rich database-style fields.
- Calendar integration.
- Mobile app store build.

These can be considered after the MVP is stable.

## 4. Core Screens

### Workspace

Main application shell.

Expected areas:

- Top navigation.
- Workspace title.
- Quick actions.
- View switcher.
- Settings access.

### Scratchpad

Fast writing area for everyday notes.

Purpose:

- Open app.
- Type immediately.
- Save automatically.

### Board

Kanban-style view where notes appear as draggable cards.

Initial columns:

- Inbox
- Todo
- Doing
- Done
- Archive

Optional later column:

- Blocked

### Editor

Focused note editing area.

Expected behavior:

- Plain-text first.
- Markdown-friendly later.
- Terminal-ish editor feel.
- Fast keyboard usage.

### Archive

Storage for notes that are no longer active but should not be deleted.

### Settings

Workspace settings and backup tools.

Initial settings:

- Export workspace.
- Import workspace.
- Clear local workspace.
- Theme option later.
- Experimental local folder mode later.

## 5. Storage Strategy

MY Note will start as a local-first app.

Initial storage:

- Browser IndexedDB.
- Dexie.js as the IndexedDB wrapper.

Why IndexedDB:

- More suitable than localStorage for note data.
- Can store larger content.
- Better structured storage.
- Works without a backend.

Important limitation:

- If the user clears browser data, notes can be deleted.

Protection:

- Export workspace backup from day one.
- Import workspace backup from day one.
- Later backup reminders.
- Later local folder mode.

## 6. Backup Strategy

Export format:

- JSON file.
- Versioned schema.
- ISO 8601 timestamps.

Example export file name:

```txt
my-note-backup-2026-05-25.json
```

The exported backup should include:

- App name.
- Schema version.
- Export timestamp.
- Notes.
- Tags.
- Workspace settings.

Import behavior:

- Validate file before import.
- Support schema version checks.
- Avoid duplicate notes where possible.
- Show clear import result.

Future export options:

- Export selected note as Markdown.
- Export all notes as Markdown files.
- Export board snapshot.

## 7. Future Local Folder Mode

Later, MY Note may support opening a local folder using the File System Access API.

This should be treated as an advanced feature.

Possible behavior:

- User chooses a local folder.
- Notes are saved as files.
- App can read notes from that folder.
- User keeps ownership of files outside browser cache.

Important:

- Browser support is limited.
- This should not block the MVP.
- It can be introduced first as experimental.

## 8. Note Data Model

Initial note fields:

```ts
type NoteStatus = "inbox" | "todo" | "doing" | "done" | "archive";

type Note = {
  id: string;
  title: string;
  content: string;
  status: NoteStatus;
  tags: string[];
  createdAt: string;
  updatedAt: string;
  archivedAt: string | null;
};
```

Date format:

- All dates must use ISO 8601 strings.
- Example: `2026-05-25T10:30:00.000Z`

Future fields:

```ts
priority
dueDate
pinned
color
linkedNoteIds
```

## 9. Kanban Behavior

The Kanban board is a core feature.

Required behavior:

- User can drag a note from one column to another.
- Dropping a note updates its status.
- The note remains editable after moving.
- Board order should be preserved where possible.

Drag and drop library:

- `@dnd-kit`

Why:

- Modern React drag-and-drop library.
- Good accessibility options.
- Flexible for cards and columns.

## 10. UI Direction

The design should feel:

- Terminal-inspired.
- Notepad++ influenced.
- Modern.
- Dark.
- Compact.
- Professional.
- Fast.

Design principles:

- No landing page for the app experience.
- Open directly into the workspace.
- No oversized marketing sections.
- No decorative gradients as the main identity.
- No card-inside-card layouts.
- Clear visual hierarchy.
- Subtle borders and hover states.
- Dense but readable spacing.

Visual language:

- Dark background.
- Thin borders.
- Monospace or semi-monospace editor.
- Clean sans-serif UI text.
- Small status chips.
- Compact buttons with icons.
- Minimal accent colors.

## 11. Recommended Tech Stack

Frontend:

- React
- TypeScript
- Vite

Styling:

- Tailwind CSS

UI:

- Custom components.
- shadcn/ui style patterns where useful.
- Lucide React icons.

Editor:

- CodeMirror 6

Drag and drop:

- `@dnd-kit`

Local database:

- IndexedDB
- Dexie.js

Validation:

- Zod

State:

- Zustand or feature-level React hooks.

Testing:

- Vitest
- React Testing Library
- Playwright later for browser testing.

Quality:

- ESLint
- Prettier
- Strict TypeScript

## 12. Folder Structure

Proposed structure:

```txt
src/
  app/
    App.tsx
    router.tsx
    providers.tsx

  pages/
    WorkspacePage.tsx
    BoardPage.tsx
    EditorPage.tsx
    SettingsPage.tsx

  features/
    notes/
      components/
      hooks/
      services/
      stores/
      types/
      validators/

    board/
      components/
      hooks/
      services/
      types/

    workspace/
      components/
      services/
      types/

    backup/
      components/
      services/
      types/

  shared/
    components/
    hooks/
    lib/
    styles/
    types/
    constants/

  data/
    db.ts
    migrations.ts
    repositories/

  tests/
```

## 13. Coding Standards

There is no single ISO standard that defines React folder structure or component names. For MY Note, the project will follow a strict professional coding standard inspired by ISO-style discipline.

Non-negotiable standards:

- TypeScript strict mode.
- Consistent naming.
- ISO 8601 date strings.
- Schema validation for imports.
- Versioned backup data.
- Clear folder boundaries.
- No business logic hidden inside UI components.
- Reusable components only when reuse is real.
- Accessibility-aware controls.
- Keyboard-friendly workflows.
- Predictable state management.
- Small, focused files.

Naming conventions:

- Components: `NoteCard.tsx`
- Hooks: `useNotes.ts`
- Services: `noteService.ts`
- Types: `note.types.ts`
- Validators: `note.schema.ts`
- Constants: `note.constants.ts`

## 14. Architecture Rules

Pages:

- Route-level screens only.
- Should compose feature components.

Features:

- Own business behavior.
- Own components, hooks, services, types, and validation.

Shared:

- Generic reusable UI and utilities.
- Must not contain feature-specific business logic.

Data:

- IndexedDB setup.
- Migrations.
- Repository functions.

Services:

- Handle business operations.
- Should be testable without UI.

Components:

- Should focus on rendering and user interaction.
- Should avoid direct database access.

## 15. Accessibility And UX Standards

MY Note should support:

- Keyboard navigation.
- Visible focus states.
- High contrast dark theme.
- Clear button labels or tooltips.
- Accessible drag-and-drop fallback where possible.
- Text that does not overflow buttons or cards.
- Responsive layout for desktop and mobile.

Primary target:

- Desktop browser first.

Secondary target:

- Mobile browser later.

## 16. Roadmap

### Phase 1 - Planning

- Product plan.
- Technical plan.
- UI direction.
- MVP scope.

### Phase 2 - Project Setup

- Vite React TypeScript project.
- Tailwind setup.
- ESLint and Prettier.
- Base folder structure.

### Phase 3 - Local Notes

- IndexedDB setup.
- Create note.
- Edit note.
- Delete/archive note.
- Search notes.

### Phase 4 - Kanban

- Board view.
- Note cards.
- Drag and drop.
- Status updates.
- Column counts.

### Phase 5 - Backup

- Export workspace.
- Import workspace.
- Schema validation.
- Error handling.

### Phase 6 - Polish

- Terminal-style theme.
- Keyboard shortcuts.
- Empty states.
- Responsive checks.
- Basic tests.

### Phase 7 - Future

- Local folder mode.
- Markdown preview.
- PWA install.
- Optional cloud sync.
- Optional AI assistant.
- Shared workspace links.

## 17. Open Decisions

Questions to decide before implementation:

- Should the first screen be Scratchpad or Board?
- Should note editing open in a side panel or full page?
- Should `Blocked` be part of the MVP board?
- Should Markdown preview be included in MVP or later?
- Should the app use one workspace only or support multiple local workspaces later?

Recommended initial answers:

- First screen: Board with quick Scratchpad access.
- Editing: Side panel on desktop, full page on mobile.
- Blocked: Later, not MVP.
- Markdown preview: Later.
- Workspaces: One local workspace for MVP.

