import { useState } from "react";
import type { ProcessComponentProps } from "./types";

/**
 * Custom Process Component
 *
 * This component is fully self-contained. It receives record data,
 * field definitions, and execution context via props. Use fetch()
 * for API calls (same browser session = same auth cookies).
 *
 * Available props:
 *   record           — full record data from DB
 *   fields           — field definitions for the object
 *   context          — execution metadata (objectApiName, processApiName, etc.)
 *   preProcessResult — result from server-side pre-process (null if none)
 *   onComplete       — call when done (optionally pass result data)
 *   onCancel         — call to cancel the process
 *   onError          — call to signal an error
 */
export default function MyComponent({
  record,
  fields,
  context,
  preProcessResult,
  onComplete,
  onCancel,
  onError,
}: ProcessComponentProps) {
  const [loading, setLoading] = useState(false);

  async function handleSubmit() {
    setLoading(true);
    try {
      // Example: update the record via API
      const res = await fetch(
        `/api/data/${context.objectApiName}/${context.recordId}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            /* your updates */
          }),
        }
      );
      if (!res.ok) throw new Error("Update failed");
      onComplete({ success: true });
    } catch (err) {
      onError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      <h2>Process: {context.processApiName}</h2>
      <p>Record: {record.name ?? context.recordId}</p>
      <button onClick={handleSubmit} disabled={loading}>
        {loading ? "Processing..." : "Submit"}
      </button>
      <button onClick={onCancel}>Cancel</button>
    </div>
  );
}
