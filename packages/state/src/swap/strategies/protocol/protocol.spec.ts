import { STACKS_MAINNET } from '@stacks/network';
import { describe, expect, test, vi } from 'vitest';

import { TransactionFeeTier } from '@leather.io/models';
import { BitcoinCoinSelectionService, BitcoinTransactionFeesService } from '@leather.io/services';
import { assertExistence, createMoney } from '@leather.io/utils';

import { SwapDependencies } from '../../swap-state.types';
import { DUMMY_P2TR_RECIPIENT } from '../../swap.constants';
import {
  createAccountRequest,
  createAccountSwapAsset,
  defaultBtcAsset,
} from '../../tests/test-utils/fixtures';
import {
  createStubBitcoinCoinSelectionService,
  createStubBitcoinTransactionFeesService,
  createStubMarketDataService,
  createStubStacksSigner,
  createStubStacksTransactionFeesService,
  createStubSwapService,
} from '../../tests/test-utils/services.stub';
import { getProtocolStrategy } from './protocol';

const standardStubFeeRate = 20;
const stubMaxSpendAmount = '200000000';
const feeTier: TransactionFeeTier = 'standard';

function createBtcContext(customFee: number | null) {
  const getBitcoinTransactionFees = vi.fn(
    createStubBitcoinTransactionFeesService().getBitcoinTransactionFees
  );
  const calculateMaxSpend = vi.fn(createStubBitcoinCoinSelectionService().calculateMaxSpend);
  const accountRequest = createAccountRequest();
  const dependencies: SwapDependencies = {
    accountRequest,
    stacks: {
      stacksSigner: createStubStacksSigner(),
      stacksNetwork: STACKS_MAINNET,
      broadcast: vi.fn(),
      nextNonce: undefined,
    },
    services: {
      swapService: createStubSwapService(),
      marketDataService: createStubMarketDataService(),
      stacksTransactionFeesService: createStubStacksTransactionFeesService(),
      bitcoinTransactionFeesService: {
        getBitcoinTransactionFees,
      } as unknown as BitcoinTransactionFeesService,
      bitcoinCoinSelectionService: { calculateMaxSpend } as unknown as BitcoinCoinSelectionService,
    },
  };
  const balance = createAccountSwapAsset({ asset: defaultBtcAsset, balance: { crypto: 100_000 } })
    .balance?.crypto;
  assertExistence(balance, 'Expected a BTC balance in fixture');
  const expectedAccountRequest = {
    account: accountRequest.account,
    exclusions: { taprootAddresses: true },
  };
  return {
    context: { balance, dependencies, feeTier, customFee, signal: new AbortController().signal },
    getBitcoinTransactionFees,
    calculateMaxSpend,
    expectedAccountRequest,
  };
}

describe('nativeBtcStrategy', () => {
  describe('resolveSpendableAmount', () => {
    test('resolves the max spend from native segwit utxos only', async () => {
      const { context, getBitcoinTransactionFees, calculateMaxSpend, expectedAccountRequest } =
        createBtcContext(null);

      const amount = await getProtocolStrategy('nativeBtc').resolveSpendableAmount(context);

      expect(getBitcoinTransactionFees).toHaveBeenCalledWith(
        expectedAccountRequest,
        [{ address: DUMMY_P2TR_RECIPIENT, amount: createMoney(0, 'BTC') }],
        true,
        context.signal
      );
      expect(calculateMaxSpend).toHaveBeenCalledWith({
        account: expectedAccountRequest,
        recipient: DUMMY_P2TR_RECIPIENT,
        feeRate: standardStubFeeRate,
      });
      expect(amount.amount.toString()).toEqual(stubMaxSpendAmount);
    });

    test('uses the custom fee rate without fetching fee rates', async () => {
      const { context, getBitcoinTransactionFees, calculateMaxSpend, expectedAccountRequest } =
        createBtcContext(5);

      await getProtocolStrategy('nativeBtc').resolveSpendableAmount(context);

      expect(getBitcoinTransactionFees).not.toHaveBeenCalled();
      expect(calculateMaxSpend).toHaveBeenCalledWith({
        account: expectedAccountRequest,
        recipient: DUMMY_P2TR_RECIPIENT,
        feeRate: 5,
      });
    });
  });
});
