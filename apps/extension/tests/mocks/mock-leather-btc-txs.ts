import type { BrowserContext, Page } from '@playwright/test';

import type { BitcoinTx } from '@leather.io/models';

import { TEST_ACCOUNT_1_NATIVE_SEGWIT_ADDRESS, TEST_ACCOUNT_1_TAPROOT_ADDRESS } from './constants';

// Pipeline B reads Bitcoin history from the Leather API, not esplora. Ownership
// arrives as `owned` flags on each vin/vout rather than being derived by
// matching addresses, so these fixtures state it directly.
interface LeatherApiBitcoinTxIo {
  n: number;
  txid?: string;
  owned?: boolean;
  address?: string;
  path?: string;
  value: string;
}

interface LeatherApiBitcoinTx {
  txid: string;
  height?: number;
  time?: number;
  vin: LeatherApiBitcoinTxIo[];
  vout: LeatherApiBitcoinTxIo[];
}

const confirmedHeight = 810600;
const confirmedTime = 1696400000;

// 200,000 sats spent from taproot, 198,000 to an external recipient.
// Sent (non-owned outputs) = 198,000 sats = 0.00198 BTC
export const mockLeatherTaprootOnlySendTx: LeatherApiBitcoinTx = {
  txid: 'a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1b2',
  height: confirmedHeight,
  time: confirmedTime,
  vin: [{ n: 0, owned: true, address: TEST_ACCOUNT_1_TAPROOT_ADDRESS, value: '200000' }],
  vout: [
    { n: 0, owned: false, address: 'bc1qw508d6qejxtdg4y5r3zarvary0c5xw7kv8f3t4', value: '198000' },
  ],
};

// 150,000 sats received at the taproot address.
export const mockLeatherTaprootOnlyReceiveTx: LeatherApiBitcoinTx = {
  txid: 'b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1b2c3',
  height: confirmedHeight,
  time: confirmedTime - 100,
  vin: [
    { n: 0, owned: false, address: 'bc1qw508d6qejxtdg4y5r3zarvary0c5xw7kv8f3t4', value: '151000' },
  ],
  vout: [{ n: 0, owned: true, address: TEST_ACCOUNT_1_TAPROOT_ADDRESS, value: '150000' }],
};

// Spends from both taproot and native segwit; 300,000 sats leave the wallet,
// 100,000 returns as change. Sent (non-owned outputs) = 300,000 = 0.003 BTC
export const mockLeatherMixedInputSendTx: LeatherApiBitcoinTx = {
  txid: 'c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1b2c3d4',
  height: confirmedHeight,
  time: confirmedTime - 200,
  vin: [
    { n: 0, owned: true, address: TEST_ACCOUNT_1_TAPROOT_ADDRESS, value: '250000' },
    { n: 1, owned: true, address: TEST_ACCOUNT_1_NATIVE_SEGWIT_ADDRESS, value: '152000' },
  ],
  vout: [
    { n: 0, owned: false, address: 'bc1qw508d6qejxtdg4y5r3zarvary0c5xw7kv8f3t4', value: '300000' },
    { n: 1, owned: true, address: TEST_ACCOUNT_1_NATIVE_SEGWIT_ADDRESS, value: '100000' },
  ],
};

// Descriptors embed `wpkh(xpub...)`, whose parentheses a URL glob mishandles,
// so this matcher is a regex.
const leatherDescriptorTxsUrl = /\/v1\/transactions\/bitcoin\/descriptors\//;

export async function mockLeatherBitcoinTransactions(
  target: Page | BrowserContext,
  txs: LeatherApiBitcoinTx[]
) {
  await target.route(leatherDescriptorTxsUrl, route => route.fulfill({ json: { data: txs } }));
}

const ownedTestAddressPaths: Record<string, string> = {
  [TEST_ACCOUNT_1_NATIVE_SEGWIT_ADDRESS]: "m/84'/0'/0'/0/0",
  [TEST_ACCOUNT_1_TAPROOT_ADDRESS]: "m/86'/0'/0'/0/0",
};

// RBF needs the same pending tx from two sources: the Leather API feeds the
// activity row, esplora feeds the replacement payload (vin.sequence, prevout
// scripts, fee). Deriving one from the other keeps them from drifting apart.
function isOwnedTestAddress(address?: string) {
  return address !== undefined && address in ownedTestAddressPaths;
}

function ownedTestAddressPath(address?: string) {
  if (address === undefined) return {};
  const path = ownedTestAddressPaths[address];
  return path === undefined ? {} : { path };
}

export function leatherTxFromEsplora(tx: BitcoinTx): LeatherApiBitcoinTx {
  return {
    txid: tx.txid,
    ...(tx.status.confirmed
      ? { height: tx.status.block_height ?? undefined, time: tx.status.block_time ?? undefined }
      : {}),
    vin: tx.vin.map(input => ({
      n: input.vout,
      txid: input.txid,
      owned: isOwnedTestAddress(input.prevout?.scriptpubkey_address),
      address: input.prevout?.scriptpubkey_address,
      ...ownedTestAddressPath(input.prevout?.scriptpubkey_address),
      value: String(input.prevout?.value ?? 0),
    })),
    vout: tx.vout.map((output, n) => ({
      n,
      owned: isOwnedTestAddress(output.scriptpubkey_address),
      address: output.scriptpubkey_address,
      ...ownedTestAddressPath(output.scriptpubkey_address),
      value: String(output.value),
    })),
  };
}
