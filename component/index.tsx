import type { ReportProps } from "./types";
import sampleData from "./data.json";

/**
 * Custom Report Component
 *
 * Renders report data as a styled table. Modify this component
 * to create a completely custom layout for your report.
 *
 * Available props:
 *   data       — array of row objects from the database query
 *   columns    — column keys in query order
 *   total      — total row count (for pagination info)
 *   reportName — display name of this report
 *
 * During development in the IDE, `data.json` is pre-populated
 * with 5 sample rows from your SQL query. The component uses
 * that sample data as a fallback when `data` is empty.
 */
export default function Report({ data, columns, total, reportName }: ReportProps) {
  const rows = data.length > 0 ? data : (sampleData as Record<string, unknown>[]);

  function formatHeader(key: string): string {
    return key.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
  }

  return (
    <div style={{ fontFamily: "system-ui, sans-serif", padding: "16px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: "12px" }}>
        <h2 style={{ margin: 0, fontSize: "16px", fontWeight: 600, color: "#111827" }}>{reportName}</h2>
        <span style={{ fontSize: "12px", color: "#6b7280" }}>{total} row{total !== 1 ? "s" : ""}</span>
      </div>

      <div style={{ overflowX: "auto", borderRadius: "8px", border: "1px solid #e5e7eb" }}>
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "13px" }}>
          <thead>
            <tr style={{ background: "#f9fafb" }}>
              {columns.map((col) => (
                <th
                  key={col}
                  style={{
                    padding: "8px 12px",
                    textAlign: "left",
                    fontWeight: 600,
                    color: "#374151",
                    borderBottom: "1px solid #e5e7eb",
                    whiteSpace: "nowrap",
                  }}
                >
                  {formatHeader(col)}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row, i) => (
              <tr
                key={i}
                style={{ background: i % 2 === 0 ? "#ffffff" : "#f9fafb" }}
              >
                {columns.map((col) => (
                  <td
                    key={col}
                    style={{
                      padding: "8px 12px",
                      color: "#1f2937",
                      borderBottom: "1px solid #f3f4f6",
                      maxWidth: "280px",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {row[col] != null ? String(row[col]) : (
                      <span style={{ color: "#d1d5db" }}>—</span>
                    )}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
