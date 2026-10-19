import { NetworkSelectors } from '@tests/selectors/network.selectors';

import { MEMPOOL_BASE_URL } from '@leather.io/constants';
import { BITCOIN_API_BASE_URL_MAINNET, BITCOIN_API_BASE_URL_TESTNET4 } from '@leather.io/models';

import { test } from '../../fixtures/fixtures';

test.describe('Networks tests', () => {
  test.beforeEach(async ({ extensionId, globalPage, onboardingPage, networkPage }) => {
    await globalPage.setupAndUseApiCalls(extensionId);
    await onboardingPage.signInWithTestAccount(extensionId);
    await networkPage.openAddNewNetworkPage();
  });

  test('that bitcoin api url changes on selecting different network', async ({ page }) => {
    await page.getByTestId(NetworkSelectors.AddNetworkBitcoinAPISelector).click();
    await page.getByTestId(NetworkSelectors.BitcoinApiOptionTestnet).click();

    const bitcoinUrl = page.getByTestId(NetworkSelectors.NetworkBitcoinAddress);

    test.expect(await bitcoinUrl.inputValue()).toEqual(BITCOIN_API_BASE_URL_TESTNET4);
  });

  test('bitcoin api dropdown relabels to Custom when values diverge from a preset', async ({
    page,
    networkPage,
  }) => {
    const selector = page.getByTestId(NetworkSelectors.AddNetworkBitcoinAPISelector);

    await test.expect(selector).toContainText('Mainnet');

    await networkPage.inputNetworkBitcoinAddressField('https://my-own-node.example/api');
    await test.expect(selector).toContainText('Custom');

    await selector.click();
    await page.getByTestId(NetworkSelectors.BitcoinApiOptionTestnet).click();
    await test.expect(selector).toContainText('Testnet4');
    await test.expect(selector).not.toContainText('Custom');

    await selector.click();
    await test.expect(page.locator('[data-testid^="bitcoin-api-option-"]')).toHaveCount(5);
  });

  test('reselecting the active preset after a custom edit resets its URLs', async ({
    page,
    networkPage,
  }) => {
    const selector = page.getByTestId(NetworkSelectors.AddNetworkBitcoinAPISelector);
    const bitcoinUrl = page.getByTestId(NetworkSelectors.NetworkBitcoinAddress);

    await test.expect(selector).toContainText('Mainnet');

    await networkPage.inputNetworkBitcoinAddressField('https://my-own-node.example/api');
    await test.expect(selector).toContainText('Custom');

    await selector.click();
    await page.getByTestId('bitcoin-api-option-mainnet').click();

    await test.expect(selector).toContainText('Mainnet');
    test.expect(await bitcoinUrl.inputValue()).toEqual(BITCOIN_API_BASE_URL_MAINNET);
  });

  test('validation error when stacks api url is empty', async ({ networkPage }) => {
    await networkPage.inputNetworkNameField('Test network');
    await networkPage.inputNetworkStacksAddressField('');
    await networkPage.inputNetworkBitcoinAddressField(`${MEMPOOL_BASE_URL}/testnet/api`);
    await networkPage.inputNetworkKeyField('test-network');
    await networkPage.clickAddNetwork();
    await networkPage.waitForErrorMessage();

    const errorMsgElement = networkPage.getErrorMessage();
    const errorMessage = await errorMsgElement.innerText();
    test.expect(errorMessage).toEqual(NetworkSelectors.EmptyStacksAddressError);
  });

  test('validation error when name is empty', async ({ networkPage }) => {
    await networkPage.clickAddNetwork();
    await networkPage.waitForErrorMessage();

    const errorMsgElement = networkPage.getErrorMessage();
    const errorMessage = await errorMsgElement.innerText();
    test.expect(errorMessage).toEqual(NetworkSelectors.EmptyNameError);
  });

  test('validation error when key is empty', async ({ networkPage }) => {
    await networkPage.inputNetworkNameField('Test network');
    await networkPage.clickAddNetwork();
    await networkPage.waitForErrorMessage();

    const errorMsgElement = networkPage.getErrorMessage();
    const errorMessage = await errorMsgElement.innerText();
    test.expect(errorMessage).toEqual(NetworkSelectors.EmptyKeyError);
  });

  test('validation error when bitcoin api url is empty', async ({ networkPage }) => {
    await networkPage.inputNetworkNameField('Test network');
    await networkPage.inputNetworkBitcoinAddressField('');
    await networkPage.inputNetworkKeyField('test-network');
    await networkPage.clickAddNetwork();
    await networkPage.waitForErrorMessage();

    const errorMsgElement = networkPage.getErrorMessage();
    const errorMessage = await errorMsgElement.innerText();
    test.expect(errorMessage).toEqual(NetworkSelectors.EmptyBitcoinURLError);
  });

  test('unable to fetch info from stacks node', async ({ networkPage }) => {
    await networkPage.inputNetworkNameField('Test network');
    await networkPage.inputNetworkStacksAddressField('https://www.google.com/');
    await networkPage.inputNetworkKeyField('test-network');
    await networkPage.clickAddNetwork();
    await networkPage.waitForErrorMessage();

    const errorMsgElement = networkPage.getErrorMessage();
    const errorMessage = await errorMsgElement.innerText();
    test.expect(errorMessage).toEqual(NetworkSelectors.NoStacksNodeFetch);
  });

  test('unable to fetch mempool from bitcoin node', async ({ networkPage }) => {
    await networkPage.inputNetworkNameField('Test network');
    await networkPage.inputNetworkBitcoinAddressField('https://www.google.com/');
    await networkPage.inputNetworkKeyField('test-network');
    await networkPage.clickAddNetwork();
    await networkPage.waitForErrorMessage();

    const errorMsgElement = networkPage.getErrorMessage();
    const errorMessage = await errorMsgElement.innerText();
    test.expect(errorMessage).toEqual(NetworkSelectors.NoBitcoinNodeFetch);
  });

  test('proper initial values on edit network', async ({ homePage, networkPage }) => {
    await networkPage.inputNetworkNameField('Test network');
    await networkPage.inputNetworkKeyField('test-network');
    await networkPage.inputNetworkStacksAddressField('https://api.testnet.hiro.so');

    await networkPage.clickAddNetwork();
    await homePage.waitForHomePageReady();

    await networkPage.openNetworkPage();

    await networkPage.page.getByTestId(NetworkSelectors.NetworkMenuBtn).click();
    await networkPage.page.getByTestId(NetworkSelectors.EditNetworkMenuBtn).click();

    const stacksInputText = await networkPage.page
      .getByTestId(NetworkSelectors.NetworkStacksAddress)
      .inputValue();

    test.expect(stacksInputText).toEqual('https://api.testnet.hiro.so');
  });

  test('delete network', async ({ homePage, networkPage }) => {
    const id = 'test-network';

    await networkPage.inputNetworkNameField('Test network');
    await networkPage.inputNetworkKeyField(id);
    await networkPage.inputNetworkStacksAddressField('https://api.testnet.hiro.so');

    await networkPage.clickAddNetwork();
    await homePage.waitForHomePageReady();

    await networkPage.openNetworkPage();

    let networkEl = networkPage.page.getByTestId(id);

    await test.expect(networkEl).toHaveCount(1);

    await networkPage.page.getByTestId(NetworkSelectors.NetworkMenuBtn).click();
    await networkPage.page.getByTestId(NetworkSelectors.DeleteNetworkMenuBtn).click();

    networkEl = networkPage.page.getByTestId(id);

    await test.expect(networkEl).toHaveCount(0);
  });
});
