# Rev-Ops Component Development Rules

You are helping an admin build a **self-contained React component** for the Rev-Ops platform. This component runs inside a sandboxed iframe via esbuild ESM bundle.

## Project Structure

```
component/
  index.tsx   — Main component (default export). Edit this file.
  types.ts    — Props type definitions. Do NOT modify.
```

## Props Contract

The default export receives `ProcessComponentProps` from `./types`:

- `record` — Full record data from DB (`Record<string, any>`)
- `fields` — Field definitions for the object (`FieldDefinition[]`)
- `context` — Execution metadata: `objectApiName`, `processApiName`, `executionId`, `recordId`, `userId`
- `preProcessResult` — Result from server-side pre-process Python script (`null` if none)
- `onComplete(result?)` — Call when the process is done
- `onCancel()` — Call if the user aborts
- `onError(message)` — Call on error

## Rules

1. **Default export only** — `export default function MyComponent(props: ProcessComponentProps)`
2. **Inline styles only** — No CSS imports, no Tailwind, no styled-components. Use `style={{ }}` on JSX elements.
3. **Only React is available** — `react`, `react-dom`, and `react/jsx-runtime` are externalized. No other npm packages.
4. **Use `fetch()` for API calls** — Auth cookies are included automatically. Always check `res.ok`.
5. **No router access** — Use `onComplete`/`onCancel` to navigate, not `window.location`.
6. **No Node.js APIs** — This runs in the browser.
7. **Always handle errors** — Wrap async operations in try/catch, call `onError(message)` on failure.
8. **Keep it self-contained** — All logic (UI, fetch, validation) lives in this component.
9. **TypeScript** — Use proper types. Import `ProcessComponentProps` from `./types`.

## API Patterns

```typescript
// Read record
const res = await fetch(`/api/entities/${context.objectApiName}/${context.recordId}`);

// Update record
await fetch(`/api/entities/${context.objectApiName}/${context.recordId}`, {
  method: "PUT",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify(updates),
});

// List records
const res = await fetch(`/api/entities/${context.objectApiName}?page=1&page_size=25`);
```

## Pre-Process Data

If a Python pre-process ran before this component, its return value is in `preProcessResult`. Use it for enriched data or server-computed options:

```tsx
const options = preProcessResult?.available_options ?? [];
```

## Wizard Workflow

You are inside a **cloud IDE** that is part of a wizard for building components. Here's how the overall flow works:

1. **Step 0 — Metadata**: Admin sets the component name, API name, and description
2. **Step 1 — Code Editor** (you are here): Admin writes the component code in this IDE
3. **Step 2 — Compile & Save**: The platform compiles the code with esbuild and saves it

### How to sync code back to the platform

After writing or editing code, the admin must **sync** it back to the Rev-Ops platform:

Click the **"Sync Code"** button in the Rev-Ops sidebar panel (left side of the IDE).

**Note:** You (the AI) cannot sync code. Always tell the admin to click the Sync Code button.

After syncing, the admin can:
- **Preview** the component (Preview tab in the wizard) to see it rendered with mock data
- **Proceed to Compile & Save** to finalize the component

### Important workflow notes

- Code changes are NOT automatically synced — the admin must explicitly sync
- The Preview tab compiles the code temporarily and renders it with mock props
- The final Compile & Save step creates the production bundle
- If the admin asks you to "sync" or "save", remind them to click the **Sync Code** button in the Rev-Ops sidebar panel (left side). You cannot do this for them.
