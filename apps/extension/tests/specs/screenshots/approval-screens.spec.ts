import { type BrowserContext, type Page } from '@playwright/test';
import {
  type ClarityValue,
  ClarityVersion,
  bufferCVFromString,
  noneCV,
  serializeCV,
  standardPrincipalCV,
} from '@stacks/transactions';
import {
  TEST_ACCOUNT_1_PUBKEY,
  TEST_ACCOUNT_2_STX_ADDRESS,
  TEST_ACCOUNT_3_PUBKEY,
  TEST_TESTNET_ACCOUNT_2_BTC_ADDRESS,
} from '@tests/mocks/constants';
import { mockTestAccountBtcBroadcastTransaction } from '@tests/mocks/mock-bitcoin-tx';
import { overrideLaunchDarklyFlags } from '@tests/mocks/mock-launchdarkly';
import { mockLeatherApiRequests } from '@tests/mocks/mock-leather-api';
import { exampleStacksMultisigPublicKeys, exampleWshDescriptor } from '@tests/mocks/mock-policies';
import { mockStacksTokenContract } from '@tests/mocks/mock-stacks-contract';
import { getConnectedTestAppPermissionsState } from '@tests/page-object-models/onboarding.page';
import { generateMultisigUnsignedStxTransfer, generateUnsignedStxTransfer } from '@tests/utils';
import path from 'path';

import { test } from '../../fixtures/fixtures';

const shotsDir = path.join(
  process.cwd(),
  '../web/app/pages/playground/areas/extension-approval-screens/shots'
);

const stillness = `*, *::before, *::after {
  animation-duration: 0s !important;
  animation-delay: 0s !important;
  transition-duration: 0s !important;
  transition-delay: 0s !important;
}`;

async function capture(context: BrowserContext, name: string, anchor: string) {
  const popup = await context.waitForEvent('page');
  await popup.setViewportSize({ width: 390, height: 756 });
  await popup.waitForLoadState('domcontentloaded');
  await popup.addStyleTag({ content: stillness });
  try {
    await popup.getByText(anchor, { exact: false }).first().waitFor({ timeout: 15000 });
  } catch {
    const heading = await popup
      .locator('h1')
      .first()
      .innerText()
      .catch(() => '(no h1)');
    const body = await popup
      .locator('body')
      .innerText()
      .catch(() => '(no body)');
    // eslint-disable-next-line no-console
    console.log(
      `[capture] ${name}: anchor "${anchor}" not found. h1="${heading}" url="${popup.url()}" body="${body.slice(0, 300).replace(/\n/g, ' | ')}"`
    );
  }
  await popup.waitForTimeout(1200);
  await popup.screenshot({ path: path.join(shotsDir, `${name}.png`), fullPage: true });
  await popup.close();
  return popup;
}

function request(page: Page, method: string, params: unknown) {
  return page.evaluate(
    ({ method, params }) =>
      (window as any).LeatherProvider.request(method, params).catch((e: unknown) => e),
    { method, params }
  );
}

test.describe('Approval screen screenshots', () => {
  test.beforeEach(async ({ extensionId, globalPage, onboardingPage, page, context }) => {
    await globalPage.setupAndUseApiCalls(extensionId);
    await overrideLaunchDarklyFlags(context, { releaseAddAccount: true });
    await onboardingPage.signInWithTestAccount(extensionId, getConnectedTestAppPermissionsState());
    await page.goto('localhost:3000', { waitUntil: 'networkidle' });
  });

  test('stx_callContract', async ({ page, context }) => {
    test.setTimeout(60000);
    const args: ClarityValue[] = [
      bufferCVFromString('id'),
      bufferCVFromString('test'),
      standardPrincipalCV(TEST_ACCOUNT_2_STX_ADDRESS),
      noneCV(),
    ];
    await Promise.all([
      request(page, 'stx_callContract', {
        contract: 'SP000000000000000000002Q6VF78.bns',
        functionName: 'name-transfer',
        functionArgs: args.map(arg => serializeCV(arg)),
      }),
      capture(context, '01-stx-call-contract', 'Sign contract'),
    ]);
  });

  test('stx_callContract allow mode', async ({ page, context }) => {
    test.setTimeout(60000);
    await Promise.all([
      request(page, 'stx_callContract', {
        contract: 'ST1X6M947Z7E58CNE0H8YJVJTVKS9VW0PHEG3NHN3.dull-sapphire-bird',
        functionName: 'buy',
        functionArgs: ['010000000000000000000000000000002a'],
        postConditions: [],
        postConditionMode: 'allow',
      }),
      capture(
        context,
        '02-stx-call-contract-allow-mode',
        'This transaction can transfer any of your assets'
      ),
    ]);
  });

  test('stx_deployContract', async ({ page, context }) => {
    test.setTimeout(60000);
    await Promise.all([
      request(page, 'stx_deployContract', {
        name: 'mock-contract-name',
        clarityCode: mockStacksTokenContract,
        clarityVersion: ClarityVersion.Clarity3,
      }),
      capture(context, '03-stx-deploy-contract', 'Deploy contract'),
    ]);
  });

  test('stx_signTransaction single sig', async ({ page, context }) => {
    test.setTimeout(60000);
    const txHex = await generateUnsignedStxTransfer(
      TEST_ACCOUNT_2_STX_ADDRESS,
      1234999000000,
      'mainnet',
      TEST_ACCOUNT_1_PUBKEY
    );
    await Promise.all([
      request(page, 'stx_signTransaction', { txHex, network: 'mainnet' }),
      capture(context, '04-stx-sign-transaction', 'Sign transaction'),
    ]);
  });

  test('stx_signTransaction multisig', async ({ page, context }) => {
    test.setTimeout(60000);
    const txHex = await generateMultisigUnsignedStxTransfer(
      TEST_ACCOUNT_2_STX_ADDRESS,
      1234999000000,
      100,
      'mainnet',
      [TEST_ACCOUNT_3_PUBKEY, TEST_ACCOUNT_1_PUBKEY],
      2,
      0
    );
    await Promise.all([
      request(page, 'stx_signTransaction', { txHex, network: 'mainnet' }),
      capture(context, '05-stx-sign-transaction-multisig', 'Sign transaction'),
    ]);
  });

  test('stx_transferStx', async ({ page, context }) => {
    test.setTimeout(60000);
    await Promise.all([
      request(page, 'stx_transferStx', {
        amount: 1234999000000,
        memo: 'mock-memo',
        recipient: TEST_ACCOUNT_2_STX_ADDRESS,
      }),
      capture(context, '06-stx-transfer-stx', 'Send token'),
    ]);
  });

  test('stx_transferStx within balance', async ({ page, context }) => {
    test.setTimeout(60000);
    await Promise.all([
      request(page, 'stx_transferStx', {
        amount: 1500000,
        memo: 'mock-memo',
        recipient: TEST_ACCOUNT_2_STX_ADDRESS,
      }),
      capture(context, '06b-stx-transfer-stx-in-balance', 'Send token'),
    ]);
  });

  test('stx_signTransaction within balance', async ({ page, context }) => {
    test.setTimeout(60000);
    const txHex = await generateUnsignedStxTransfer(
      TEST_ACCOUNT_2_STX_ADDRESS,
      1500000,
      'mainnet',
      TEST_ACCOUNT_1_PUBKEY
    );
    await Promise.all([
      request(page, 'stx_signTransaction', { txHex, network: 'mainnet' }),
      capture(context, '04b-stx-sign-transaction-in-balance', 'Sign transaction'),
    ]);
  });

  test('sendTransfer', async ({ page, context }) => {
    test.setTimeout(60000);
    void (async () => {
      const popup = await context.waitForEvent('page');
      await mockLeatherApiRequests(popup);
      await mockTestAccountBtcBroadcastTransaction(popup);
    })();
    await Promise.all([
      request(page, 'sendTransfer', {
        recipients: [{ address: TEST_TESTNET_ACCOUNT_2_BTC_ADDRESS, amount: '800' }],
        network: 'testnet4',
      }),
      capture(context, '07-send-transfer', 'Send token'),
    ]);
  });

  test('getAddresses', async ({ page, context }) => {
    test.setTimeout(60000);
    await Promise.all([
      request(page, 'getAddresses', undefined),
      capture(context, '08-get-addresses', 'Connect app'),
    ]);
  });

  test('stx_signMessage utf8', async ({ page, context }) => {
    test.setTimeout(60000);
    await Promise.all([
      request(page, 'stx_signMessage', {
        message: 'Sign in to DeFi Rewards. Nonce: 8f21c0',
        messageType: 'utf8',
      }),
      capture(context, '09-stx-sign-message', 'Sign message'),
    ]);
  });

  test('signMessage bip322', async ({ page, context }) => {
    test.setTimeout(60000);
    await Promise.all([
      request(page, 'signMessage', { message: 'test', paymentType: 'p2wpkh' }),
      capture(context, '10-sign-message-bip322', 'Sign message'),
    ]);
  });
});

test.describe('Add account approval screenshots', () => {
  test.beforeEach(async ({ extensionId, globalPage, onboardingPage, context }) => {
    await globalPage.setupAndUseApiCalls(extensionId);
    await overrideLaunchDarklyFlags(context, { releaseAddAccount: true });
    await onboardingPage.signInWithTestAccount(extensionId);
  });

  test('stx_addAccount', async ({ page, context }) => {
    test.setTimeout(60000);
    await page.goto('localhost:3000');
    const pending = page.evaluate(
      params => (window as any).LeatherProvider?.request('stx_addAccount', params),
      {
        name: 'Shared treasury',
        publicKeys: [exampleStacksMultisigPublicKeys[0], exampleStacksMultisigPublicKeys[1]],
        threshold: 2,
      }
    );
    await capture(context, '11-stx-add-account', 'Verify multisig address');
    await pending.catch(() => null);
  });

  test('btc_addAccount', async ({ page, context }) => {
    test.setTimeout(60000);
    await page.goto('localhost:3000');
    const pending = page.evaluate(
      params => (window as any).LeatherProvider?.request('btc_addAccount', params),
      { name: 'Shared cold storage', descriptor: exampleWshDescriptor }
    );
    await capture(context, '12-btc-add-account', 'Verify multisig address');
    await pending.catch(() => null);
  });
});
