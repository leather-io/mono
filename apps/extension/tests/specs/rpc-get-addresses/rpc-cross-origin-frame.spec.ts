import type { BrowserContext, Page } from '@playwright/test';

import { test } from '../../fixtures/fixtures';

const topLevelUrl = 'http://127.0.0.1:3000';
const iframeUrl = 'http://localhost:3000';

async function interceptRequestPopup(context: BrowserContext) {
  return context.waitForEvent('page');
}

async function injectIframe(page: Page, src: string) {
  await page.evaluate(
    async iframeSrc =>
      new Promise((resolve, reject) => {
        const iframe = document.createElement('iframe');
        iframe.src = iframeSrc;
        iframe.onload = () => resolve(undefined);
        iframe.onerror = () => reject(new Error('Failed to load iframe'));
        document.body.appendChild(iframe);
      }),
    src
  );
}

function getIframe(page: Page, url: string) {
  const frame = page.frames().find(candidate => candidate.url().startsWith(url));
  if (!frame) throw new Error(`No frame found for ${url}`);
  return frame;
}

test.describe('Rpc: cross-origin iframe requests', () => {
  test.beforeEach(async ({ extensionId, globalPage, onboardingPage }) => {
    await globalPage.setupAndUseApiCalls(extensionId);
    await onboardingPage.signInWithTestAccount(extensionId);
  });

  test('the approver warns about the embedded app and still resolves to the iframe', async ({
    page,
    context,
  }) => {
    await page.goto(topLevelUrl);
    await injectIframe(page, iframeUrl);
    const frame = getIframe(page, iframeUrl);

    const getAddressesPromise = frame.evaluate(() =>
      (window as any).LeatherProvider?.request('getAddresses')
    );

    const popup = await interceptRequestPopup(context);

    const callout = popup.getByTestId('cross-origin-frame-callout');
    await test.expect(callout).toBeVisible();
    await test.expect(callout).toContainText('localhost:3000');
    await test.expect(callout).toContainText('127.0.0.1');
    await test.expect(popup.getByText('Requested by')).toBeVisible();
    await test.expect(popup.getByRole('link', { name: 'localhost' })).toBeVisible();

    const approveButton = popup.getByTestId('get-addresses-approve-button');
    await test.expect(approveButton).toBeVisible();
    await approveButton.click();

    const result = await getAddressesPromise;
    if (!result) throw new Error('Expected result');
    test.expect(result.result.addresses.length).toBeGreaterThan(0);
  });

  test('a top-level request shows no embedded app warning', async ({ page, context }) => {
    await page.goto(topLevelUrl);

    const getAddressesPromise = page.evaluate(() =>
      (window as any).LeatherProvider?.request('getAddresses')
    );

    const popup = await interceptRequestPopup(context);

    const approveButton = popup.getByTestId('get-addresses-approve-button');
    await test.expect(approveButton).toBeVisible();
    await test.expect(popup.getByTestId('cross-origin-frame-callout')).toHaveCount(0);

    await approveButton.click();
    const result = await getAddressesPromise;
    if (!result) throw new Error('Expected result');
    test.expect(result.result.addresses.length).toBeGreaterThan(0);
  });
});
