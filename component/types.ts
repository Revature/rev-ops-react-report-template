/**
 * Props contract for Rev-Ops process components.
 *
 * Your default export receives these props when rendered
 * inside a process flow. Components are fully self-contained:
 * they handle UI, data fetching, mutations, and validation.
 */

export interface ComponentContext {
  objectApiName: string;
  processApiName: string;
  executionId: string;
  recordId: string;
  userId: string;
}

export interface FieldDefinition {
  api_name: string;
  name: string;
  field_type: string;
  required?: boolean;
  options?: Record<string, unknown>;
}

export interface ProcessComponentProps {
  /** Full record data from DB. */
  record: Record<string, any>;

  /** Field definitions for the object. */
  fields: FieldDefinition[];

  /** Execution metadata. */
  context: ComponentContext;

  /** Result from the server-side pre-process (null if no pre-process). */
  preProcessResult: Record<string, any> | null;

  /** Signal success — optionally pass result data. */
  onComplete: (result?: Record<string, any>) => void;

  /** Signal cancellation. */
  onCancel: () => void;

  /** Signal error. */
  onError: (error: string) => void;
}
