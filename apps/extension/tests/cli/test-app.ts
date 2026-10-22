import { type Page, expect } from '@playwright/test';
import { type ChildProcess, spawn } from 'node:child_process';
import { openSync } from 'node:fs';

import { findPortListener } from './environment';

export const testAppUrl = 'http://localhost:3000';
export const testAppLogFileName = 'test-app.log';
const testAppPort = 3000;
const testAppPackage = '@leather.io/test-app';
const providerStatusTestId = 'provider-status';
const providerInstalledAttribute = 'data-installed';
const testAppStartupTimeoutMs = 90_000;
const testAppPollIntervalMs = 500;

export interface ReusedTestApp {
  mode: 'reused';
  pid: number;
}

export interface SpawnedTestApp {
  mode: 'spawned';
  child: ChildProcess;
}

export type TestAppHandle = ReusedTestApp | SpawnedTestApp;

export function ensureTestApp(repoRoot: string, logPath: string): TestAppHandle {
  const listener = findPortListener(testAppPort);
  if (listener !== undefined) return { mode: 'reused', pid: listener.pid };
  const logDescriptor = openSync(logPath, 'a');
  const child = spawn('pnpm', ['--filter', testAppPackage, 'dev'], {
    cwd: repoRoot,
    stdio: ['ignore', logDescriptor, logDescriptor],
    detached: true,
  });
  return { mode: 'spawned', child };
}

export function stopTestApp(handle: TestAppHandle): void {
  if (handle.mode !== 'spawned' || handle.child.pid === undefined) return;
  try {
    process.kill(-handle.child.pid, 'SIGTERM');
  } catch {
    return;
  }
}

async function tryOpenTestApp(page: Page): Promise<boolean> {
  try {
    await page.goto(testAppUrl);
  } catch {
    return false;
  }
  return true;
}

export async function waitForTestApp(page: Page, timeoutMs = testAppStartupTimeoutMs) {
  await expect
    .poll(() => tryOpenTestApp(page), { timeout: timeoutMs, intervals: [testAppPollIntervalMs] })
    .toBe(true);
  await expect(page.getByTestId(providerStatusTestId)).toHaveAttribute(
    providerInstalledAttribute,
    'true',
    { timeout: timeoutMs }
  );
}
