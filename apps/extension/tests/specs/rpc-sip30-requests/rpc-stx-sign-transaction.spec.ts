import { BrowserContext, Page } from '@playwright/test';
import { ChainId } from '@stacks/network';
import {
  MultiSigSpendingCondition,
  type TokenTransferPayloadWire,
  deserializeTransaction,
} from '@stacks/transactions';
import {
  TEST_ACCOUNT_1_PUBKEY,
  TEST_ACCOUNT_2_STX_ADDRESS,
  TEST_ACCOUNT_3_PUBKEY,
} from '@tests/mocks/constants';
import { mockFundedStacksAddress } from '@tests/mocks/mock-multisig';
import {
  exampleStacksMultisigPublicKeys,
  makeStacksPolicy,
  policyStateOverrides,
} from '@tests/mocks/mock-policies';
import { getConnectedTestAppPermissionsState } from '@tests/page-object-models/onboarding.page';
import { SharedComponentsSelectors } from '@tests/selectors/shared-component.selectors';
import { generateMultisigUnsignedStxTransfer, generateUnsignedStxTransfer } from '@tests/utils';

import { deriveStxMultisigAddress } from '@leather.io/stacks';

import { test } from '../../fixtures/fixtures';

test.describe('RPC: stx_signTransaction', () => {
  test.beforeEach(async ({ extensionId, globalPage, onboardingPage, page }) => {
    await globalPage.setupAndUseApiCalls(extensionId);
    await onboardingPage.signInWithTestAccount(extensionId, getConnectedTestAppPermissionsState());
    await page.goto('localhost:3000', { waitUntil: 'networkidle' });
  });

  function checkVisibleContent(context: BrowserContext) {
    return async (buttonToPress: 'Cancel' | 'Approve') => {
      const popup = await context.waitForEvent('page');
      await popup.waitForSelector('text="Account 1"');
      await popup.waitForSelector('text="0.0005 STX"');

      const displayerAddress = await popup
        .getByTestId(SharedComponentsSelectors.AddressDisplayer)
        .innerText()
        .then((value: string) => value.replaceAll('\n', ''));
      test.expect(displayerAddress).toEqual('SPXH3HNBPM5YP15VH16ZXZ9AX6CK289K3MCXRKCB');

      await popup.waitForTimeout(500);
      const btn = popup.locator('text="Approve"');

      if (buttonToPress === 'Approve') {
        await btn.click();
      } else {
        await popup.close();
      }
    };
  }

  function initiateTxSigningLeatherFormat(page: Page) {
    return async (txHex: string) =>
      page.evaluate(
        txHex =>
          (window as any).LeatherProvider.request('stx_signTransaction', {
            txHex,
            network: 'mainnet',
          }).catch((e: unknown) => e),
        txHex
      );
  }

  function initiateTxSigningSip30Format(page: Page) {
    return async (hex: string) =>
      page.evaluate(
        transaction =>
          (window as any).LeatherProvider.request('stx_signTransaction', { transaction }).catch(
            (e: unknown) => e
          ),
        hex
      );
  }

  test('that transaction details are the same after signing multi-signature STX transfer', async ({
    page,
    context,
  }) => {
    const multiSignatureTxHex = await generateMultisigUnsignedStxTransfer(
      TEST_ACCOUNT_2_STX_ADDRESS,
      500,
      100,
      'mainnet',
      [TEST_ACCOUNT_3_PUBKEY, TEST_ACCOUNT_1_PUBKEY],
      2,
      0
    );
    const [result] = await Promise.all([
      initiateTxSigningLeatherFormat(page)(multiSignatureTxHex),
      checkVisibleContent(context)('Approve'),
    ]);
    const deserializedUnsignedTxHex = deserializeTransaction(multiSignatureTxHex);
    const deserializedSignedTx = deserializeTransaction(result.result.txHex);
    test
      .expect((deserializedUnsignedTxHex.payload as TokenTransferPayloadWire).recipient)
      .toEqual((deserializedSignedTx.payload as TokenTransferPayloadWire).recipient);
    test
      .expect((deserializedUnsignedTxHex.payload as TokenTransferPayloadWire).amount)
      .toEqual((deserializedSignedTx.payload as TokenTransferPayloadWire).amount);
    test.expect(deserializedUnsignedTxHex.payload.type).toEqual(deserializedSignedTx.payload.type);
    test
      .expect(deserializedUnsignedTxHex.auth.spendingCondition.nonce)
      .toEqual(deserializedSignedTx.auth.spendingCondition.nonce);
    test
      .expect(deserializedUnsignedTxHex.auth.spendingCondition.fee)
      .toEqual(deserializedSignedTx.auth.spendingCondition.fee);
    test
      .expect(
        (deserializedUnsignedTxHex.auth.spendingCondition as MultiSigSpendingCondition)
          .signaturesRequired
      )
      .toEqual(
        (deserializedSignedTx.auth.spendingCondition as MultiSigSpendingCondition)
          .signaturesRequired
      );
    test
      .expect(deserializedUnsignedTxHex.auth.spendingCondition.signer)
      .toEqual(deserializedSignedTx.auth.spendingCondition.signer);
    test
      .expect(deserializedUnsignedTxHex.auth.spendingCondition.hashMode)
      .toEqual(deserializedSignedTx.auth.spendingCondition.hashMode);
    test
      .expect(
        (deserializedSignedTx.auth.spendingCondition as MultiSigSpendingCondition).fields.length
      )
      .toEqual(1);
  });

  test('Single signature STX transfer being rejected', async ({ page, context }) => {
    const singleSignatureTxHex = await generateUnsignedStxTransfer(
      TEST_ACCOUNT_2_STX_ADDRESS,
      500,
      'mainnet',
      TEST_ACCOUNT_3_PUBKEY
    );
    const [result] = await Promise.all([
      initiateTxSigningLeatherFormat(page)(singleSignatureTxHex),
      checkVisibleContent(context)('Cancel'),
    ]);

    delete result.id;

    test.expect(result).toEqual({
      jsonrpc: '2.0',
      error: {
        code: 4001,
        message: 'User rejected request',
      },
    });
  });

  test.describe('SIP-30 compatibility', () => {
    test('it works with SIP-30 formatted transactions', async ({ page, context }) => {
      const singleSignatureTxHex = await generateUnsignedStxTransfer(
        TEST_ACCOUNT_2_STX_ADDRESS,
        500,
        'mainnet',
        TEST_ACCOUNT_3_PUBKEY
      );
      const [result] = await Promise.all([
        initiateTxSigningSip30Format(page)(singleSignatureTxHex),
        checkVisibleContent(context)('Cancel'),
      ]);

      delete result.id;

      test.expect(result).toEqual({
        jsonrpc: '2.0',
        error: {
          code: 4001,
          message: 'User rejected request',
        },
      });
    });
  });
});

test.describe('RPC: stx_signTransaction with an active multisig policy', () => {
  // Must be the connected account's real STX pubkey (+ a cosigner) — the co-sign
  // flow validates the signer key is a member of the policy.
  const activePolicyPublicKeys = exampleStacksMultisigPublicKeys;
  const activePolicyThreshold = 2;
  const stacksPolicy = makeStacksPolicy({
    address: deriveStxMultisigAddress({
      publicKeys: activePolicyPublicKeys,
      threshold: activePolicyThreshold,
      chainId: ChainId.Mainnet,
    }),
    publicKeys: activePolicyPublicKeys,
    threshold: activePolicyThreshold,
  });

  test.beforeEach(async ({ extensionId, globalPage, onboardingPage, page, context }) => {
    await globalPage.setupAndUseApiCalls(extensionId);
    await mockFundedStacksAddress(context, stacksPolicy.address);
    await onboardingPage.signInWithTestAccount(extensionId, {
      ...getConnectedTestAppPermissionsState(),
      ...policyStateOverrides({ policies: [stacksPolicy], activePolicyId: stacksPolicy.id }),
    });
    await page.goto('localhost:3000', { waitUntil: 'networkidle' });
  });

  test('co-signs the multisig transaction with the member singlesig instead of proposing', async ({
    page,
    context,
  }) => {
    test.slow();

    const multiSignatureTxHex = await generateMultisigUnsignedStxTransfer(
      TEST_ACCOUNT_2_STX_ADDRESS,
      500,
      100,
      'mainnet',
      activePolicyPublicKeys,
      activePolicyThreshold,
      0,
      undefined,
      true
    );

    const [result] = await Promise.all([
      page.evaluate(
        txHex =>
          (window as any).LeatherProvider.request('stx_signTransaction', {
            txHex,
            network: 'mainnet',
          }).catch((e: unknown) => e),
        multiSignatureTxHex
      ),
      (async () => {
        const popup = await context.waitForEvent('page');
        await popup.waitForSelector('text="Account 1"');
        await test.expect(popup.locator('text="Propose transaction"')).toHaveCount(0);
        await popup.locator('text="Approve"').click({ timeout: 20_000 });
      })(),
    ]);

    const deserializedSignedTx = deserializeTransaction(result.result.txHex);
    test
      .expect(
        (deserializedSignedTx.auth.spendingCondition as MultiSigSpendingCondition).fields.length
      )
      .toEqual(1);
  });
});
