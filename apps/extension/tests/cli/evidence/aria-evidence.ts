import type { Page } from '@playwright/test';

export async function readAriaSnapshot(page: Page): Promise<string> {
  return page.getByRole('document').ariaSnapshot();
}
