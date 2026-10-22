import { type Page, errors } from '@playwright/test';
import { disableAnimations } from '@tests/fixtures/launch-extension';

export interface ReadinessResult {
  met: boolean;
  afterMs: number | null;
}

export function buildRouteUrl(extensionId: string, route: string): string {
  return `chrome-extension://${extensionId}/index.html#${route}`;
}

export async function openRoute(page: Page, extensionId: string, route: string) {
  const url = buildRouteUrl(extensionId, route);
  if (page.url() !== url) await page.goto(url);
  await disableAnimations(page);
}

export async function waitForReady(
  page: Page,
  testId: string,
  timeoutMs: number
): Promise<ReadinessResult> {
  const startedAt = performance.now();
  try {
    await page.getByTestId(testId).waitFor({ state: 'attached', timeout: timeoutMs });
  } catch (error) {
    if (error instanceof errors.TimeoutError) return { met: false, afterMs: null };
    throw error;
  }
  return { met: true, afterMs: Math.round(performance.now() - startedAt) };
}
