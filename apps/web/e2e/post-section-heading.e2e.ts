import { expect, test } from '@playwright/test';

test.describe('PostSectionHeading', () => {
  test('renders sentence and Learn more link', async ({ page }) => {
    await page.goto('/section-slug'); // Adjust route as needed for your app
    await expect(page.getByText('This is a test sentence')).toBeVisible();
    await expect(page.getByText('Learn more')).toBeVisible();
    const learnMore = page.getByText('Learn more');
    expect(await learnMore.getAttribute('href')).toContain('section-slug');
  });

  test('renders disclaimer', async ({ page }) => {
    await page.goto('/section-slug'); // Adjust route as needed for your app
    await expect(page.getByText('Test disclaimer')).toBeVisible();
  });

  test('renders prefix and title', async ({ page }) => {
    await page.goto('/section-slug'); // Adjust route as needed for your app
    await expect(page.getByText('Step 1: Section Title')).toBeVisible();
  });

  test('handles missing post gracefully', async ({ page }) => {
    await page.goto('/section-slug-missing'); // Adjust route as needed for your app
    const el = await page.$('text=Step 1: Section Title');
    expect(el).toBeNull();
  });
});
