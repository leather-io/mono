import { test } from '../../fixtures/fixtures';

test.describe('Receive Dialog', () => {
  test.describe.configure({ retries: 0 });

  test('That the Receive dialog renders and shows the correct assets', async ({
    extensionId,
    globalPage,
    onboardingPage,
    homePage,
  }) => {
    await globalPage.setupAndUseApiCalls(extensionId);
    await onboardingPage.signInWithTestAccount(extensionId);
    await homePage.goToReceiveDialog();

    const dialog = homePage.page.getByRole('dialog');
    await test.expect(dialog.getByText('Choose asset')).toBeVisible();
    await test.expect(dialog.getByText('Tokens')).toBeVisible();
    await test.expect(dialog.getByText('Collectibles')).toBeVisible();
    await test.expect(dialog.getByText('Bitcoin')).toBeVisible();
    await test.expect(dialog.getByText('Stacks')).toBeVisible();
  });
});
