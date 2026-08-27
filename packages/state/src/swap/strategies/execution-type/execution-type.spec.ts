import { hexToBytes } from '@stacks/common';
import { STACKS_MAINNET } from '@stacks/network';
import { describe, expect, test, vi } from 'vitest';

import { SwapExecutionData, TransactionFeeQuote } from '@leather.io/models';
import { BitcoinCoinSelectionService, SwapService } from '@leather.io/services';
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
const signersPublicKey = '79be667ef9dcbbac55a06295ce870b07029bfcdb2dce28d959f2815b16f81798';
const signedDepositTxid = 'f'.repeat(64);
const signedDepositTxHex = 'signed-deposit-hex';

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

function createSwapServiceMocks() {
  return {
    notifySbtcDeposit: vi.fn().mockResolvedValue({ status: 'notified' }),
    getSbtcSignersPublicKey: vi.fn().mockResolvedValue(signersPublicKey),
  };
}

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
      signBitcoinPsbt: vi.fn(),
      broadcast: vi.fn().mockResolvedValue({ status: 'accepted' }),
    },
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
      expect(result).toEqual({ status: 'submitted', txid: 'stacks-txid' });
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
  function createSbtcFixtures() {
    const depositTransaction = {
      addInput: vi.fn(),
      addOutputAddress: vi.fn(),
      toPSBT: vi.fn(() => new Uint8Array()),
    };
    vi.mocked(buildSbtcBridgeDepositTx).mockReturnValue({
      address: 'bc1qdeposit',
      depositScript: 'deposit-script',
      reclaimScript: 'reclaim-script',
      transaction: depositTransaction,
    } as unknown as ReturnType<typeof buildSbtcBridgeDepositTx>);

    const signedDepositTx = { finalize: vi.fn(), id: signedDepositTxid, hex: signedDepositTxHex };
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

    const swapServiceMocks = createSwapServiceMocks();
    const dependencies = createExecutionDependencies({
      executionData: sbtcBridgeDepositExecutionData,
    });
    assertExistence(dependencies.bitcoin, 'Expected bitcoin dependencies in fixture');
    const bitcoin = dependencies.bitcoin;
    bitcoin.signBitcoinPsbt = vi.fn().mockResolvedValue(signedDepositTx);
    dependencies.services.bitcoinCoinSelectionService = {
      performCoinSelection,
    } as unknown as BitcoinCoinSelectionService;
    dependencies.services.swapService = {
      ...createStubSwapService(),
      ...swapServiceMocks,
    } as unknown as SwapService;

    return {
      dependencies,
      bitcoin,
      depositTransaction,
      signedDepositTx,
      performCoinSelection,
      swapServiceMocks,
    };
  }

  describe('getNetworkFee', () => {
    test('builds the deposit with the signers public key from the sbtc deposit service', async () => {
      const { dependencies, swapServiceMocks } = createSbtcFixtures();

      await getExecutionTypeStrategy('sbtc-bridge-deposit').getNetworkFee(dependencies);

      expect(swapServiceMocks.getSbtcSignersPublicKey).toHaveBeenCalledOnce();
      expect(buildSbtcBridgeDepositTx).toHaveBeenLastCalledWith(
        10_000,
        dependencies.bitcoin?.network,
        dependencies.accountRequest.account,
        dependencies.bitcoin?.bitcoinPayer,
        signersPublicKey
      );
    });
  });

  describe('submitSwap', () => {
    test('builds, signs and broadcasts the deposit, then notifies sbtc with the signed tx', async () => {
      const {
        dependencies,
        bitcoin,
        depositTransaction,
        signedDepositTx,
        performCoinSelection,
        swapServiceMocks,
      } = createSbtcFixtures();

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
      expect(bitcoin.broadcast).toHaveBeenCalledWith(signedDepositTxHex);
      expect(swapServiceMocks.notifySbtcDeposit).toHaveBeenCalledWith({
        bitcoinTxid: signedDepositTxid,
        bitcoinTxOutputIndex: 0,
        depositScript: 'deposit-script',
        reclaimScript: 'reclaim-script',
        transactionHex: signedDepositTxHex,
      });
      expect(result).toEqual({ status: 'submitted', txid: signedDepositTxid });
    });

    test('rejects without broadcasting when the fee calculation is not a bitcoin fee rate', async () => {
      const { dependencies, bitcoin, swapServiceMocks } = createSbtcFixtures();

      await expect(
        getExecutionTypeStrategy('sbtc-bridge-deposit').submitSwap(dependencies, stacksNetworkFee)
      ).rejects.toThrowError(
        'sbtc-bridge-deposit submission requires a bitcoinFeeRate fee calculation'
      );
      expect(bitcoin.broadcast).not.toHaveBeenCalled();
      expect(swapServiceMocks.notifySbtcDeposit).not.toHaveBeenCalled();
    });

    test('rejects without notifying sbtc when the node rejects the broadcast', async () => {
      const { dependencies, bitcoin, swapServiceMocks } = createSbtcFixtures();
      bitcoin.broadcast = vi.fn().mockResolvedValue({
        status: 'rejected',
        errorMessage: 'bad-txns-inputs-missingorspent',
      });

      await expect(
        getExecutionTypeStrategy('sbtc-bridge-deposit').submitSwap(dependencies, bitcoinNetworkFee)
      ).rejects.toThrowError('bad-txns-inputs-missingorspent');
      expect(swapServiceMocks.notifySbtcDeposit).not.toHaveBeenCalled();
    });

    test('still notifies sbtc and resolves broadcast-uncertain when the broadcast outcome is unknown', async () => {
      const { dependencies, bitcoin, swapServiceMocks } = createSbtcFixtures();
      bitcoin.broadcast = vi.fn().mockResolvedValue({
        status: 'unknown',
        errorMessage: 'Failed to fetch',
      });

      const result = await getExecutionTypeStrategy('sbtc-bridge-deposit').submitSwap(
        dependencies,
        bitcoinNetworkFee
      );

      expect(swapServiceMocks.notifySbtcDeposit).toHaveBeenCalledWith(
        expect.objectContaining({ bitcoinTxid: signedDepositTxid })
      );
      expect(result).toEqual({
        status: 'broadcast-uncertain',
        txid: signedDepositTxid,
        errorMessage: 'Failed to fetch',
        notified: true,
      });
    });

    test('reports broadcast-uncertain over a failed notification when both are unknown', async () => {
      const { dependencies, bitcoin, swapServiceMocks } = createSbtcFixtures();
      bitcoin.broadcast = vi
        .fn()
        .mockResolvedValue({ status: 'unknown', errorMessage: 'Bad Gateway' });
      swapServiceMocks.notifySbtcDeposit.mockResolvedValue({
        status: 'failed',
        errorMessage: 'Service unavailable',
        httpStatus: 503,
      });

      const result = await getExecutionTypeStrategy('sbtc-bridge-deposit').submitSwap(
        dependencies,
        bitcoinNetworkFee
      );

      expect(result).toEqual({
        status: 'broadcast-uncertain',
        txid: signedDepositTxid,
        errorMessage: 'Bad Gateway',
        notified: false,
      });
    });

    test('resolves with a notification failure instead of rejecting when sbtc cannot be notified', async () => {
      const { dependencies, swapServiceMocks } = createSbtcFixtures();
      swapServiceMocks.notifySbtcDeposit.mockResolvedValue({
        status: 'failed',
        errorMessage: 'Service unavailable',
        httpStatus: 503,
      });

      const result = await getExecutionTypeStrategy('sbtc-bridge-deposit').submitSwap(
        dependencies,
        bitcoinNetworkFee
      );

      expect(result).toEqual({
        status: 'sbtc-notification-failed',
        txid: signedDepositTxid,
        errorMessage: 'Service unavailable',
        httpStatus: 503,
      });
    });

    test('omits the http status from the notification failure when none is available', async () => {
      const { dependencies, swapServiceMocks } = createSbtcFixtures();
      swapServiceMocks.notifySbtcDeposit.mockResolvedValue({
        status: 'failed',
        errorMessage: 'timeout of 10000ms exceeded',
      });

      const result = await getExecutionTypeStrategy('sbtc-bridge-deposit').submitSwap(
        dependencies,
        bitcoinNetworkFee
      );

      expect(result).toEqual({
        status: 'sbtc-notification-failed',
        txid: signedDepositTxid,
        errorMessage: 'timeout of 10000ms exceeded',
      });
    });
  });
});
