/**
 * Props contract for Rev-Ops custom report components.
 *
 * Your default export receives these props when rendered
 * inside the Rev-Ops report viewer.
 */

export interface ReportProps {
  /** Array of row objects from the database query */
  data: Record<string, unknown>[];

  /** Column keys in the order returned by the query */
  columns: string[];

  /** Total row count (may exceed data.length if paginated) */
  total: number;

  /** Display name of the report */
  reportName: string;
}
