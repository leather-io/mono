import { expect } from 'detox';

import { WelcomeScreenTestIds } from '../test-ids';

describe('Example', () => {
  beforeAll(async () => {
    await device.launchApp();
  });

  beforeEach(async () => {
    await device.reloadReactNative();
  });
  it('should be able to submit email', async () => {
    await expect(element(by.id(WelcomeScreenTestIds.SubmitEmailButton))).toBeVisible();
    await expect(element(by.id(WelcomeScreenTestIds.EmailInput))).toBeVisible();

    await element(by.id(WelcomeScreenTestIds.EmailInput)).tap();
    await element(by.id(WelcomeScreenTestIds.EmailInput)).typeText('test@test.test');
    await element(by.id(WelcomeScreenTestIds.SubmitEmailButton)).tap();

    await expect(element(by.id(WelcomeScreenTestIds.DoneButton))).toBeVisible();

    await element(by.id(WelcomeScreenTestIds.DoneButton)).tap();

    await expect(element(by.id(WelcomeScreenTestIds.SubmitEmailButton))).toBeVisible();
    await expect(element(by.id(WelcomeScreenTestIds.EmailInput))).toBeVisible();
  });

  it('should be able to submit email and open link to X', async () => {
    await expect(element(by.id(WelcomeScreenTestIds.SubmitEmailButton))).toBeVisible();
    await expect(element(by.id(WelcomeScreenTestIds.EmailInput))).toBeVisible();

    await element(by.id(WelcomeScreenTestIds.EmailInput)).tap();
    await element(by.id(WelcomeScreenTestIds.EmailInput)).typeText('test@test.test');
    await element(by.id(WelcomeScreenTestIds.SubmitEmailButton)).tap();

    await expect(element(by.id(WelcomeScreenTestIds.DoneButton))).toBeVisible();
    await expect(element(by.id(WelcomeScreenTestIds.OpenXButton))).toBeVisible();

    await element(by.id(WelcomeScreenTestIds.OpenXButton)).tap();

    // TODO: we need to find out if the user actually got redirected to Leather X
  });
});
