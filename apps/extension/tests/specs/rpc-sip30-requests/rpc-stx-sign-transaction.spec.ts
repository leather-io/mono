import { type BrowserContext, type Page } from '@playwright/test';
import {
  type MultiSigSpendingCondition,
  PayloadType,
  type StacksTransactionWire,
  type TokenTransferPayloadWire,
  deserializeTransaction,
  isSingleSig,
} from '@stacks/transactions';
import { requestLeatherProvider } from '@tests/leather-provider';
import {
  TEST_ACCOUNT_1_PUBKEY,
  TEST_ACCOUNT_2_STX_ADDRESS,
  TEST_ACCOUNT_3_PUBKEY,
} from '@tests/mocks/constants';
import { getConnectedTestAppPermissionsState } from '@tests/page-object-models/onboarding.page';
import { SharedComponentsSelectors } from '@tests/selectors/shared-component.selectors';
import { generateMultisigUnsignedStxTransfer, generateUnsignedStxTransfer } from '@tests/utils';
import { z } from 'zod';

import { test } from '../../fixtures/fixtures';

const signTransactionResultSchema = z.object({ txHex: z.string() });

function getTokenTransferPayload(tx: StacksTransactionWire): TokenTransferPayloadWire {
  if (tx.payload.payloadType !== PayloadType.TokenTransfer) {
    throw new Error('Expected a token transfer payload');
  }
  return tx.payload;
}

function getMultiSigSpendingCondition(tx: StacksTransactionWire): MultiSigSpendingCondition {
  const { spendingCondition } = tx.auth;
  if (isSingleSig(spendingCondition)) throw new Error('Expected a multi-sig spending condition');
  return spendingCondition;
}

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

      const displayerText = await popup
        .getByTestId(SharedComponentsSelectors.AddressDisplayer)
        .innerText();
      const displayerAddress = displayerText.replaceAll('\n', '');
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
      page.evaluate(requestLeatherProvider, {
        method: 'stx_signTransaction',
        params: { txHex, network: 'mainnet' },
      });
  }

  function initiateTxSigningSip30Format(page: Page) {
    return async (hex: string) =>
      page.evaluate(requestLeatherProvider, {
        method: 'stx_signTransaction',
        params: { transaction: hex },
      });
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
    const deserializedSignedTx = deserializeTransaction(
      signTransactionResultSchema.parse(result.result).txHex
    );
    test
      .expect(getTokenTransferPayload(deserializedUnsignedTxHex).recipient)
      .toEqual(getTokenTransferPayload(deserializedSignedTx).recipient);
    test
      .expect(getTokenTransferPayload(deserializedUnsignedTxHex).amount)
      .toEqual(getTokenTransferPayload(deserializedSignedTx).amount);
    test.expect(deserializedUnsignedTxHex.payload.type).toEqual(deserializedSignedTx.payload.type);
    test
      .expect(deserializedUnsignedTxHex.auth.spendingCondition.nonce)
      .toEqual(deserializedSignedTx.auth.spendingCondition.nonce);
    test
      .expect(deserializedUnsignedTxHex.auth.spendingCondition.fee)
      .toEqual(deserializedSignedTx.auth.spendingCondition.fee);
    test
      .expect(getMultiSigSpendingCondition(deserializedUnsignedTxHex).signaturesRequired)
      .toEqual(getMultiSigSpendingCondition(deserializedSignedTx).signaturesRequired);
    test
      .expect(deserializedUnsignedTxHex.auth.spendingCondition.signer)
      .toEqual(deserializedSignedTx.auth.spendingCondition.signer);
    test
      .expect(deserializedUnsignedTxHex.auth.spendingCondition.hashMode)
      .toEqual(deserializedSignedTx.auth.spendingCondition.hashMode);
    test.expect(getMultiSigSpendingCondition(deserializedSignedTx).fields.length).toEqual(1);
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
