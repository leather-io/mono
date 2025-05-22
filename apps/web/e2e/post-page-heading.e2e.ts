import { expect, test } from '@playwright/test';

import { setupPostPageHeadingMocks } from './utils/mock-data';

test.describe('PostPageHeading', () => {
  // Setup mocks before each test
  test.beforeEach(async ({ page }) => {
    await setupPostPageHeadingMocks(page);
  });

  test('renders title, subtitle, and disclaimer', async ({ page }) => {
    await page.goto('/test-slug');

    // Wait for the mock content to be loaded
    await page.waitForTimeout(500);

    // Check that all the expected elements are visible
    await expect(page.getByText('Test Title')).toBeVisible();
    await expect(page.getByText('Test subtitle')).toBeVisible();
    await expect(page.getByText('Test disclaimer')).toBeVisible();

    // Check that the Learn more link is present and inline with the subtitle
    const learnMore = page.getByText('Learn more');
    await expect(learnMore).toBeVisible();

    // Check that the learn more link is a child of the paragraph with the subtitle
    const parentText = await learnMore.evaluate(node => node.parentElement?.textContent);
    expect(parentText).toContain('Test subtitle');
  });

  test('handles missing fields gracefully', async ({ page }) => {
    await page.goto('/test-slug-missing-fields');

    // Wait for the mock content to be loaded
    await page.waitForTimeout(500);

    // Verify that none of the elements are present on the page
    const title = await page.$('text=Test Title');
    expect(title).toBeNull();

    const subtitle = await page.$('text=Test subtitle');
    expect(subtitle).toBeNull();

    const disclaimer = await page.$('text=Test disclaimer');
    expect(disclaimer).toBeNull();
  });
});
