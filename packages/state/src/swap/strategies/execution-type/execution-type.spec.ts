import { hexToBytes } from '@stacks/common';
import { STACKS_MAINNET } from '@stacks/network';
import { describe, expect, test, vi } from 'vitest';

import { SwapExecutionData, TransactionFeeQuote } from '@leather.io/models';
import { BitcoinCoinSelectionService } from '@leather.io/services';
import { assertExistence, createMoney } from '@leather.io/utils';

import { NetworkFee, SwapExecutionDependencies } from '../../swap-state.types';
import { createAccountRequest } from '../../tests/test-utils/fixtures';
import {
  createStubBitcoinCoinSelectionService,
  createStubBitcoinPayer,
  createStubBitcoinTransactionFeesService,
  createStubMarketDataService,
  createStubNetwork,
  createStubStacksSigner,
  createStubStacksTransactionFeesService,
  createStubSwapService,
} from '../../tests/test-utils/services.stub';
import { buildSbtcBridgeDepositTx } from './build-transaction/build-transaction/build-sbtc-bridge-deposit-tx';
import { getExecutionTypeStrategy } from './execution-type';

vi.mock('./build-transaction/build-transaction/build-sbtc-bridge-deposit-tx', () => ({
  buildSbtcBridgeDepositTx: vi.fn(),
}));

const secp256k1GeneratorPublicKey =
  '0279be667ef9dcbbac55a06295ce870b07029bfcdb2dce28d959f2815b16f81798';

const stacksFeeQuote: TransactionFeeQuote = {
  type: 'stacksFeeRate',
  value: createMoney(2000, 'STX'),
  rate: 2,
  rateUnit: 'µSTX/byte',
  estimatedTxSize: 1000,
  sizeUnit: 'byte',
};

const bitcoinFeeQuote: TransactionFeeQuote = {
  type: 'bitcoinFeeRate',
  value: createMoney(2000, 'BTC'),
  rate: 20,
  rateUnit: 'sats/vB',
  estimatedTxSize: 100,
  sizeUnit: 'vB',
};

const stacksNetworkFee: NetworkFee = { mode: 'fixed', calculation: stacksFeeQuote };
const bitcoinNetworkFee: NetworkFee = { mode: 'fixed', calculation: bitcoinFeeQuote };

const stacksContractCallExecutionData = {
  executionType: 'stacks-contract-call',
  providerId: 'alex-sdk',
  contractAddress: 'SP000000000000000000002Q6VF78',
  contractName: 'test-swap',
  functionName: 'swap',
  functionArgs: [],
  postConditions: [],
} as unknown as SwapExecutionData;

const sbtcBridgeDepositExecutionData = {
  executionType: 'sbtc-bridge-deposit',
  providerId: 'sbtc-bridge',
} as unknown as SwapExecutionData;

function createExecutionDependencies(
  overrides: Partial<SwapExecutionDependencies> = {}
): SwapExecutionDependencies {
  return {
    accountRequest: createAccountRequest(),
    stacks: {
      stacksSigner: createStubStacksSigner(),
      stacksNetwork: STACKS_MAINNET,
      broadcast: vi.fn().mockResolvedValue({ txid: 'stacks-txid' }),
      nextNonce: undefined,
    },
    bitcoin: {
      bitcoinPayer: {
        ...createStubBitcoinPayer(),
        publicKey: hexToBytes(secp256k1GeneratorPublicKey),
        masterKeyFingerprint: 'deadbeef',
        keyOrigin: "deadbeef/84'/0'/0'",
      },
      network: createStubNetwork(),
      sbtcClient: {
        broadcastTx: vi.fn().mockResolvedValue('btc-txid'),
        notifySbtc: vi.fn().mockResolvedValue(undefined),
      },
      signBitcoinPsbt: vi.fn(),
    } as unknown as SwapExecutionDependencies['bitcoin'],
    services: {
      swapService: createStubSwapService(),
      marketDataService: createStubMarketDataService(),
      bitcoinTransactionFeesService: createStubBitcoinTransactionFeesService(),
      bitcoinCoinSelectionService: createStubBitcoinCoinSelectionService(),
      stacksTransactionFeesService: createStubStacksTransactionFeesService(),
    },
    derivedAmounts: { crypto: createMoney(10_000, 'BTC'), quote: null },
    isSendingMax: false,
    executionData: stacksContractCallExecutionData,
    nonce: 1,
    ...overrides,
  };
}

describe('stacksContractCallStrategy', () => {
  describe('submitSwap', () => {
    test('signs the built transaction, broadcasts it and resolves with the txid', async () => {
      const sign = vi.fn(tx => Promise.resolve(tx));
      const broadcast = vi.fn().mockResolvedValue({ txid: 'stacks-txid' });
      const dependencies = createExecutionDependencies();
      dependencies.stacks.stacksSigner = { ...createStubStacksSigner(), sign };
      dependencies.stacks.broadcast = broadcast;

      const result = await getExecutionTypeStrategy('stacks-contract-call').submitSwap(
        dependencies,
        stacksNetworkFee
      );

      expect(sign).toHaveBeenCalledOnce();
      expect(broadcast).toHaveBeenCalledWith({
        tx: sign.mock.calls[0][0],
        stacksNetwork: STACKS_MAINNET,
      });
      expect(result).toEqual({ txid: 'stacks-txid' });
    });

    test('rejects when broadcast fails', async () => {
      const dependencies = createExecutionDependencies();
      dependencies.stacks.broadcast = vi.fn().mockRejectedValue(new Error('broadcast failed'));

      await expect(
        getExecutionTypeStrategy('stacks-contract-call').submitSwap(dependencies, stacksNetworkFee)
      ).rejects.toThrowError('broadcast failed');
    });
  });
});

describe('sbtcBridgeDepositStrategy', () => {
  describe('submitSwap', () => {
    function createSbtcSubmissionFixtures() {
      const depositTransaction = {
        addInput: vi.fn(),
        addOutputAddress: vi.fn(),
        toPSBT: vi.fn(() => new Uint8Array()),
      };
      vi.mocked(buildSbtcBridgeDepositTx).mockResolvedValue({
        address: 'bc1qdeposit',
        transaction: depositTransaction,
      } as unknown as Awaited<ReturnType<typeof buildSbtcBridgeDepositTx>>);

      const signedDepositTx = { finalize: vi.fn() };
      const performCoinSelection = vi.fn().mockResolvedValue({
        inputs: [
          {
            txid: '0000000000000000000000000000000000000000000000000000000000000000',
            vout: 0,
            value: 10_000,
          },
        ],
        outputs: [{ value: BigInt(5000), address: 'bc1qdeposit' }, { value: BigInt(4000) }],
      });

      const dependencies = createExecutionDependencies({
        executionData: sbtcBridgeDepositExecutionData,
      });
      assertExistence(dependencies.bitcoin, 'Expected bitcoin dependencies in fixture');
      const bitcoin = dependencies.bitcoin;
      bitcoin.signBitcoinPsbt = vi.fn().mockResolvedValue(signedDepositTx);
      dependencies.services.bitcoinCoinSelectionService = {
        performCoinSelection,
      } as unknown as BitcoinCoinSelectionService;

      return { dependencies, bitcoin, depositTransaction, signedDepositTx, performCoinSelection };
    }

    test('builds, signs and broadcasts the deposit, then notifies sbtc with the signed tx', async () => {
      const { dependencies, bitcoin, depositTransaction, signedDepositTx, performCoinSelection } =
        createSbtcSubmissionFixtures();

      const result = await getExecutionTypeStrategy('sbtc-bridge-deposit').submitSwap(
        dependencies,
        bitcoinNetworkFee
      );

      expect(performCoinSelection).toHaveBeenCalledWith(
        expect.objectContaining({ feeRate: bitcoinFeeQuote.rate })
      );
      expect(depositTransaction.addInput).toHaveBeenCalledOnce();
      expect(depositTransaction.addOutputAddress).toHaveBeenCalledOnce();
      expect(signedDepositTx.finalize).toHaveBeenCalledOnce();
      expect(bitcoin.sbtcClient.broadcastTx).toHaveBeenCalledWith(signedDepositTx);
      expect(bitcoin.sbtcClient.notifySbtc).toHaveBeenCalledWith(
        expect.objectContaining({ transaction: signedDepositTx })
      );
      expect(result).toEqual({ txid: 'btc-txid' });
    });

    test('rejects without broadcasting when the fee calculation is not a bitcoin fee rate', async () => {
      const { dependencies, bitcoin } = createSbtcSubmissionFixtures();

      await expect(
        getExecutionTypeStrategy('sbtc-bridge-deposit').submitSwap(dependencies, stacksNetworkFee)
      ).rejects.toThrowError(
        'sbtc-bridge-deposit submission requires a bitcoinFeeRate fee calculation'
      );
      expect(bitcoin.sbtcClient.broadcastTx).not.toHaveBeenCalled();
    });
  });
});
