import type { BrowserContext, Page, Route } from '@playwright/test';
import { getConnectedTestAppPermissionsState } from '@tests/page-object-models/onboarding.page';

import { delay } from '@leather.io/utils';

import { test } from '../../fixtures/fixtures';

function mockComplianceCheckRequest(context: BrowserContext) {
  return async (routeHandler: (route: Route) => void) => {
    return context.route('**/v1/compliance/addresses/**', route => routeHandler(route));
  };
}

test.describe('Compliance checks', () => {
  test.beforeEach(async ({ extensionId, globalPage, onboardingPage, page }) => {
    await globalPage.setupAndUseApiCalls(extensionId);
    await onboardingPage.signInWithTestAccount(extensionId, getConnectedTestAppPermissionsState());
    await page.goto('localhost:3000', { waitUntil: 'networkidle' });
  });

  async function openIllegalTransfer(page: Page) {
    return page.evaluate(
      () =>
        // We only want the page window, don't wait for actual promise to finish
        void (window as any).LeatherProvider.request('sendTransfer', {
          // Known address from list, in readme of this
          // page https://github.com/0xB10C/ofac-sanctioned-digital-currency-addresses
          address: '12QtD5BFwRsdNsAZY76UVE1xyCGNTojH9h',
          amount: '1231',
        }).catch((e: unknown) => e)
    );
  }

  test('that it errors if non-compliant entity is detected', async ({ page, context }) => {
    await mockComplianceCheckRequest(context)(route =>
      route.fulfill({
        json: {
          address: '12QtD5BFwRsdNsAZY76UVE1xyCGNTojH9h',
          status: 'non_compliant',
          checks: [{ type: 'ofac', result: 'fail' }],
        },
      })
    );

    const [leatherApprover] = await Promise.all([
      context.waitForEvent('page'),
      openIllegalTransfer(page),
    ]);

    await test
      .expect(leatherApprover.getByText('Unable to handle request, errorCode: 1398'))
      .toBeVisible();
  });

  test('nothing happens when the compliance api is down', async ({ page, context }) => {
    await mockComplianceCheckRequest(context)(route => route.abort());

    const [leatherApprover] = await Promise.all([
      context.waitForEvent('page'),
      openIllegalTransfer(page),
    ]);

    await test.expect(leatherApprover.locator('text="0.00001231 BTC"')).toBeVisible();

    await test
      .expect(leatherApprover.locator('text="Unable to handle request, errorCode: 1398"'))
      .toBeHidden();
  });

  test('the addresses of all recipients are checked', async ({ context, page }) => {
    let entityCheckCount = 0;

    await mockComplianceCheckRequest(context)(route => {
      entityCheckCount += 1;
      const address = route.request().url().split('/').at(-1) ?? '';
      return route.fulfill({
        json: { address, status: 'compliant', checks: [{ type: 'ofac', result: 'pass' }] },
      });
    });

    await Promise.all([context.waitForEvent('page'), openIllegalTransfer(page)]);

    // Please forgive this timeout, we need to give the page time in order to
    // make the request, to be sure it was made. If this test ends up failing
    // due to a race condition, please let the author know.
    await delay(2000);

    const userAndRecipientAddressCount = 2;

    test.expect(entityCheckCount).toEqual(userAndRecipientAddressCount);
  });
});
