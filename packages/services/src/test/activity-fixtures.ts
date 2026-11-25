import type {
  BitcoinTransaction,
  BlockchainActivity,
  BlockchainActivityBalanceChange,
  GeneralActivity,
  Sip10Asset,
} from '@leather.io/models';
import { createMoney } from '@leather.io/utils';

export function createActivitySip10Asset(overrides: Partial<Sip10Asset> = {}): Sip10Asset {
  return {
    category: 'fungible',
    protocol: 'sip10',
    chain: 'stacks',
    name: 'Token',
    symbol: 'TOK',
    decimals: 6,
    hasMemo: false,
    canTransfer: true,
    assetId: 'SP.token::tok',
    contractId: 'SP.token',
    imageCanonicalUri: '',
    ...overrides,
  };
}

export function createActivityGeneral(overrides: Partial<GeneralActivity> = {}): GeneralActivity {
  return {
    level: 'app',
    type: 'walletAdded',
    timestamp: 0,
    title: '',
    message: '',
    ...overrides,
  };
}

export function createActivityBalanceChange(
  overrides: Partial<BlockchainActivityBalanceChange> = {}
): BlockchainActivityBalanceChange {
  return {
    direction: 'received',
    asset: createActivitySip10Asset(),
    amount: { crypto: createMoney(0, 'STX'), quote: createMoney(0, 'USD') },
    ...overrides,
  };
}

export function createActivityBlockchain(
  overrides: Partial<BlockchainActivity> = {}
): BlockchainActivity {
  return {
    timestamp: 0,
    txid: '',
    status: 'success',
    chain: 'stacks',
    initiatedByUser: false,
    action: 'send',
    balanceChanges: [],
    ...overrides,
  };
}

export function createActivityBitcoinTx(
  overrides: Partial<BitcoinTransaction> = {}
): BitcoinTransaction {
  return {
    txid: '',
    vin: [],
    vout: [],
    ...overrides,
  };
}
