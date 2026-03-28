/**
 * Props contract for Rev-Ops custom report components.
 *
 * Your default export receives these props when rendered
 * inside a report view. The component is fully self-contained
 * and responsible for rendering the report data.
 */

export interface ReportProps {
  /** Fetched report rows. */
  data: Record<string, unknown>[];

  /** Column keys in the order returned by the query. */
  columns: string[];

  /** Total row count (may be larger than data.length if paginated). */
  total: number;

  /** Display name of the report. */
  reportName: string;
}
