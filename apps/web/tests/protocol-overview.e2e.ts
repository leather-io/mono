import { expect } from '@playwright/test';

import { test } from '.';

test.describe('ProtocolOverview', () => {
  const testCases = [
    { slug: 'fast-pool', expectedPost: 'fast-pool' },
    { slug: 'fast-pool-v2', expectedPost: 'fast-pool' },
    { slug: 'planbetter', expectedPost: 'planbetter' },
    { slug: 'restake', expectedPost: 'restake' },
    { slug: 'xverse', expectedPost: 'xverse-pool' },
    { slug: 'stacking-dao', expectedPost: 'stacking-dao' },
    { slug: 'lisa', expectedPost: 'lisa' },
    { slug: 'unknown', expectedPost: undefined },
  ];

  for (const { slug, expectedPost } of testCases) {
    test(`renders correct post sentence and link for protocolSlug: ${slug}`, async ({ page }) => {
      await page.goto(`/protocol/${slug}`); // Adjust route as needed for your app
      if (expectedPost) {
        await expect(page.getByText(new RegExp(`Sentence for ${expectedPost}`))).toBeVisible();
        const learnMore = page.getByText('Learn more');
        expect(await learnMore.getAttribute('href')).toContain(expectedPost);
      } else {
        const sentence = await page.$('text=/Sentence for/');
        expect(sentence).toBeNull();
        const learnMore = await page.$('text=Learn more');
        expect(learnMore).toBeNull();
      }
    });
  }
});
