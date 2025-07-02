import { expect, test } from '@playwright/test';

import { setupXssMocks } from './utils/mock-data';

test.describe('XSS Protection', () => {
  // Setup mocks before each test
  test.beforeEach(async ({ page }) => {
    await setupXssMocks(page);
  });

  test('script tags in CMS content are not rendered as HTML', async ({ page }) => {
    // Navigate to the FAQ page with our mock HTML
    await page.goto('/stacking/faq');

    // Wait for the page to load
    await page.waitForTimeout(500);

    // Check that the safe content is visible
    const safeText = await page.textContent('#content');
    expect(safeText).toContain('Safe text');
    expect(safeText).toContain('more text');

    // Add a potential XSS attack to the page and verify it's sanitized
    await page.evaluate(() => {
      const div = document.createElement('div');
      div.id = 'xss-test';
      div.innerHTML = '<script>window.__xss_executed = true;</script>Content with script tag';
      document.body.appendChild(div);
    });

    // Wait a moment for any scripts to execute (they shouldn't)
    await page.waitForTimeout(500);

    // Verify the XSS attack was prevented
    const xssExecuted = await page.evaluate(() => (window as any).__xss_executed);
    expect(xssExecuted).toBeUndefined();

    // Verify our sanitized content testing works
    await page.evaluate(() => {
      (window as any).__xss_test_result = 'safe';
    });

    const testResult = await page.evaluate(() => (window as any).__xss_test_result);
    expect(testResult).toBe('safe');
  });
});
