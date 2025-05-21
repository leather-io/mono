import { expect } from '@playwright/test';
import { test } from '.';

test.describe('PostPageHeading', () => {
  test('renders title, subtitle, and disclaimer', async ({ page }) => {
    await page.goto('/test-slug'); // Adjust route as needed for your app
    await expect(page.getByText('Test Title')).toBeVisible();
    await expect(page.getByText('Test subtitle')).toBeVisible();
    await expect(page.getByText('Test disclaimer')).toBeVisible();
    // Check that the Learn more link is present and inline with the subtitle
    const subtitle = await page.getByText('Test subtitle');
    const learnMore = await page.getByText('Learn more');
    expect(await learnMore.evaluate(node => node.parentElement?.textContent)).toContain('Test subtitle');
    // Ensure there is no <hr> or border above the disclaimer
    const disclaimer = await page.getByText('Test disclaimer');
    const disclaimerPrev = await disclaimer.evaluateHandle(node => node.previousElementSibling);
    if (disclaimerPrev) {
      const tagName = await disclaimerPrev.evaluate(node => node.tagName);
      expect(tagName).not.toBe('HR');
    }
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