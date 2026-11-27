import { existsSync } from 'node:fs';

export const buildTestCommand = 'pnpm --filter @leather.io/extension build:test';

export function distMissingMessage(manifestPath: string): string {
  return `verify: ${manifestPath} does not exist, so there is no extension to load. Fix: run \`${buildTestCommand}\` or pass --build.`;
}

export function checkDist(manifestPath: string): string | undefined {
  return existsSync(manifestPath) ? undefined : distMissingMessage(manifestPath);
}

export function findDevServer(psOutput: string | undefined, root: string): string | undefined {
  if (!psOutput) return undefined;
  return psOutput
    .split('\n')
    .map(line => line.trim())
    .find(line => line.includes('vite') && line.includes(root) && !line.includes('vite build'));
}

export function devServerWarning(processLine: string): string {
  return `verify: a vite dev server for this worktree is running (${processLine.slice(0, 120)}). pnpm dev rewrites apps/extension/dist, so the screen may not match the test build; stop it or pass --build.`;
}
