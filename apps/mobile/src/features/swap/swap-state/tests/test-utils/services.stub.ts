/* eslint-disable lingui/no-unlocalized-strings */
import {
  defaultBaseSwapAssets,
  defaultSwapQuotes,
  getDefaultTargetSwapAssets,
} from '@/features/swap/swap-state/tests/test-utils/fixtures';

import { BitcoinNativeSegwitPayer } from '@leather.io/bitcoin';
import {
  CryptoAssetId,
  MarketData,
  NetworkConfiguration,
  SwapQuote,
  TransactionFees,
} from '@leather.io/models';
import {
  AccountSwapAsset,
  BitcoinCoinSelectionService,
  BitcoinTransactionFeesService,
  MarketDataService,
  StacksTransactionFeesService,
  SwapService,
} from '@leather.io/services';
import { StacksSigner } from '@leather.io/stacks';
import { createMoney } from '@leather.io/utils';

export interface StubSwapServiceConfig {
  baseSwapAssets?: AccountSwapAsset[];
  targetSwapAssets?: AccountSwapAsset[];
  swapQuotes?: SwapQuote[];
}

export function createStubSwapService({
  baseSwapAssets,
  targetSwapAssets,
  swapQuotes,
}: StubSwapServiceConfig = {}) {
  return {
    async getAccountBaseSwapAssets(): Promise<AccountSwapAsset[]> {
      return Promise.resolve(baseSwapAssets ?? defaultBaseSwapAssets);
    },

    async getAccountTargetSwapAssets(baseId: CryptoAssetId): Promise<AccountSwapAsset[]> {
      return Promise.resolve(targetSwapAssets ?? getDefaultTargetSwapAssets(baseId));
    },

    async getSwapQuotes(): Promise<SwapQuote[]> {
      return Promise.resolve(swapQuotes ?? defaultSwapQuotes);
    },

    async getSwapExecutionData() {
      return Promise.resolve({
        executionType: 'stacks-contract-call',
        providerId: 'alex-sdk',
        contractAddress: 'SP000000000000000000002Q6VF78',
        contractName: 'test-swap',
        functionName: 'swap',
        functionArgs: [],
        postConditions: [],
      });
    },
  } as unknown as SwapService;
}

export interface StubMarketDataServiceConfig {
  marketData?: MarketData;
}

export function createStubMarketDataService({ marketData }: StubMarketDataServiceConfig = {}) {
  return {
    async getMarketData(): Promise<MarketData> {
      if (marketData) {
        return Promise.resolve(marketData);
      }
      throw new Error('Market data not configured in stub');
    },
  } as unknown as MarketDataService;
}

export function createStubStacksSigner(): StacksSigner {
  return {
    descriptor: 'test-descriptor',
    keyOrigin: 'test-origin',
    derivationPath: "m/44'/5757'/0'/0/0",
    address: 'SP2ADDRESS',
    publicKey: new Uint8Array(33),
    accountIndex: 0,
    network: 'mainnet',
    sign: tx => Promise.resolve(tx),
    signMessage: () => Promise.resolve({ signature: 'test', publicKey: 'test' }),
    signStructuredMessage: () => Promise.resolve({ signature: 'test', publicKey: 'test' }),
  };
}

export function createStubBitcoinPayer(): BitcoinNativeSegwitPayer {
  return {
    address: 'bc1qtest' as any,
    publicKey: new Uint8Array(33),
    payment: {} as any,
    paymentType: 'p2wpkh',
    network: 'mainnet',
    keyOrigin: 'test-origin',
    masterKeyFingerprint: 'test-fingerprint',
  };
}

export function createStubNetwork(): NetworkConfiguration {
  return {
    id: 'mainnet',
    name: 'Mainnet',
    chain: {
      bitcoin: {
        blockchain: 'bitcoin',
        bitcoinNetwork: 'mainnet',
        bitcoinUrl: 'https://bitcoin.org',
        mode: 'mainnet',
      },
      stacks: {
        blockchain: 'stacks',
        url: 'https://stacks.co',
        chainId: 1,
      },
    },
  };
}

export interface StubStacksTransactionFeesServiceConfig {
  transactionFees?: TransactionFees;
}

export function createStubStacksTransactionFeesService({
  transactionFees,
}: StubStacksTransactionFeesServiceConfig = {}) {
  const defaultFees: TransactionFees = {
    chain: 'stacks',
    options: {
      low: {
        type: 'stacksFeeRate',
        value: createMoney(1000, 'STX'),
        rate: 1,
        rateUnit: 'µSTX/byte',
        estimatedTxSize: 1000,
        sizeUnit: 'byte',
      },
      standard: {
        type: 'stacksFeeRate',
        value: createMoney(2000, 'STX'),
        rate: 2,
        rateUnit: 'µSTX/byte',
        estimatedTxSize: 1000,
        sizeUnit: 'byte',
      },
      high: {
        type: 'stacksFeeRate',
        value: createMoney(3000, 'STX'),
        rate: 3,
        rateUnit: 'µSTX/byte',
        estimatedTxSize: 1000,
        sizeUnit: 'byte',
      },
    },
  };

  return {
    async getStacksTransactionFees(): Promise<TransactionFees> {
      return Promise.resolve(transactionFees ?? defaultFees);
    },
  } as unknown as StacksTransactionFeesService;
}

export interface StubBitcoinTransactionFeesServiceConfig {
  transactionFees?: TransactionFees;
}

export function createStubBitcoinTransactionFeesService({
  transactionFees,
}: StubBitcoinTransactionFeesServiceConfig = {}) {
  const defaultFees: TransactionFees = {
    chain: 'bitcoin',
    options: {
      low: {
        type: 'bitcoinFeeRate',
        value: createMoney(1000, 'BTC'),
        rate: 10,
        rateUnit: 'sats/vB',
        estimatedTxSize: 100,
        sizeUnit: 'vB',
      },
      standard: {
        type: 'bitcoinFeeRate',
        value: createMoney(2000, 'BTC'),
        rate: 20,
        rateUnit: 'sats/vB',
        estimatedTxSize: 100,
        sizeUnit: 'vB',
      },
      high: {
        type: 'bitcoinFeeRate',
        value: createMoney(3000, 'BTC'),
        rate: 30,
        rateUnit: 'sats/vB',
        estimatedTxSize: 100,
        sizeUnit: 'vB',
      },
    },
  };

  return {
    async getBitcoinTransactionFees(): Promise<TransactionFees> {
      return Promise.resolve(transactionFees ?? defaultFees);
    },
  } as unknown as BitcoinTransactionFeesService;
}

interface StubBitcoinCoinSelectionServiceConfig {
  maxSpendAmount?: number;
}

export function createStubBitcoinCoinSelectionService({
  maxSpendAmount = 200_000_000,
}: StubBitcoinCoinSelectionServiceConfig = {}) {
  return {
    performCoinSelection() {
      return Promise.resolve({
        inputs: [
          {
            txid: '0000000000000000000000000000000000000000000000000000000000000000',
            vout: 0,
            value: 10000,
            address: 'bc1qtest',
            path: "m/84'/0'/0'/0/0",
            keyOrigin: 'test',
          },
        ],
        outputs: [{ value: BigInt(5000), address: 'bc1qrecipient' }, { value: BigInt(4000) }],
        estimatedTxSize: 100,
        fee: createMoney(1000, 'BTC'),
      });
    },
    calculateMaxSpend() {
      return Promise.resolve({
        amount: createMoney(maxSpendAmount, 'BTC'),
        fee: createMoney(1000, 'BTC'),
        estimatedTxSize: 100,
      });
    },
  } as unknown as BitcoinCoinSelectionService;
}
