import { useState, useMemo } from "react";
import type { ReportProps } from "./types";
import sampleData from "./data.json";

function parseSampleData(raw: unknown): Record<string, unknown>[] {
  if (Array.isArray(raw)) return raw as Record<string, unknown>[];
  if (raw && typeof raw === "object" && Array.isArray((raw as Record<string, unknown>).sample_rows)) {
    return (raw as Record<string, unknown[]>).sample_rows as Record<string, unknown>[];
  }
  return [];
}

function formatDate(val: unknown): string {
  if (!val) return "—";
  try {
    return new Date(String(val)).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" });
  } catch { return String(val); }
}

// ── Mini bar chart (pure CSS) ─────────────────────────────────────────────
function BarChart({ data, color = "#7c3aed" }: { data: { label: string; value: number }[]; color?: string }) {
  const max = Math.max(...data.map((d) => d.value), 1);
  return (
    <div style={{ display: "flex", alignItems: "flex-end", gap: "6px", height: "80px", paddingTop: "4px" }}>
      {data.map((d) => (
        <div key={d.label} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: "4px" }}>
          <span style={{ fontSize: "10px", color: "#6b7280", fontWeight: 600 }}>{d.value}</span>
          <div style={{ width: "100%", height: `${Math.round((d.value / max) * 60)}px`, background: color, borderRadius: "3px 3px 0 0", minHeight: "4px", transition: "height 0.3s" }} />
          <span style={{ fontSize: "10px", color: "#9ca3af", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", maxWidth: "100%" }}>{d.label}</span>
        </div>
      ))}
    </div>
  );
}

// ── Donut chart (SVG) ─────────────────────────────────────────────────────
function DonutChart({ segments }: { segments: { label: string; value: number; color: string }[] }) {
  const total = segments.reduce((s, d) => s + d.value, 0) || 1;
  let offset = 0;
  const r = 30, cx = 40, cy = 40, stroke = 14;
  const circ = 2 * Math.PI * r;
  return (
    <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
      <svg width="80" height="80" viewBox="0 0 80 80">
        {segments.map((seg) => {
          const pct = seg.value / total;
          const dash = pct * circ;
          const el = (
            <circle key={seg.label} cx={cx} cy={cy} r={r} fill="none" stroke={seg.color}
              strokeWidth={stroke} strokeDasharray={`${dash} ${circ - dash}`}
              strokeDashoffset={-offset * circ} transform={`rotate(-90 ${cx} ${cy})`} />
          );
          offset += pct;
          return el;
        })}
        <text x={cx} y={cy + 4} textAnchor="middle" fontSize="11" fontWeight="700" fill="#111827">{total}</text>
      </svg>
      <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
        {segments.map((seg) => (
          <div key={seg.label} style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "11px" }}>
            <div style={{ width: "10px", height: "10px", borderRadius: "2px", background: seg.color, flexShrink: 0 }} />
            <span style={{ color: "#374151" }}>{seg.label}</span>
            <span style={{ color: "#9ca3af", marginLeft: "auto", paddingLeft: "8px" }}>{Math.round((seg.value / total) * 100)}%</span>
          </div>
        ))}
      </div>
    </div>
  );
}

const PAGE_SIZE = 25;
const TYPE_COLORS: Record<string, string> = { individual: "#7c3aed", business: "#0ea5e9", corporate: "#f59e0b", other: "#6b7280" };

export default function Report({ data, columns, total, reportName }: ReportProps) {
  const rows = data.length > 0 ? data : parseSampleData(sampleData);

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");
  const [page, setPage] = useState(1);
  const [sortCol, setSortCol] = useState("created_at");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc");

  // ── Analytics ──────────────────────────────────────────────────────────
  const statuses = useMemo(() => {
    const m: Record<string, number> = {};
    for (const r of rows) { const s = String(r.status || "Unknown"); m[s] = (m[s] || 0) + 1; }
    return m;
  }, [rows]);

  const types = useMemo(() => {
    const m: Record<string, number> = {};
    for (const r of rows) { const t = String(r.type || "other"); m[t] = (m[t] || 0) + 1; }
    return m;
  }, [rows]);

  // Monthly join trend (last 6 months)
  const monthlyTrend = useMemo(() => {
    const m: Record<string, number> = {};
    const now = new Date();
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      m[d.toLocaleDateString("en-US", { month: "short" })] = 0;
    }
    for (const r of rows) {
      if (!r.created_at) continue;
      const d = new Date(String(r.created_at));
      if (isNaN(d.getTime())) continue;
      const key = d.toLocaleDateString("en-US", { month: "short" });
      if (key in m) m[key]++;
    }
    return Object.entries(m).map(([label, value]) => ({ label, value }));
  }, [rows]);

  // ── Filtering + sorting ────────────────────────────────────────────────
  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return rows.filter((r) => {
      if (statusFilter !== "all" && String(r.status || "").toLowerCase() !== statusFilter.toLowerCase()) return false;
      if (typeFilter !== "all" && String(r.type || "").toLowerCase() !== typeFilter.toLowerCase()) return false;
      if (!q) return true;
      return columns.some((col) => String(r[col] ?? "").toLowerCase().includes(q));
    });
  }, [rows, search, statusFilter, typeFilter, columns]);

  const sorted = useMemo(() => {
    return [...filtered].sort((a, b) => {
      const av = String(a[sortCol] ?? ""), bv = String(b[sortCol] ?? "");
      return sortDir === "asc" ? av.localeCompare(bv) : bv.localeCompare(av);
    });
  }, [filtered, sortCol, sortDir]);

  const totalPages = Math.max(1, Math.ceil(sorted.length / PAGE_SIZE));
  const pageRows = sorted.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  function toggleSort(col: string) {
    if (sortCol === col) setSortDir((d) => d === "asc" ? "desc" : "asc");
    else { setSortCol(col); setSortDir("asc"); }
    setPage(1);
  }

  const uniqueStatuses = Object.keys(statuses);
  const uniqueTypes = Object.keys(types);

  const donutSegments = uniqueStatuses.map((s, i) => ({
    label: s, value: statuses[s],
    color: ["#7c3aed", "#0ea5e9", "#f59e0b", "#10b981", "#ef4444"][i % 5],
  }));

  return (
    <div style={{ fontFamily: "system-ui, sans-serif", background: "#f3f4f6", minHeight: "100%", padding: "16px" }}>

      {/* ── Page header ── */}
      <div style={{ marginBottom: "16px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div>
          <h1 style={{ margin: 0, fontSize: "20px", fontWeight: 700, color: "#111827" }}>{reportName}</h1>
          <p style={{ margin: "2px 0 0", fontSize: "12px", color: "#6b7280" }}>{total.toLocaleString()} total records</p>
        </div>
      </div>

      {/* ── KPI cards ── */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(160px, 1fr))", gap: "10px", marginBottom: "16px" }}>
        {[
          { label: "Total Records", value: total.toLocaleString(), color: "#7c3aed" },
          { label: "Active", value: (statuses["Active"] || statuses["active"] || 0).toLocaleString(), color: "#10b981" },
          { label: "Inactive", value: (statuses["Inactive"] || statuses["inactive"] || 0).toLocaleString(), color: "#ef4444" },
          { label: "Types", value: uniqueTypes.length.toString(), color: "#0ea5e9" },
        ].map((kpi) => (
          <div key={kpi.label} style={{ background: "#fff", borderRadius: "10px", padding: "14px", border: "1px solid #e5e7eb" }}>
            <p style={{ margin: 0, fontSize: "11px", color: "#9ca3af", textTransform: "uppercase", letterSpacing: "0.05em" }}>{kpi.label}</p>
            <p style={{ margin: "4px 0 0", fontSize: "22px", fontWeight: 700, color: kpi.color }}>{kpi.value}</p>
          </div>
        ))}
      </div>

      {/* ── Charts row ── */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px", marginBottom: "16px" }}>
        <div style={{ background: "#fff", borderRadius: "10px", padding: "16px", border: "1px solid #e5e7eb" }}>
          <p style={{ margin: "0 0 12px", fontSize: "13px", fontWeight: 600, color: "#374151" }}>Monthly Joins (last 6 months)</p>
          <BarChart data={monthlyTrend} color="#7c3aed" />
        </div>
        <div style={{ background: "#fff", borderRadius: "10px", padding: "16px", border: "1px solid #e5e7eb" }}>
          <p style={{ margin: "0 0 12px", fontSize: "13px", fontWeight: 600, color: "#374151" }}>By Status</p>
          <DonutChart segments={donutSegments} />
        </div>
      </div>

      {/* ── Filters ── */}
      <div style={{ background: "#fff", borderRadius: "10px", padding: "12px 16px", border: "1px solid #e5e7eb", marginBottom: "10px", display: "flex", gap: "10px", flexWrap: "wrap", alignItems: "center" }}>
        <input
          type="text" placeholder="Search..." value={search}
          onChange={(e) => { setSearch(e.target.value); setPage(1); }}
          style={{ flex: "1 1 180px", padding: "6px 10px", border: "1px solid #d1d5db", borderRadius: "6px", fontSize: "13px", outline: "none" }}
        />
        <select value={statusFilter} onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
          style={{ padding: "6px 10px", border: "1px solid #d1d5db", borderRadius: "6px", fontSize: "13px", background: "#fff" }}>
          <option value="all">All Statuses</option>
          {uniqueStatuses.map((s) => <option key={s} value={s}>{s}</option>)}
        </select>
        <select value={typeFilter} onChange={(e) => { setTypeFilter(e.target.value); setPage(1); }}
          style={{ padding: "6px 10px", border: "1px solid #d1d5db", borderRadius: "6px", fontSize: "13px", background: "#fff" }}>
          <option value="all">All Types</option>
          {uniqueTypes.map((t) => <option key={t} value={t}>{t}</option>)}
        </select>
        <span style={{ fontSize: "12px", color: "#9ca3af", marginLeft: "auto" }}>
          {filtered.length.toLocaleString()} result{filtered.length !== 1 ? "s" : ""}
        </span>
      </div>

      {/* ── Table ── */}
      <div style={{ background: "#fff", borderRadius: "10px", border: "1px solid #e5e7eb", overflow: "hidden" }}>
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "13px" }}>
            <thead>
              <tr style={{ background: "#f9fafb", borderBottom: "1px solid #e5e7eb" }}>
                {columns.map((col) => (
                  <th key={col} onClick={() => toggleSort(col)}
                    style={{ padding: "10px 14px", textAlign: "left", fontWeight: 600, color: "#374151", cursor: "pointer", whiteSpace: "nowrap", userSelect: "none" }}>
                    {col.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase())}
                    {sortCol === col && <span style={{ marginLeft: "4px", color: "#7c3aed" }}>{sortDir === "asc" ? "↑" : "↓"}</span>}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {pageRows.length === 0 ? (
                <tr><td colSpan={columns.length} style={{ padding: "32px", textAlign: "center", color: "#9ca3af" }}>No records found</td></tr>
              ) : pageRows.map((row, i) => (
                <tr key={i} style={{ borderBottom: "1px solid #f3f4f6", background: i % 2 === 0 ? "#fff" : "#fafafa" }}>
                  {columns.map((col) => {
                    const val = row[col];
                    if (col === "status") {
                      const isActive = String(val || "").toLowerCase() === "active";
                      return (
                        <td key={col} style={{ padding: "9px 14px" }}>
                          <span style={{ fontSize: "11px", fontWeight: 600, padding: "2px 8px", borderRadius: "20px", background: isActive ? "#d1fae5" : "#f3f4f6", color: isActive ? "#065f46" : "#6b7280" }}>
                            {String(val || "—")}
                          </span>
                        </td>
                      );
                    }
                    if (col === "type") {
                      const color = TYPE_COLORS[String(val || "other").toLowerCase()] || "#6b7280";
                      return (
                        <td key={col} style={{ padding: "9px 14px" }}>
                          <span style={{ fontSize: "11px", fontWeight: 600, padding: "2px 8px", borderRadius: "20px", background: color + "20", color }}>{String(val || "—")}</span>
                        </td>
                      );
                    }
                    if (col === "created_at") return <td key={col} style={{ padding: "9px 14px", color: "#6b7280", whiteSpace: "nowrap" }}>{formatDate(val)}</td>;
                    return <td key={col} style={{ padding: "9px 14px", color: "#374151", maxWidth: "200px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{val != null ? String(val) : "—"}</td>;
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* ── Pagination ── */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "10px 16px", borderTop: "1px solid #f3f4f6" }}>
          <span style={{ fontSize: "12px", color: "#6b7280" }}>
            Showing {Math.min((page - 1) * PAGE_SIZE + 1, sorted.length)}–{Math.min(page * PAGE_SIZE, sorted.length)} of {sorted.length.toLocaleString()}
          </span>
          <div style={{ display: "flex", gap: "4px" }}>
            <button onClick={() => setPage(1)} disabled={page === 1}
              style={{ padding: "4px 8px", border: "1px solid #d1d5db", borderRadius: "5px", background: page === 1 ? "#f9fafb" : "#fff", color: page === 1 ? "#d1d5db" : "#374151", cursor: page === 1 ? "default" : "pointer", fontSize: "12px" }}>«</button>
            <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1}
              style={{ padding: "4px 10px", border: "1px solid #d1d5db", borderRadius: "5px", background: page === 1 ? "#f9fafb" : "#fff", color: page === 1 ? "#d1d5db" : "#374151", cursor: page === 1 ? "default" : "pointer", fontSize: "12px" }}>‹</button>
            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
              const p = Math.min(Math.max(page - 2 + i, 1), totalPages - Math.min(4, totalPages - 1) + i);
              return (
                <button key={p} onClick={() => setPage(p)}
                  style={{ padding: "4px 10px", border: "1px solid #d1d5db", borderRadius: "5px", background: p === page ? "#7c3aed" : "#fff", color: p === page ? "#fff" : "#374151", cursor: "pointer", fontSize: "12px", fontWeight: p === page ? 700 : 400 }}>{p}</button>
              );
            })}
            <button onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={page === totalPages}
              style={{ padding: "4px 10px", border: "1px solid #d1d5db", borderRadius: "5px", background: page === totalPages ? "#f9fafb" : "#fff", color: page === totalPages ? "#d1d5db" : "#374151", cursor: page === totalPages ? "default" : "pointer", fontSize: "12px" }}>›</button>
            <button onClick={() => setPage(totalPages)} disabled={page === totalPages}
              style={{ padding: "4px 8px", border: "1px solid #d1d5db", borderRadius: "5px", background: page === totalPages ? "#f9fafb" : "#fff", color: page === totalPages ? "#d1d5db" : "#374151", cursor: page === totalPages ? "default" : "pointer", fontSize: "12px" }}>»</button>
          </div>
        </div>
      </div>
    </div>
  );
}
