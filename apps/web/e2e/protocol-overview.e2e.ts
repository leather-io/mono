import { expect, test } from '@playwright/test';
import { setupProtocolMocks } from './utils/mock-data';

// Using real application routes to test protocol components
test.describe('ProtocolOverview', () => {
  // Setup mocks before each test
  test.beforeEach(async ({ page }) => {
    await setupProtocolMocks(page);
  });

  // Map test cases to real routes in the application
  const testCases = [
    // Pool protocols should use /stacking/pool/:slug
    { slug: 'fast-pool', route: '/stacking/pool/fast-pool' },
    { slug: 'fast-pool-v2', route: '/stacking/pool/fast-pool-v2' },
    { slug: 'planbetter', route: '/stacking/pool/planbetter' },
    { slug: 'restake', route: '/stacking/pool/restake' },
    { slug: 'xverse', route: '/stacking/pool/xverse' },
    
    // Liquid stacking protocols should use /stacking/liquid/:slug
    { slug: 'stacking-dao', route: '/stacking/liquid/stacking-dao' },
    { slug: 'lisa', route: '/stacking/liquid/lisa' },
    
    // Unknown protocols should redirect to 404, which is expected behavior
    { slug: 'unknown', route: '/stacking/pool/unknown' },
  ];

  for (const { slug, route } of testCases) {
    test(`renders correct protocol info for ${slug}`, async ({ page }) => {
      // Navigate to the actual route that would render the protocol component
      await page.goto(route);
      
      // For the unknown protocol, we expect to be redirected to a 404 page
      if (slug === 'unknown') {
        // Wait briefly to ensure page is loaded
        await page.waitForTimeout(1000);
        
        // On a 404 page, we expect to see error text
        await expect(page.getByText(/Oops|404|not found/i).first()).toBeVisible();
        return;
      }
      
      // For valid protocols, we expect to see protocol-specific content
      await page.waitForTimeout(1000);
      
      // Check the page title using the heading role which should be more specific
      const heading = page.getByRole('heading', { level: 1 }).first();
      await expect(heading).toBeVisible();
      
      // Verify the heading contains our protocol slug
      const headingText = await heading.textContent();
      expect(headingText?.toLowerCase()).toContain(slug.toLowerCase());
    });
  }
});
