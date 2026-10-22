import type { Page } from '@playwright/test';
import { writeFileSync } from 'node:fs';

export async function captureAriaSnapshot(page: Page, filePath: string) {
  const snapshot = await page.getByRole('document').ariaSnapshot();
  writeFileSync(filePath, `${snapshot}\n`);
}
