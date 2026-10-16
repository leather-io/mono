/// <reference types="vite/types/importMeta.d.ts" />
// Developer overrides from `apps/test-app/.env` (see .env.example). Vite exposes
// `VITE_*` variables on `import.meta.env`; outside Vite (the catalog imported
// from a Playwright spec) `import.meta.env` is undefined and every override
// reads as unset, so the defaults in ./constants apply. The literal
// `import.meta.env` token is what Vite's injection matches, so it must appear
// verbatim here — a reflective read would see undefined under Vite too.
import { isRecord } from './guards';

const envPrefix = 'VITE_TEST_APP_';

/** `VITE_TEST_APP_<name>` if set to a non-blank string, otherwise undefined. */
export function readOverride(name: string): string | undefined {
  const env: unknown = import.meta.env;
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
