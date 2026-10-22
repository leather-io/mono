import type { BrowserContext, ConsoleMessage, Page } from '@playwright/test';
import { writeFileSync } from 'node:fs';

import type { ConsoleLevel } from '../verify-options';

export const pageErrorType = 'pageerror';
const consoleErrorType = 'error';
const consoleWarningType = 'warning';

export type ConsoleMessageType = ReturnType<ConsoleMessage['type']>;

export interface ConsoleLocation {
  url: string;
  lineNumber: number;
  columnNumber: number;
}

export interface ConsoleRecord {
  ts: string;
  type: ConsoleMessageType;
  text: string;
  location: ConsoleLocation;
}

export interface PageErrorRecord {
  ts: string;
  type: typeof pageErrorType;
  name: string;
  message: string;
  stack?: string;
}

export type ConsoleEntry = ConsoleRecord | PageErrorRecord;

export interface ConsoleCounts {
  error: number;
  warning: number;
  log: number;
  allowlisted: number;
}

export interface BlockingErrors {
  consoleErrors: ConsoleRecord[];
  pageErrors: PageErrorRecord[];
}

export interface ConsoleRecorder {
  attachToPage(page: Page): void;
  attachToContext(context: BrowserContext): void;
  entries(): ConsoleEntry[];
  writeTo(filePath: string): void;
}

const recordedTypesByLevel: Record<ConsoleLevel, ReadonlySet<string> | undefined> = {
  error: new Set([consoleErrorType]),
  warning: new Set([consoleErrorType, consoleWarningType]),
  all: undefined,
};

export function shouldRecord(type: string, level: ConsoleLevel): boolean {
  const recordedTypes = recordedTypesByLevel[level];
  return recordedTypes === undefined || recordedTypes.has(type);
}

export function allowlistHaystack(entry: ConsoleEntry): string {
  if (entry.type === pageErrorType) return `${entry.name}: ${entry.message}`;
  return `${entry.text} ${entry.location.url}`;
}

export function isAllowlisted(haystack: string, allowlist: readonly string[]): boolean {
  return allowlist.some(entry => haystack.includes(entry));
}

export function summarizeConsole(
  entries: readonly ConsoleEntry[],
  allowlist: readonly string[]
): ConsoleCounts {
  const counts: ConsoleCounts = { error: 0, warning: 0, log: 0, allowlisted: 0 };
  for (const entry of entries) {
    if (entry.type === pageErrorType) continue;
    if (entry.type === consoleWarningType) {
      counts.warning += 1;
      continue;
    }
    if (entry.type !== consoleErrorType) {
      counts.log += 1;
      continue;
    }
    if (isAllowlisted(allowlistHaystack(entry), allowlist)) counts.allowlisted += 1;
    else counts.error += 1;
  }
  return counts;
}

export function findBlockingErrors(
  entries: readonly ConsoleEntry[],
  allowlist: readonly string[]
): BlockingErrors {
  const consoleErrors: ConsoleRecord[] = [];
  const pageErrors: PageErrorRecord[] = [];
  for (const entry of entries) {
    if (isAllowlisted(allowlistHaystack(entry), allowlist)) continue;
    if (entry.type === pageErrorType) pageErrors.push(entry);
    else if (entry.type === consoleErrorType) consoleErrors.push(entry);
  }
  return { consoleErrors, pageErrors };
}

export function listPageErrors(entries: readonly ConsoleEntry[]): PageErrorRecord[] {
  return entries.flatMap(entry => (entry.type === pageErrorType ? [entry] : []));
}

export function createConsoleRecorder(level: ConsoleLevel): ConsoleRecorder {
  const entries: ConsoleEntry[] = [];

  function onConsole(message: ConsoleMessage) {
    const type = message.type();
    if (!shouldRecord(type, level)) return;
    const { url, lineNumber, columnNumber } = message.location();
    entries.push({
      ts: new Date().toISOString(),
      type,
      text: message.text(),
      location: { url, lineNumber, columnNumber },
    });
  }

  function onPageError(error: Error) {
    entries.push({
      ts: new Date().toISOString(),
      type: pageErrorType,
      name: error.name,
      message: error.message,
      stack: error.stack,
    });
  }

  function attachToPage(page: Page) {
    page.on('console', onConsole);
    page.on('pageerror', onPageError);
  }

  return {
    attachToPage,
    attachToContext(context) {
      context.on('page', attachToPage);
    },
    entries() {
      return [...entries];
    },
    writeTo(filePath) {
      writeFileSync(filePath, entries.map(entry => `${JSON.stringify(entry)}\n`).join(''));
    },
  };
}
