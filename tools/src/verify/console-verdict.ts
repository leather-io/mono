import type { VerifyConsoleSummary } from './verify-contract.js';

export interface ConsoleEntry {
  readonly page: string;
  readonly level: string;
  readonly text: string;
  readonly location?: string;
  readonly at: number;
}

export const pageErrorLevel = 'pageerror';
export const consoleErrorLevel = 'error';

export function allowlistHaystack(entry: ConsoleEntry): string {
  return entry.location === undefined ? entry.text : `${entry.text} ${entry.location}`;
}

export function isAllowlisted(entry: ConsoleEntry, allowlist: readonly string[]): boolean {
  const haystack = allowlistHaystack(entry);
  return allowlist.some(needle => haystack.includes(needle));
}

export function isErrorEntry(entry: ConsoleEntry): boolean {
  return entry.level === consoleErrorLevel || entry.level === pageErrorLevel;
}

export type ConsoleNoisePredicate = (entry: ConsoleEntry) => boolean;

function noNoise(): boolean {
  return false;
}

export const fallbackAbortMessage = 'Failed to load resource: net::ERR_FAILED';

export function fallbackAbortNoise(fallbackUrls: ReadonlySet<string>): ConsoleNoisePredicate {
  return entry =>
    entry.level === consoleErrorLevel &&
    entry.text.startsWith(fallbackAbortMessage) &&
    entry.location !== undefined &&
    fallbackUrls.has(entry.location.replace(/:\d+$/, ''));
}

export function blockingConsoleEntries(
  entries: readonly ConsoleEntry[],
  allowlist: readonly string[],
  isNoise: ConsoleNoisePredicate = noNoise
): ConsoleEntry[] {
  return entries.filter(
    entry => isErrorEntry(entry) && !isAllowlisted(entry, allowlist) && !isNoise(entry)
  );
}

export function summarizeConsole(
  entries: readonly ConsoleEntry[],
  allowlist: readonly string[],
  isNoise: ConsoleNoisePredicate = noNoise
): VerifyConsoleSummary {
  const errorEntries = entries.filter(isErrorEntry);
  const allowlisted = errorEntries.filter(entry => isAllowlisted(entry, allowlist)).length;
  const noise = errorEntries.filter(entry => !isAllowlisted(entry, allowlist) && isNoise(entry));
  return {
    total: entries.length,
    errors: errorEntries.filter(entry => entry.level === consoleErrorLevel).length,
    pageErrors: errorEntries.filter(entry => entry.level === pageErrorLevel).length,
    allowlisted,
    blocking: errorEntries.length - allowlisted - noise.length,
  };
}
