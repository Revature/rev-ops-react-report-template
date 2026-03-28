# Rev-Ops Report — AI Instructions

You are building a **custom report renderer** for the Rev-Ops platform. Your component receives report data as props and renders it however you like — table, cards, charts, or anything else.

## Props Contract

Your default export receives `ReportProps`:

```typescript
interface ReportProps {
  data: Record<string, unknown>[];   // Array of row objects from the database query
  columns: string[];                 // Column keys in the order returned by the query
  total: number;                     // Total row count (may exceed data.length if paginated)
  reportName: string;                // Display name of the report
}
```

## Sample Data in IDE

During development, `data.json` is pre-populated with **5 sample rows** from your report's SQL query. The boilerplate index.tsx imports it as a fallback:

```tsx
import sampleData from "./data.json";

const rows = data.length > 0 ? data : (sampleData as Record<string, unknown>[]);
```

This lets you see realistic data while editing in the IDE without needing a live connection.

## Available React Hooks

- `useState`, `useEffect`, `useRef`, `useCallback`, `useMemo`
- `useReducer`, `useContext`
- All standard React hooks are available

## Styling

Use **inline styles** — Tailwind and host app CSS classes are NOT available:

```tsx
<div style={{ padding: "16px", display: "flex", flexDirection: "column", gap: "12px" }}>
  <h2 style={{ margin: 0, fontSize: "18px", fontWeight: 600 }}>My Report</h2>
</div>
```

## Limitations

- Only `react`, `react-dom`, and `react/jsx-runtime` are available as external modules
- No importing from the host app
- No Node.js APIs (this runs in the browser)
- No Tailwind — use inline styles

## File Structure

```
component/
  index.tsx   — Your main component (default export) — edit this
  types.ts    — ReportProps type definitions (do not modify)
  data.json   — 5 sample rows from your SQL query (do not commit changes)
```

## Example: Table Layout

```tsx
import type { ReportProps } from "./types";
import sampleData from "./data.json";

export default function Report({ data, columns, total, reportName }: ReportProps) {
  const rows = data.length > 0 ? data : (sampleData as Record<string, unknown>[]);

  return (
    <div style={{ fontFamily: "system-ui, sans-serif", padding: "16px" }}>
      <h2 style={{ margin: "0 0 12px", fontSize: "16px", fontWeight: 600 }}>{reportName}</h2>
      <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "13px" }}>
        <thead>
          <tr style={{ background: "#f9fafb" }}>
            {columns.map((col) => (
              <th key={col} style={{ padding: "8px 12px", textAlign: "left", fontWeight: 600, borderBottom: "1px solid #e5e7eb" }}>
                {col.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase())}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => (
            <tr key={i} style={{ background: i % 2 === 0 ? "#fff" : "#f9fafb" }}>
              {columns.map((col) => (
                <td key={col} style={{ padding: "8px 12px", borderBottom: "1px solid #f3f4f6" }}>
                  {row[col] != null ? String(row[col]) : "—"}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
      <p style={{ margin: "8px 0 0", fontSize: "12px", color: "#6b7280" }}>{total} total rows</p>
    </div>
  );
}
```

## Example: Card Layout

```tsx
import type { ReportProps } from "./types";
import sampleData from "./data.json";

export default function Report({ data, columns, total, reportName }: ReportProps) {
  const rows = data.length > 0 ? data : (sampleData as Record<string, unknown>[]);

  return (
    <div style={{ fontFamily: "system-ui, sans-serif", padding: "16px" }}>
      <h2 style={{ margin: "0 0 16px", fontSize: "16px", fontWeight: 600 }}>{reportName} ({total})</h2>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))", gap: "12px" }}>
        {rows.map((row, i) => (
          <div key={i} style={{ border: "1px solid #e5e7eb", borderRadius: "8px", padding: "12px", background: "#fff" }}>
            {columns.map((col) => (
              <div key={col} style={{ marginBottom: "6px" }}>
                <span style={{ fontSize: "11px", fontWeight: 600, color: "#6b7280", textTransform: "uppercase" }}>
                  {col.replace(/_/g, " ")}
                </span>
                <div style={{ fontSize: "13px", color: "#111827", marginTop: "2px" }}>
                  {row[col] != null ? String(row[col]) : "—"}
                </div>
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
```
