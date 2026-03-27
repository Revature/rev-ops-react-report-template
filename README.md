# Rev-Ops React Component Template

Build custom UI components for Rev-Ops process flows.

## Structure

```
component/
  index.tsx    — Your component (edit this)
  types.ts     — Props contract (reference, don't modify)
```

## How it works

1. Edit `component/index.tsx` with your custom form UI
2. Your component receives `ProcessComponentProps` (see `types.ts`)
3. Call `onSubmit(formData)` to submit the form and trigger post-process
4. Call `onCancel()` to close the process modal
5. Use the **Sync Code** button in the Rev-Ops sidebar to sync your code

## Props

| Prop | Type | Description |
|------|------|-------------|
| `record` | `Record<string, any>` | Current record data |
| `fields` | `FieldDefinition[]` | Field definitions for this process |
| `context` | `object` | Execution context (objectApiName, processApiName, userId, executionId) |
| `preProcessResult` | `Record<string, any>` | Output from pre-process step (if any) |
| `onSubmit` | `(formData) => void` | Submit form data |
| `onCancel` | `() => void` | Cancel the process |

## Tips

- Use inline styles or CSS-in-JS — external CSS files are not bundled
- React is provided by the host app; don't import it as a dependency
- Keep your component focused — it renders inside a modal
- You can create additional `.tsx`/`.ts` files in `component/` and import them
