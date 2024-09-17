import { expect } from 'detox';

// TODO: write some basic tests for wallet
// Leaving some previous setup untouched as an example for the new tests
describe('Example', () => {
  beforeAll(async () => {
    await device.launchApp();
  });

  beforeEach(async () => {
    await device.reloadReactNative();
  });
  it.skip('test1', async () => {
    await expect(element(by.id('test-id'))).toBeVisible();
    await expect(element(by.id('test-id'))).toBeVisible();

    await element(by.id('test-id')).tap();
    await element(by.id('test-id')).typeText('test@test.test');
    await element(by.id('test-id')).tap();

    await expect(element(by.id('test-id'))).toBeVisible();

    await element(by.id('test-id')).tap();

    await expect(element(by.id('test-id'))).toBeVisible();
    await expect(element(by.id('test-id'))).toBeVisible();
  });
});
