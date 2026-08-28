// Reads from the CONNECTED wallet through `getAddresses`, so builders can
// personalise a request — own addresses as recipients, own STX key as the
// transaction signer, own xpub inside a multisig vault — without a fixture
// that matches only one seed.
//
// Pure: no React, no `window`. Wallet access comes through `RequestContext`,
// so Playwright specs can drive these helpers with `page.evaluate`.
import { hex } from '@scure/base';

import { BTC_RECIPIENT_OVERRIDE, BTC_RECIPIENT_REGTEST_OVERRIDE } from './constants';
import { networkModeOf } from './networks';
import { type NetworkMode, type RequestContext, networkOf } from './types';

export interface WalletAddress {
  symbol: string;
  address: string;
  type?: string;
  kind?: string;
  publicKey?: string;
  tweakedPublicKey?: string;
  descriptor?: string;
  derivationPath?: string;
  fingerprint?: string;
  threshold?: number;
  publicKeys?: string[];
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

export type GetAddressesChain = 'bitcoin' | 'stacks';

export interface FetchAddressesOptions {
  /** Overrides the context's network for this call only. */
  network?: string;
  allowPolicyAccounts?: boolean;
  chains?: GetAddressesChain[];
}

/** `getAddresses` on the context's network → the address list (prompts once). */
export async function fetchAddresses(
  ctx: RequestContext,
  options: FetchAddressesOptions = {}
): Promise<WalletAddress[]> {
  const { network = networkOf(ctx), allowPolicyAccounts, chains } = options;
  const result = await ctx.request('getAddresses', {
    network,
    ...(allowPolicyAccounts !== undefined ? { allowPolicyAccounts } : {}),
    ...(chains ? { chains } : {}),
  });
  if (!result || typeof result !== 'object') throw new Error('getAddresses returned no result');
  const { addresses }: { addresses?: unknown } = result;
  if (!Array.isArray(addresses)) throw new Error('getAddresses result has no `addresses` array');
  return addresses.filter(isWalletAddress);
}

export type BtcAddressType = 'p2wpkh' | 'p2tr' | 'p2wsh';

/** The BTC entry of `type`, or the first BTC entry when no type is given. */
export function pickBtcEntry(addresses: WalletAddress[], type?: BtcAddressType): WalletAddress {
  const entry = addresses.find(a => a.symbol === 'BTC' && (type === undefined || a.type === type));
  if (!entry) throw new Error(`getAddresses returned no ${type ?? 'BTC'} address`);
  return entry;
}

export function pickBtcAddress(addresses: WalletAddress[], type?: BtcAddressType): string {
  return pickBtcEntry(addresses, type).address;
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

/** The connected wallet's own BTC address of `type` on the context's network. */
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
 * The selected account's taproot key. `publicKey` is the 33-byte ECDSA key;
 * `tweakedPublicKey` is the 32-byte x-only key actually in the scriptPubKey.
 */
export interface TaprootKeys {
  internalKey: Uint8Array;
  tweakedKey: Uint8Array;
}

export async function fetchTaprootKeys(ctx: RequestContext): Promise<TaprootKeys> {
  const entry = (await fetchAddresses(ctx)).find(a => a.symbol === 'BTC' && a.type === 'p2tr');
  if (!entry?.publicKey || !entry.tweakedPublicKey)
    throw new Error('getAddresses returned no p2tr address with a publicKey + tweakedPublicKey');
  // Leather reports the internal key in 33-byte compressed form; taproot works
  // with the 32-byte x-only half.
  const internal = hex.decode(entry.publicKey);
  return {
    internalKey: internal.length === 33 ? internal.slice(1) : internal,
    tweakedKey: hex.decode(entry.tweakedPublicKey),
  };
}

/**
 * The selected policy (multisig) account's descriptor, e.g.
 * `wsh(sortedmulti(2,xpub…/0/0,…))#checksum`. Requires a policy account to be
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

const extendedKeyPattern = /[xt]pub[0-9A-HJ-NP-Za-km-z]+/;

/**
 * The extended public key inside a descriptor. Tolerant of both shapes the
 * wallet reports: a bare `wpkh(xpub…)` and an origin-prefixed
 * `wpkh([fp/84h/0h/0h]xpub…/0/0)`.
 */
export function extractXpub(descriptor: string): string {
  const match = extendedKeyPattern.exec(descriptor);
  if (!match) throw new Error(`No extended public key in descriptor: ${descriptor}`);
  return match[0];
}

export interface AccountKeys {
  /** Account-level extended public key, e.g. `xpub…` at m/84'/0'/0'. */
  xpub: string;
  address: string;
  /** 33-byte compressed key of the account's 0/0 address. */
  publicKey: string;
  derivationPath?: string;
}

/**
 * The connected account's native-segwit xpub — the key a multisig vault is
 * built from, and what the multisig dApp sends at sign-in.
 */
export async function fetchAccountKeys(ctx: RequestContext): Promise<AccountKeys> {
  const entry = pickBtcEntry(await fetchAddresses(ctx), 'p2wpkh');
  if (!entry.descriptor || !entry.publicKey)
    throw new Error('getAddresses returned a p2wpkh address without a descriptor + publicKey');
  return {
    xpub: extractXpub(entry.descriptor),
    address: entry.address,
    publicKey: entry.publicKey,
    derivationPath: entry.derivationPath,
  };
}

export interface AccountSummary {
  network: string;
  mode: NetworkMode;
  /** Present when the selected account is a Bitcoin policy (multisig). */
  policyAddress?: string;
  policyDescriptor?: string;
  btcAddress?: string;
  taprootAddress?: string;
  stxAddress?: string;
  /** Present when the selected STX account is a multisig policy. */
  stxMultisig?: { threshold: number; publicKeys: string[] };
}

/**
 * One `getAddresses` call describing what the origin is bound to, for the
 * header: which account signs, and whether it is singlesig or a policy.
 */
export async function fetchAccountSummary(ctx: RequestContext): Promise<AccountSummary> {
  const network = networkOf(ctx);
  const addresses = await fetchAddresses(ctx, { allowPolicyAccounts: true });
  const policy = addresses.find(a => a.symbol === 'BTC' && a.type === 'p2wsh');
  const stx = addresses.find(a => a.symbol === 'STX');
  return {
    network,
    mode: networkModeOf(network),
    policyAddress: policy?.address,
    policyDescriptor: policy?.descriptor,
    btcAddress: addresses.find(a => a.symbol === 'BTC' && a.type === 'p2wpkh')?.address,
    taprootAddress: addresses.find(a => a.symbol === 'BTC' && a.type === 'p2tr')?.address,
    stxAddress: stx?.address,
    stxMultisig:
      stx?.kind === 'multisig' && stx.threshold && stx.publicKeys
        ? { threshold: stx.threshold, publicKeys: stx.publicKeys }
        : undefined,
  };
}

/**
 * Where a BTC transfer goes: the matching `VITE_TEST_APP_BTC_RECIPIENT*`
 * override if set (no prompt), otherwise the wallet's own address (one
 * prompt), so a transfer costs only its fee.
 */
export async function resolveBtcRecipient(
  ctx: RequestContext,
  type: BtcAddressType = 'p2wpkh'
): Promise<string> {
  const override =
    networkModeOf(networkOf(ctx)) === 'mainnet'
      ? BTC_RECIPIENT_OVERRIDE
      : BTC_RECIPIENT_REGTEST_OVERRIDE;
  return override ?? fetchBtcAddress(ctx, type);
}

/**
 * Same, but tolerant of a policy account being selected: a multisig account
 * has no p2wpkh address, so any BTC address it reports is the right target.
 */
export async function resolveOwnBtcRecipient(ctx: RequestContext): Promise<string> {
  const override =
    networkModeOf(networkOf(ctx)) === 'mainnet'
      ? BTC_RECIPIENT_OVERRIDE
      : BTC_RECIPIENT_REGTEST_OVERRIDE;
  if (override) return override;
  return pickBtcAddress(await fetchAddresses(ctx, { allowPolicyAccounts: true }));
}
