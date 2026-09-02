// Developer overrides from `apps/test-app/.env` (see .env.example). Vite exposes
// `VITE_*` variables on `import.meta.env`; outside Vite (the catalog imported
// from a Playwright spec) `import.meta.env` is undefined and every override
// reads as unset, so the defaults in ./constants apply. Read reflectively so
// the file also typechecks in projects without Vite's `ImportMeta` typings.
const envPrefix = 'VITE_TEST_APP_';

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

/** `VITE_TEST_APP_<name>` if set to a non-blank string, otherwise undefined. */
export function readOverride(name: string): string | undefined {
  const env: unknown = Reflect.get(import.meta, 'env');
  if (!isRecord(env)) return undefined;
  const value = env[envPrefix + name];
  if (typeof value !== 'string') return undefined;
  const trimmed = value.trim();
  return trimmed === '' ? undefined : trimmed;
}

/** Comma-separated override → trimmed, non-empty items; `fallback` if unset. */
export function readListOverride(name: string, fallback: string[]): string[] {
  const value = readOverride(name);
  if (value === undefined) return fallback;
  return value
    .split(',')
    .map(item => item.trim())
    .filter(item => item !== '');
}

/** Numeric override, ignored when it does not parse; `fallback` otherwise. */
export function readNumberOverride(name: string, fallback: number): number {
  const value = readOverride(name);
  if (value === undefined) return fallback;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}
