import { test } from '../../fixtures/fixtures';

test.describe('Account Actions (extensionRevamp)', () => {
  test.beforeEach(async ({ extensionId, globalPage, onboardingPage }) => {
    await globalPage.setupAndUseApiCalls(extensionId);
    await onboardingPage.signInWithTestAccount(extensionId);
  });

  test('that send button is visible', async ({ homePage }) => {
    await test.expect(homePage.sendButton).toBeVisible();
  });

  test('that receive button is visible', async ({ homePage }) => {
    await test.expect(homePage.receiveButton).toBeVisible();
  });

  test('that buy button is visible', async ({ page }) => {
    const buyButton = page.getByTestId('buy-btn');
    await test.expect(buyButton).toBeVisible();
  });

  test('that clicking send opens send flow', async ({ homePage, page }) => {
    await homePage.sendButton.click();

    const sendSheet = page.getByTestId('send-sheet');
    await test.expect(sendSheet).toBeVisible();
  });

  test('that clicking receive opens receive dialog', async ({ homePage, page }) => {
    await homePage.receiveButton.click();

    const receiveDialog = page.getByTestId('receive-dialog');
    await test.expect(receiveDialog).toBeVisible();
  });

  test('that clicking buy opens buy options', async ({ page }) => {
    const buyButton = page.getByTestId('buy-btn');
    await buyButton.click();

    const buySheet = page.getByTestId('buy-sheet');
    await test.expect(buySheet).toBeVisible();
  });

  test.describe('Mobile responsive behavior', () => {
    test.use({ viewport: { width: 375, height: 667 } });

    test('that transfer button shows on mobile', async ({ page }) => {
      const transferButton = page.getByTestId('transfer-btn');
      await test.expect(transferButton).toBeVisible();
    });

    test('that clicking transfer opens transfer sheet', async ({ page }) => {
      const transferButton = page.getByTestId('transfer-btn');
      await transferButton.click();

      const transferSheet = page.getByTestId('transfer-sheet');
      await test.expect(transferSheet).toBeVisible();
    });

    test('that transfer sheet has send option', async ({ page }) => {
      const transferButton = page.getByTestId('transfer-btn');
      await transferButton.click();

      const sendOption = page.getByTestId('transfer-sheet-send');
      await test.expect(sendOption).toBeVisible();
    });

    test('that transfer sheet has receive option', async ({ page }) => {
      const transferButton = page.getByTestId('transfer-btn');
      await transferButton.click();

      const receiveOption = page.getByTestId('transfer-sheet-receive');
      await test.expect(receiveOption).toBeVisible();
    });

    test('that fund button shows combined buy/sell on mobile', async ({ page }) => {
      const fundButton = page.getByTestId('fund-btn');
      await test.expect(fundButton).toBeVisible();
    });

    test('that clicking fund opens fund sheet', async ({ page }) => {
      const fundButton = page.getByTestId('fund-btn');
      await fundButton.click();

      const fundSheet = page.getByTestId('fund-sheet');
      await test.expect(fundSheet).toBeVisible();
    });
  });
});
