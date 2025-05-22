import { expect, test } from '@playwright/test';

import { setupPostSectionHeadingMocks } from './utils/mock-data';

test.describe('PostSectionHeading', () => {
  // Setup mocks before each test
  test.beforeEach(async ({ page }) => {
    await setupPostSectionHeadingMocks(page);
  });

  test('renders sentence and Learn more link', async ({ page }) => {
    await page.goto('/section-slug');

    // Wait for the mock content to be loaded
    await page.waitForTimeout(500);

    // Check that the sentence is displayed
    await expect(page.getByText('This is a test sentence')).toBeVisible();

    // Check that the learn more link is displayed
    const learnMore = page.getByText('Learn more');
    await expect(learnMore).toBeVisible();

    // Check that the learn more link points to the correct URL
    const href = await learnMore.getAttribute('href');
    expect(href).toContain('section-slug');
  });

  test('renders disclaimer', async ({ page }) => {
    await page.goto('/section-slug');

    // Wait for the mock content to be loaded
    await page.waitForTimeout(500);

    // Check that the disclaimer is displayed
    await expect(page.getByText('Test disclaimer')).toBeVisible();
  });

  test('renders prefix and title', async ({ page }) => {
    await page.goto('/section-slug');

    // Wait for the mock content to be loaded
    await page.waitForTimeout(500);

    // Check that the prefixed title is displayed
    await expect(page.getByText('Step 1: Section Title')).toBeVisible();
  });

  test('handles missing post gracefully', async ({ page }) => {
    await page.goto('/section-slug-missing');

    // Wait for the mock content to be loaded
    await page.waitForTimeout(500);

    // Verify that the section heading is not present
    const el = await page.$('text=Step 1: Section Title');
    expect(el).toBeNull();
  });
});
