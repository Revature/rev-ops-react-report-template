# Rev-Ops Component — AI Instructions

You are building a **self-contained micro frontend component** for the Rev-Ops platform. The component handles ALL logic: UI rendering, data fetching, mutations, and validation.

## Props Contract

Your default export receives `ProcessComponentProps`:

```typescript
interface ProcessComponentProps {
  record: Record<string, any>;                          // Full record data from DB
  fields: FieldDefinition[];                             // Field definitions for the object
  context: ComponentContext;                              // Execution metadata
  preProcessResult: Record<string, any> | null;          // Result from server-side pre-process (null if none)
  onComplete: (result?: Record<string, any>) => void;    // Signal success
  onCancel: () => void;                                  // Signal cancellation
  onError: (error: string) => void;                      // Signal error
}

interface ComponentContext {
  objectApiName: string;
  processApiName: string;
  executionId: string;
  recordId: string;
  userId: string;
}

interface FieldDefinition {
  api_name: string;
  name: string;
  field_type: string;
  required?: boolean;
  options?: Record<string, unknown>;
}
```

## Pre-Process Results

If the process has a server-side pre-process (Python), its return value is available via `preProcessResult`. This is `null` when there is no pre-process configured.

```tsx
// Example: use pre-process data to populate options
const options = preProcessResult?.available_options ?? [];
const enrichedData = preProcessResult?.enriched_record ?? record;
```

The pre-process runs on a secure server with access to secrets (API keys, tokens). Use it for things your browser-side component can't do (e.g., calling external APIs that require secret keys).

## Available React Hooks

- `useState`, `useEffect`, `useRef`, `useCallback`, `useMemo`
- `useReducer`, `useContext`
- All standard React hooks are available

## Making API Calls

Use `fetch()` — the component runs in the same browser session, so auth cookies are automatically included.

### API Patterns

```typescript
// Read a record
const res = await fetch(`/api/entities/${context.objectApiName}/${context.recordId}`);
const data = await res.json();

// Update a record
await fetch(`/api/entities/${context.objectApiName}/${context.recordId}`, {
  method: "PUT",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ field_api_name: "new_value" }),
});

// List records
const res = await fetch(`/api/entities/${context.objectApiName}?page=1&page_size=25`);

// Call any backend API
const res = await fetch("/api/lookup/some-endpoint");
```

### Important

- Always check `res.ok` before reading the response
- Handle errors gracefully — call `onError(message)` for user-facing errors
- Call `onComplete()` when the process is done
- Call `onCancel()` if the user wants to abort

## Styling

- Use **inline styles** (recommended for isolation)
- Basic CSS classes from the host app are NOT available
- Keep styles self-contained within your component

```tsx
<div style={{ padding: "16px", display: "flex", flexDirection: "column", gap: "12px" }}>
  <h2 style={{ margin: 0, fontSize: "18px" }}>My Component</h2>
</div>
```

## Limitations

- No access to `react-router` or host app navigation
- No importing modules from the host app
- No access to `window.location` changes (use `onComplete`/`onCancel` instead)
- Only `react`, `react-dom`, and `react/jsx-runtime` are available as external modules
- No Node.js APIs (this runs in the browser)

## File Structure

```
component/
  index.tsx   — Your main component (default export)
  types.ts    — Props type definitions (do not modify)
```

## Example: Simple Form

```tsx
import { useState } from "react";
import type { ProcessComponentProps } from "./types";

export default function MyForm({ record, fields, context, onComplete, onCancel, onError }: ProcessComponentProps) {
  const [values, setValues] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);

  async function handleSave() {
    setSaving(true);
    try {
      const res = await fetch(`/api/entities/${context.objectApiName}/${context.recordId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });
      if (!res.ok) throw new Error("Save failed");
      onComplete({ updated: true });
    } catch (err) {
      onError(err instanceof Error ? err.message : "Failed to save");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
      {fields.map((f) => (
        <div key={f.api_name}>
          <label style={{ display: "block", marginBottom: "4px", fontSize: "14px", fontWeight: 500 }}>
            {f.name}
          </label>
          <input
            type="text"
            value={values[f.api_name] ?? record[f.api_name] ?? ""}
            onChange={(e) => setValues((prev) => ({ ...prev, [f.api_name]: e.target.value }))}
            style={{ width: "100%", padding: "8px 12px", borderRadius: "6px", border: "1px solid #d1d5db", fontSize: "14px" }}
          />
        </div>
      ))}
      <div style={{ display: "flex", justifyContent: "flex-end", gap: "8px" }}>
        <button onClick={onCancel} style={{ padding: "8px 16px", borderRadius: "6px", border: "1px solid #d1d5db", background: "white", cursor: "pointer" }}>
          Cancel
        </button>
        <button onClick={handleSave} disabled={saving} style={{ padding: "8px 16px", borderRadius: "6px", border: "none", background: "#7c3aed", color: "white", cursor: "pointer", opacity: saving ? 0.6 : 1 }}>
          {saving ? "Saving..." : "Save"}
        </button>
      </div>
    </div>
  );
}
```
