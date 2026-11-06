import type { BrowserContext, Page } from '@playwright/test';

const localHostnames = new Set(['localhost', '127.0.0.1']);
const transparentSvg = '<svg xmlns="http://www.w3.org/2000/svg" width="1" height="1" />';
const emptyHtmlDocument = '<!doctype html><html><head></head><body></body></html>';

export async function mockUnhandledRequests(page: Page | BrowserContext) {
  await page.route(/.*/, route => {
    const request = route.request();
    const url = new URL(request.url());
    if (!url.protocol.startsWith('http') || localHostnames.has(url.hostname)) {
      return route.continue();
    }
    const resourceType = request.resourceType();
    if (resourceType === 'image') {
      return route.fulfill({ body: transparentSvg, contentType: 'image/svg+xml' });
    }
    if (resourceType === 'document') {
      return route.fulfill({ body: emptyHtmlDocument, contentType: 'text/html' });
    }
    return route.abort();
  });
}
