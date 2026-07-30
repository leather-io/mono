import { Page } from '@playwright/test';

// Setup mocks for XSS protection test
export async function setupXssMocks(page: Page) {
  await page.route('**/stacking/faq', async route => {
    await route.fulfill({
      status: 200,
      contentType: 'text/html',
      body: `
        <html>
          <head><title>FAQ Page</title></head>
          <body>
            <div id="content">
              <p>Safe text</p>
              <p>more text</p>
            </div>
          </body>
        </html>
      `,
    });
  });
}
