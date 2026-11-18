import BigNumber from 'bignumber.js';

import { type BitcoinNativeSegwitPayer, createBitcoinAddress } from '@leather.io/bitcoin';
import {
  type BitcoinTransactionFees,
  type MarketData,
  type NetworkConfiguration,
  type StacksTransactionFees,
  type SwapQuote,
} from '@leather.io/models';
import { type AccountSwapAsset } from '@leather.io/services';
import { type StacksSigner } from '@leather.io/stacks';
import { createMoney } from '@leather.io/utils';

import {
  type BitcoinCoinSelectionServiceClient,
  type BitcoinTransactionFeesServiceClient,
  type MarketDataServiceClient,
  type StacksTransactionFeesServiceClient,
  type SwapServiceClient,
} from '../../swap-state.types';
import {
  createSwapQuote,
  defaultBaseSwapAssets,
  defaultSwapQuotes,
  defaultTargetSwapAssets,
} from './fixtures';

const stubPayerAddress = 'bc1qw508d6qejxtdg4y5r3zarvary0c5xw7kv8f3t4';
const stubSignersPublicKey = '79be667ef9dcbbac55a06295ce870b07029bfcdb2dce28d959f2815b16f81798';

interface StubSwapServiceConfig {
  baseSwapAssets?: AccountSwapAsset[];
  targetSwapAssets?: AccountSwapAsset[];
  swapQuotes?: SwapQuote[];
  getSwapQuotes?(): Promise<SwapQuote[]>;
  getBaseSwapAssets?(): Promise<AccountSwapAsset[]>;
  getTargetSwapAssets?(): Promise<AccountSwapAsset[]>;
}

export function createStubSwapService({
  baseSwapAssets,
  targetSwapAssets,
  swapQuotes,
  getSwapQuotes,
  getBaseSwapAssets,
  getTargetSwapAssets,
}: StubSwapServiceConfig = {}): SwapServiceClient {
  return {
    async getAccountBaseSwapAssets(): Promise<AccountSwapAsset[]> {
      if (getBaseSwapAssets) return getBaseSwapAssets();
      return Promise.resolve(baseSwapAssets ?? defaultBaseSwapAssets);
    },

    async getAccountTargetSwapAssets(): Promise<AccountSwapAsset[]> {
      if (getTargetSwapAssets) return getTargetSwapAssets();
      return Promise.resolve(targetSwapAssets ?? defaultTargetSwapAssets);
    },

    async getSwapQuotes(): Promise<SwapQuote[]> {
      if (getSwapQuotes) return getSwapQuotes();
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
        quote: createSwapQuote(),
      });
    },

    async getSbtcSignersPublicKey() {
      return Promise.resolve(stubSignersPublicKey);
    },

    async notifySbtcDeposit() {
      return Promise.resolve({ status: 'notified' });
    },
  };
}

interface StubMarketDataServiceConfig {
  marketData?: MarketData;
}

export function createStubMarketDataService({
  marketData,
}: StubMarketDataServiceConfig = {}): MarketDataServiceClient {
  return {
    async getMarketData(): Promise<MarketData> {
      if (marketData) {
        return Promise.resolve(marketData);
      }
      throw new Error('Market data not configured in stub');
    },
  };
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
    address: createBitcoinAddress(stubPayerAddress),
    publicKey: new Uint8Array(33),
    payment: { type: 'wpkh', script: new Uint8Array() },
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

interface StubStacksTransactionFeesServiceConfig {
  transactionFees?: StacksTransactionFees;
}

export function createStubStacksTransactionFeesService({
  transactionFees,
}: StubStacksTransactionFeesServiceConfig = {}): StacksTransactionFeesServiceClient {
  const defaultFees: StacksTransactionFees = {
    chain: 'stacks',
    minimumFee: createMoney(1000, 'STX'),
    highFeeThreshold: createMoney(3000, 'STX'),
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
    async getStacksTransactionFees(): Promise<StacksTransactionFees> {
      return Promise.resolve(transactionFees ?? defaultFees);
    },
  };
}

interface StubBitcoinTransactionFeesServiceConfig {
  transactionFees?: BitcoinTransactionFees;
}

export function createStubBitcoinTransactionFeesService({
  transactionFees,
}: StubBitcoinTransactionFeesServiceConfig = {}): BitcoinTransactionFeesServiceClient {
  const defaultFees: BitcoinTransactionFees = {
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
    async getBitcoinTransactionFees(): Promise<BitcoinTransactionFees> {
      return Promise.resolve(transactionFees ?? defaultFees);
    },
  };
}

interface StubBitcoinCoinSelectionServiceConfig {
  maxSpendAmount?: number;
}

export function createStubBitcoinCoinSelectionService({
  maxSpendAmount = 200_000_000,
}: StubBitcoinCoinSelectionServiceConfig = {}): BitcoinCoinSelectionServiceClient {
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
        spendAllFee: 1000,
        spendableBitcoin: BigNumber(maxSpendAmount),
      });
    },
  };
}
