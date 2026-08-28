// Gathers everything a PSBT scenario needs from the connected wallet in ONE
// `getAddresses` call, so a scenario spanning several input kinds still costs
// the developer a single approval prompt.
//
// Pure: no React, no `window`.
import { hex } from '@scure/base';

import { networkModeOf } from '../networks';
import { type RequestContext, networkOf } from '../types';
import { extractXpub, fetchAddresses, pickBtcEntry } from '../wallet';
import { cosignerXpubsFor, sortedMultiDescriptor } from './descriptors';
import type { PsbtInputKind, PsbtKeys } from './psbt';

export interface CollectKeysOptions {
  /**
   * Where a `sortedmulti` input's vault comes from: `synthetic` builds one
   * around the wallet's own xpub (works from a singlesig account), `selected`
   * uses the policy account currently selected in the wallet.
   */
  vault?: 'synthetic' | 'selected';
  vaultAccountIndex?: number;
  threshold?: number;
}

export async function collectPsbtKeys(
  ctx: RequestContext,
  kinds: PsbtInputKind[],
  options: CollectKeysOptions = {}
): Promise<PsbtKeys> {
  const needsVault = kinds.includes('sortedmulti');
  const wantsSelectedVault = options.vault === 'selected';
  const addresses = await fetchAddresses(ctx, { allowPolicyAccounts: wantsSelectedVault });

  const keys: PsbtKeys = {};

  if (kinds.includes('p2wpkh') || kinds.includes('wsh-pk') || (needsVault && !wantsSelectedVault)) {
    const entry = pickBtcEntry(addresses, 'p2wpkh');
    if (!entry.publicKey)
      throw new Error('getAddresses returned a p2wpkh address with no publicKey');
    keys.nativeSegwitPubkey = hex.decode(entry.publicKey);
    if (entry.descriptor) keys.ownXpub = extractXpub(entry.descriptor);
  }

  if (kinds.includes('p2tr')) {
    const entry = pickBtcEntry(addresses, 'p2tr');
    if (!entry.publicKey || !entry.tweakedPublicKey)
      throw new Error('getAddresses returned a p2tr address without publicKey + tweakedPublicKey');
    const internal = hex.decode(entry.publicKey);
    keys.taprootInternalKey = internal.length === 33 ? internal.slice(1) : internal;
    keys.taprootTweakedKey = hex.decode(entry.tweakedPublicKey);
  }

  if (needsVault) {
    if (wantsSelectedVault) {
      const policy = addresses.find(
        address => address.symbol === 'BTC' && address.type === 'p2wsh'
      );
      if (!policy?.descriptor)
        throw new Error(
          'No policy (p2wsh) address returned — select a multisig account in the wallet first (register one with btc_addAccount).'
        );
      keys.vaultDescriptor = policy.descriptor;
    } else {
      if (!keys.ownXpub)
        throw new Error(
          'getAddresses returned a p2wpkh address with no descriptor to read an xpub from'
        );
      keys.vaultDescriptor = sortedMultiDescriptor({
        ownXpub: keys.ownXpub,
        cosignerXpubs: cosignerXpubsFor(networkModeOf(networkOf(ctx))),
        threshold: options.threshold,
        accountIndex: options.vaultAccountIndex,
      });
    }
    keys.vaultAccountIndex = options.vaultAccountIndex ?? 0;
  }

  return keys;
}
