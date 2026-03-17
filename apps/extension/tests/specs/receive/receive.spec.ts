import { test } from '../../fixtures/fixtures';

test.describe('Receive Dialog', () => {
  test.describe.configure({ retries: 0 });

  test('That the Receive dialog renders and shows the correct address cards', async ({
    extensionId,
    globalPage,
    onboardingPage,
    homePage,
  }) => {
    await globalPage.setupAndUseApiCalls(extensionId);
    await onboardingPage.signInWithTestAccount(extensionId);
    await homePage.goToReceiveDialog();

    const dialog = homePage.page.getByRole('dialog');
    await test.expect(dialog.getByText('Receive')).toBeVisible();
    await test.expect(dialog.getByText('Stacks')).toBeVisible();
    await test.expect(dialog.getByText('Bitcoin Native Segwit')).toBeVisible();
    await test.expect(dialog.getByText('Bitcoin Taproot')).toBeVisible();
  });
});
