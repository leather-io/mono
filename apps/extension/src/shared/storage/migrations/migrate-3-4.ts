import { produce } from 'immer';

import {
  extractAccountIndexFromDescriptor,
  extractKeyOriginPathFromDescriptor,
  makeAccountIdentifer,
} from '@leather.io/crypto';

import { logger } from '@shared/logger';

// Counts how many accounts a wallet exposes, mirroring `selectWalletAccountRefTree`:
// software wallets derive the count from `highestAccountIndex`, Ledger wallets
// from the number of keychains registered under their fingerprint.
function countAccountsForWallet(state: any, fingerprint: string, type: string): number {
  if (type === 'software') {
    const highestAccountIndex = state?.chains?.stx?.[fingerprint]?.highestAccountIndex;
    return typeof highestAccountIndex === 'number' ? highestAccountIndex + 1 : 1;
  }

  const keychainEntities = state?.keychains?.entities ?? {};
  let stacksCount = 0;
  const bitcoinAccountIndices = new Set<number>();

  for (const keychain of Object.values<any>(keychainEntities)) {
    if (!keychain?.descriptor) continue;
    try {
      const keyOrigin = extractKeyOriginPathFromDescriptor(keychain.descriptor);
      if (!keyOrigin.startsWith(fingerprint)) continue;
      if (keychain.chain === 'stacks') stacksCount += 1;
      if (keychain.chain === 'bitcoin') {
        bitcoinAccountIndices.add(extractAccountIndexFromDescriptor(keychain.descriptor));
      }
    } catch (error) {
      logger.error(
        'Error extracting account info from keychain descriptor',
        error,
        keychain.descriptor
      );
    }
  }

  return Math.max(stacksCount, bitcoinAccountIndices.size, 1);
}

// Introduces the `accounts` entity slice, materializing an entity per derived
// account so name/hidden/icon metadata has a home keyed by
// `fingerprint/accountIndex`, with a lifecycle tied to the owning wallet.
export function migrateToAccountsSlice(state: any): any {
  logger.info('Beginning accounts slice migration');

  return produce(state, (draftState: any) => {
    const entities: Record<string, { id: string }> = {};
    const ids: string[] = [];

    const walletEntities = draftState?.wallets?.entities ?? {};
    for (const wallet of Object.values<any>(walletEntities)) {
      if (!wallet?.fingerprint) continue;
      const accountCount = countAccountsForWallet(draftState, wallet.fingerprint, wallet.type);

      for (let accountIndex = 0; accountIndex < accountCount; accountIndex++) {
        const id = makeAccountIdentifer(wallet.fingerprint, accountIndex);
        entities[id] = { id };
        ids.push(id);
      }
    }

    draftState.accounts = { ids, entities };
  });
}
