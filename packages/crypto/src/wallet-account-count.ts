import {
  extractAccountIndexFromDescriptor,
  extractKeyOriginPathFromDescriptor,
} from './derivation-path-utils';

interface CountWalletAccountsKeychain {
  descriptor: string;
  chain: 'bitcoin' | 'stacks';
}

export interface CountWalletAccountsArgs {
  walletType: string;
  fingerprint: string;
  highestAccountIndex?: number;
  keychains?: CountWalletAccountsKeychain[];
}

export function isValidAccountIndex(index?: number): index is number {
  return typeof index === 'number' && Number.isInteger(index) && index >= 0;
}

export function softwareAccountCountFromHighestIndex(highestAccountIndex?: number): number {
  return isValidAccountIndex(highestAccountIndex) ? highestAccountIndex + 1 : 1;
}

// Single source of truth for how many accounts a wallet exposes, shared by the
// `selectWalletAccountRefTree` selector and the 3->4 accounts-slice migration so
// the two can never disagree. Software wallets derive the count from
// `highestAccountIndex`; Ledger wallets from their registered keychains — the
// number of Stacks keychains, or the number of unique Bitcoin account indices.
//
// This assumes account indices are contiguous from 0: the rest of the app
// addresses accounts by their 0-based position, not by derivation index. The
// Stacks account index lives at the path's final segment rather than the BIP44
// account level, which is why Stacks keychains are counted rather than
// index-parsed. Descriptor parsing is wrapped so a malformed keychain is skipped
// rather than thrown, since this runs in a selector (render path) and during
// migration rehydrate.
export function countWalletAccounts({
  walletType,
  fingerprint,
  highestAccountIndex,
  keychains = [],
}: CountWalletAccountsArgs): number {
  if (walletType === 'software') {
    return softwareAccountCountFromHighestIndex(highestAccountIndex);
  }

  let stacksCount = 0;
  const bitcoinAccountIndices = new Set<number>();

  for (const keychain of keychains) {
    if (!keychain?.descriptor) continue;
    try {
      const keyOrigin = extractKeyOriginPathFromDescriptor(keychain.descriptor);
      if (keyOrigin.split('/')[0] !== fingerprint) continue;
      if (keychain.chain === 'stacks') stacksCount += 1;
      if (keychain.chain === 'bitcoin') {
        bitcoinAccountIndices.add(extractAccountIndexFromDescriptor(keychain.descriptor));
      }
    } catch {
      continue;
    }
  }

  return Math.max(stacksCount, bitcoinAccountIndices.size);
}
