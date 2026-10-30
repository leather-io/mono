function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

export function objectValue(value: unknown): Record<string, unknown> {
  if (!isRecord(value)) throw new Error('Expected an object');
  return value;
}

export function arrayValue(value: unknown): unknown[] {
  if (!Array.isArray(value)) throw new Error('Expected an array');
  return value;
}

export function stringValue(value: unknown): string {
  if (typeof value !== 'string') throw new Error('Expected a string');
  return value;
}

export function numberValue(value: unknown): number {
  if (typeof value !== 'number' || !Number.isFinite(value))
    throw new Error('Expected a finite number');
  return value;
}

export function stringMap(value: unknown): Record<string, string> {
  return Object.fromEntries(
    Object.entries(objectValue(value)).map(([key, entry]) => [key, stringValue(entry)])
  );
}

export function isFunction(value: unknown): value is () => unknown {
  return typeof value === 'function';
}
