// Narrowing helpers for the `unknown` payloads the wallet answers with.

export function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

/** `value[key]` when it is a string, otherwise undefined. */
export function readString(value: unknown, key: string): string | undefined {
  if (!isRecord(value)) return undefined;
  const field = value[key];
  return typeof field === 'string' ? field : undefined;
}
