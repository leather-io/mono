import { getConnectedTestAppPermissionsState } from '@tests/page-object-models/onboarding.page';
import path from 'path';

import { RouteUrls } from '@shared/route-urls';

import { test } from '../../fixtures/fixtures';

const shotsDir = path.join(
  process.cwd(),
  '../web/app/pages/playground/areas/extension-approval-screens/shots'
);

test.describe('Approval screens preview page', () => {
  test('renders the live component grid', async ({
    extensionId,
    globalPage,
    onboardingPage,
    page,
  }) => {
    test.setTimeout(90000);
    await globalPage.setupAndUseApiCalls(extensionId);
    await onboardingPage.signInWithTestAccount(extensionId, getConnectedTestAppPermissionsState());

    await page.setViewportSize({ width: 1720, height: 1100 });
    await page.goto(
      `chrome-extension://${extensionId}/index.html#${RouteUrls.ApprovalScreensPreview}`
    );
    await page.waitForLoadState('domcontentloaded');

    await page
      .getByText('Approval screens — live components')
      .waitFor({ timeout: 20000 })
      .catch(() => null);

    await page.waitForTimeout(3000);

    const cellTitles = await page.locator('h2').allInnerTexts();
    // eslint-disable-next-line no-console
    console.log(`[preview] cells: ${cellTitles.length} -> ${cellTitles.join(' / ')}`);
    // eslint-disable-next-line no-console
    console.log(
      `[preview] body sample: ${(await page.locator('body').innerText())
        .slice(0, 300)
        .replace(/\n/g, ' | ')}`
    );

    await page.screenshot({ path: path.join(shotsDir, 'preview-live-components.png') });
  });
});
