export const redactedValue = '[redacted]';
export const defaultStateSlices = ['active', 'networks', 'wallets'] as const;
export const allStateSlicesKeyword = 'all';

const softwareKeysSlice = 'softwareKeys';
const redactedSoftwareKeyFields = new Set(['salt', 'encryptedSecretKey']);
const sessionKeyName = 'encryptionKey';

export interface StateEvidence {
  readonly slices: Readonly<Record<string, unknown>>;
  readonly session: {
    readonly encryptionKeyPresent: boolean;
  };
}

function entriesOf(value: unknown): [string, unknown][] | undefined {
  if (typeof value !== 'object' || value === null || Array.isArray(value)) return undefined;
  return Object.entries(value);
}

export function redactSoftwareKeys(value: unknown): unknown {
  if (Array.isArray(value)) return value.map(redactSoftwareKeys);
  const entries = entriesOf(value);
  if (!entries) return value;
  return Object.fromEntries(
    entries.map(([key, child]) => [
      key,
      redactedSoftwareKeyFields.has(key) ? redactedValue : redactSoftwareKeys(child),
    ])
  );
}

export function selectSlices(store: unknown, slices: readonly string[]): Record<string, unknown> {
  const stored = new Map(entriesOf(store) ?? []);
  const selected: Record<string, unknown> = {};
  for (const slice of slices) {
    const value = stored.get(slice);
    if (value === undefined) {
      selected[slice] = null;
      continue;
    }
    selected[slice] = slice === softwareKeysSlice ? redactSoftwareKeys(value) : value;
  }
  return selected;
}

export function hasEncryptionKey(sessionArea: unknown): boolean {
  const entries = entriesOf(sessionArea);
  if (!entries) return false;
  const value = new Map(entries).get(sessionKeyName);
  return typeof value === 'string' && value.length > 0;
}

export function buildStateEvidence(
  store: unknown,
  slices: readonly string[],
  sessionArea: unknown
): StateEvidence {
  return {
    slices: selectSlices(store, slices),
    session: { encryptionKeyPresent: hasEncryptionKey(sessionArea) },
  };
}
