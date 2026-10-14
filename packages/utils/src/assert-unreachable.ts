/**
 * Ensure all cases in a control flow are handled by asserting a value is `never`.
 *
 * Typically used in `switch` statements to enforce exhaustiveness.
 * TypeScript's type checking will catch unhandled cases at compile time.
 */
export function assertUnreachable(value: never): never {
  throw new Error(`Unexpected value: ${JSON.stringify(value)}`);
}
