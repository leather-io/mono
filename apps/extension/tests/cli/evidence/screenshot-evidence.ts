import { type Page, errors } from '@playwright/test';

import type { ShotMode } from '../verify-options';

const elementScreenshotTimeoutMs = 5000;

export async function captureScreenshot(
  page: Page,
  shot: ShotMode,
  filePath: string
): Promise<boolean> {
  if (shot.kind === 'none') return false;
  if (shot.kind === 'testid') {
    try {
      await page
        .getByTestId(shot.testId)
        .screenshot({ path: filePath, timeout: elementScreenshotTimeoutMs });
    } catch (error) {
      if (error instanceof errors.TimeoutError) return false;
      throw error;
    }
    return true;
  }
  await page.screenshot({ path: filePath, fullPage: shot.kind === 'full' });
  return true;
}
