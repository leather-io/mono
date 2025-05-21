import { expect } from '@playwright/test';
import { test } from '.';

test.describe('PostPageHeading', () => {
  test('renders title, subtitle, and disclaimer', async ({ page }) => {
    await page.goto('/test-slug'); // Adjust route as needed for your app
    await expect(page.getByText('Test Title')).toBeVisible();
    await expect(page.getByText('Test subtitle')).toBeVisible();
    await expect(page.getByText('Test disclaimer')).toBeVisible();
  });

  test('handles missing fields gracefully', async ({ page }) => {
    await page.goto('/test-slug-missing-fields'); // Adjust route as needed for your app
    const title = await page.$('text=Test Title');
    expect(title).toBeNull();
    const subtitle = await page.$('text=Test subtitle');
    expect(subtitle).toBeNull();
    const disclaimer = await page.$('text=Test disclaimer');
    expect(disclaimer).toBeNull();
  });
}); 