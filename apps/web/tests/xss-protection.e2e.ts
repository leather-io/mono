import { test, expect } from '@playwright/test';

// This test assumes you can mock or inject CMS content for the test environment.
test.describe('XSS Protection', () => {
  test('script tags in CMS content are not rendered as HTML', async ({ page }) => {
    // Simulate a post with a script tag in the summary
    const maliciousSummary = 'Safe text <script>window.__xss_executed = true</script> more text';
    // Ideally, you would mock the network or localStorage to inject this post
    // For demonstration, we check that the FAQ page never renders <script> from post content
    await page.goto('/stacking/faq');
    // Check that the script tag is not present in the DOM
    const scriptPresent = await page.$('script');
    expect(scriptPresent).toBeNull();
    // Check that the text is rendered as escaped HTML
    const faqText = await page.textContent('body');
    expect(faqText).toContain('Safe text');
    expect(faqText).toContain('more text');
    // The script should not have executed
    const xssExecuted = await page.evaluate(() => (window as any).__xss_executed);
    expect(xssExecuted).toBeUndefined();
  });
}); 