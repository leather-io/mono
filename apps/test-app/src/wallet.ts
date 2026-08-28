// Reads from the CONNECTED wallet through `getAddresses`, so builders can
// personalise a request — own addresses as recipients, own STX key as the
// transaction signer, own BTC key inside a multisig — without a fixture that
// matches only one seed.
//
// Pure: no React, no `window`. Wallet access comes through `RequestContext`,
// so Playwright specs can drive these helpers with `page.evaluate`.
import { hex } from '@scure/base';

import { BTC_RECIPIENT_OVERRIDE, BTC_RECIPIENT_REGTEST_OVERRIDE } from './constants';
import type { RequestContext } from './types';

export interface WalletAddress {
  symbol: string;
  address: string;
  type?: string;
  kind?: string;
  publicKey?: string;
  descriptor?: string;
}

function isWalletAddress(value: unknown): value is WalletAddress {
  return (
    typeof value === 'object' &&
    value !== null &&
    'symbol' in value &&
    typeof value.symbol === 'string' &&
    'address' in value &&
    typeof value.address === 'string'
  );
}

export interface FetchAddressesOptions {
  /** Wallet network id, e.g. `mainnet` (default) or `private` (regtest). */
  network?: string;
  allowPolicyAccounts?: boolean;
}

/** `getAddresses` → the address list (prompts the user once). */
export async function fetchAddresses(
  ctx: RequestContext,
  options?: FetchAddressesOptions
): Promise<WalletAddress[]> {
  const result = await ctx.request('getAddresses', options);
  if (!result || typeof result !== 'object') throw new Error('getAddresses returned no result');
  const { addresses }: { addresses?: unknown } = result;
  if (!Array.isArray(addresses)) throw new Error('getAddresses result has no `addresses` array');
  return addresses.filter(isWalletAddress);
}

export type BtcAddressType = 'p2wpkh' | 'p2tr' | 'p2wsh';

/** The BTC entry of `type`, or the first BTC entry when no type is given. */
export function pickBtcAddress(addresses: WalletAddress[], type?: BtcAddressType): string {
  const entry = addresses.find(a => a.symbol === 'BTC' && (type === undefined || a.type === type));
  if (!entry) throw new Error(`getAddresses returned no ${type ?? 'BTC'} address`);
  return entry.address;
}

export interface StxAccount {
  address: string;
  /** Compressed secp256k1 public key, hex. */
  publicKey: string;
}

/** The single-sig STX entry (address + public key). */
export function pickStxAccount(addresses: WalletAddress[]): StxAccount {
  const entry = addresses.find(a => a.symbol === 'STX' && typeof a.publicKey === 'string');
  if (!entry?.publicKey)
    throw new Error(
      'getAddresses returned no single-sig STX address with a publicKey — select a singlesig account in the wallet.'
    );
  return { address: entry.address, publicKey: entry.publicKey };
}

/** The connected wallet's own BTC address of `type` on `network`. */
export async function fetchBtcAddress(
  ctx: RequestContext,
  type?: BtcAddressType,
  options?: FetchAddressesOptions
): Promise<string> {
  return pickBtcAddress(await fetchAddresses(ctx, options), type);
}

/** The connected wallet's own STX account (address + public key). */
export async function fetchStxAccount(
  ctx: RequestContext,
  options?: FetchAddressesOptions
): Promise<StxAccount> {
  return pickStxAccount(await fetchAddresses(ctx, options));
}

/** The selected account's native-segwit (p2wpkh) public key, 33 bytes. */
export async function fetchNativeSegwitPubkey(ctx: RequestContext): Promise<Uint8Array> {
  const entry = (await fetchAddresses(ctx)).find(a => a.symbol === 'BTC' && a.type === 'p2wpkh');
  if (!entry?.publicKey)
    throw new Error('getAddresses returned no p2wpkh address with a publicKey');
  return hex.decode(entry.publicKey);
}

/**
 * The selected policy (multisig) account's descriptor, e.g.
 * `wsh(sortedmulti(2,02…,03…,02…))#checksum`. Requires a policy account to be
 * selected in the wallet and `allowPolicyAccounts: true`.
 */
export async function fetchPolicyDescriptor(ctx: RequestContext): Promise<string> {
  const entry = (await fetchAddresses(ctx, { allowPolicyAccounts: true })).find(
    a => a.symbol === 'BTC' && a.type === 'p2wsh'
  );
  if (!entry?.descriptor)
    throw new Error(
      'No policy (p2wsh) address returned — select a multisig account in the wallet first (register one with btc_addAccount).'
    );
  return entry.descriptor;
}

/**
 * Where a mainnet BTC transfer goes: `VITE_TEST_APP_BTC_RECIPIENT` if set
 * (no prompt), otherwise the wallet's own address of `type` (one prompt).
 */
export async function resolveBtcRecipient(
  ctx: RequestContext,
  type: BtcAddressType = 'p2wpkh'
): Promise<string> {
  return BTC_RECIPIENT_OVERRIDE ?? fetchBtcAddress(ctx, type);
}

/**
 * Where a private-network (regtest) BTC transfer goes:
 * `VITE_TEST_APP_BTC_RECIPIENT_REGTEST` if set, otherwise the wallet's own
 * regtest address — the selected account's, policy accounts included.
 */
export async function resolveRegtestBtcRecipient(ctx: RequestContext): Promise<string> {
  return (
    BTC_RECIPIENT_REGTEST_OVERRIDE ??
    fetchBtcAddress(ctx, undefined, { network: 'private', allowPolicyAccounts: true })
  );
}
