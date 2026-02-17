import { produce } from 'immer';

import { extractFingerprintFromDescriptor } from '@leather.io/crypto';
import { isString } from '@leather.io/utils';

import { logger } from '@shared/logger';
import { assumedZeroFingerprint } from '@shared/utils';

import type { RootState } from '@app/store';

function findDefaultAccountFingerprint(state: any): string {
  // Try to extract fingerprint from software wallet Stacks descriptor
  const stacksDescriptor = state?.chains?.stx?.default?.currentAccountStacksDescriptor;
  if (isString(stacksDescriptor) && stacksDescriptor.includes('[')) {
    try {
      const fingerprint = extractFingerprintFromDescriptor(stacksDescriptor);
      if (fingerprint) return fingerprint;
    } catch (error) {
      // Continue to try ledger wallet
      logger.error('Error extracting fingerprint from Stacks descriptor:', error, stacksDescriptor);
    }
  }

  // Try to extract fingerprint from ledger wallet Bitcoin policy
  const firstBitcoinId = state?.ledger?.bitcoin?.ids?.[0];
  if (firstBitcoinId) {
    const bitcoinEntities = state?.ledger?.bitcoin?.entities ?? {};
    const firstEntity = bitcoinEntities[firstBitcoinId];
    const policy = firstEntity?.policy;
    if (isString(policy) && policy.includes('[')) {
      try {
        const fingerprint = extractFingerprintFromDescriptor(policy);
        if (fingerprint) return fingerprint;
      } catch (error) {
        // Continue to default
        logger.error('Error extracting fingerprint from Bitcoin policy:', error, policy);
      }
    }
  }

  // Default only for Stacks-only wallets
  return assumedZeroFingerprint;
}

export function migrateMultiWalletSupport(state: any) {
  logger.info('Beginning multi-wallet support migration');

  return produce(state, (draftState: any) => {
    // Clean up very old state that might be hanging around from very old
    // versions (pre-migration to using no serialization)
    if (draftState.onboarding) delete draftState.onboarding;
    if (draftState.ordinals) delete draftState.ordinals;
    if (draftState.analytics) delete draftState.analytics;

    // Move salt from:
    // state.softwareKeys.entities.default.salt → state.softwareKeys.salt
    if (draftState.softwareKeys) {
      const defaultSoftwareWallet = draftState.softwareKeys.entities?.default;
      if (defaultSoftwareWallet && isString(defaultSoftwareWallet.salt)) {
        // Move `salt` to top level of softwareKeys slice
        draftState.softwareKeys.salt = defaultSoftwareWallet.salt;
        // Remove `salt` from the default key entity
        draftState.softwareKeys.entities.default.salt = undefined;
      }
    }

    const fingerprint = findDefaultAccountFingerprint(state);
    const currentAccountIndex = draftState?.chains?.stx?.default?.currentAccountIndex ?? 0;

    // Check if there are any keys in the wallet
    const bitcoinEntities = draftState?.ledger?.bitcoin?.entities ?? {};
    const stacksEntities = draftState?.ledger?.stacks?.entities ?? {};
    const hasSoftwareKeys = draftState.softwareKeys?.ids && draftState.softwareKeys.ids.length > 0;
    const hasLedgerAccounts =
      Object.keys(bitcoinEntities).length > 0 || Object.keys(stacksEntities).length > 0;
    const hasAnyKeys = hasSoftwareKeys || hasLedgerAccounts;

    // Set active account
    draftState.active = { account: { fingerprint, accountIndex: currentAccountIndex } };

    // Ensure wallets slice is initialized
    if (!draftState.wallets) draftState.wallets = { ids: [], entities: {} };

    //
    // If the wallet has a default software key, migrate it to use fingerprint
    if (
      draftState.softwareKeys &&
      state.softwareKeys.entities.default &&
      fingerprint !== 'default'
    ) {
      const defaultKey = draftState.softwareKeys.entities.default;
      draftState.softwareKeys.entities[fingerprint] = {
        ...defaultKey,
        id: fingerprint,
      };
      delete draftState.softwareKeys.entities.default;

      const defaultIndex = draftState.softwareKeys.ids.indexOf('default');
      if (defaultIndex !== -1) {
        draftState.softwareKeys.ids[defaultIndex] = fingerprint;
      }

      // Create wallet entry for software wallet
      if (!draftState.wallets.entities[fingerprint]) {
        draftState.wallets.entities[fingerprint] = {
          fingerprint,
          name: 'Wallet 1',
          type: 'software',
          createdOn: null,
        };
      }
      if (!draftState.wallets.ids.includes(fingerprint)) draftState.wallets.ids.push(fingerprint);
    }

    //
    // Migrate chains.stx from 'default' to fingerprint
    // Only migrate if there are keys in the wallet
    if (hasAnyKeys && draftState.chains?.stx?.default) {
      draftState.chains.stx[fingerprint] = draftState.chains.stx.default;
      delete draftState.chains.stx.default;
    }

    //
    // Migrate ledger wallets to `wallets` slice

    if (hasLedgerAccounts) {
      //
      // Create wallet entry for ledger wallet
      // For Stacks-only ledger wallets, fingerprint will be assumedZeroFingerprint
      if (!draftState.wallets.entities[fingerprint]) {
        draftState.wallets.entities[fingerprint] = {
          fingerprint,
          name: 'My Ledger',
          type: 'ledger',
          createdOn: null,
        };
      }
      if (!draftState.wallets.ids.includes(fingerprint)) {
        draftState.wallets.ids.push(fingerprint);
      }

      //
      // Migrate ledger.bitcoin entity IDs from 'default/...' to 'fingerprint/...'
      if (draftState.ledger?.bitcoin) {
        const newBitcoinEntities: Record<string, any> = {};
        const newBitcoinIds: string[] = [];

        for (const id of draftState.ledger.bitcoin.ids) {
          if (id.startsWith('default/')) {
            const newId = id.replace('default/', `${fingerprint}/`);
            const entity = draftState.ledger.bitcoin.entities[id];
            delete entity.targetId;
            delete entity.walletId;
            newBitcoinEntities[newId] = {
              ...entity,
              id: newId,
              fingerprint,
            };
            newBitcoinIds.push(newId);
          } else {
            const entity = draftState.ledger.bitcoin.entities[id];
            delete entity.targetId;
            delete entity.walletId;
            newBitcoinEntities[id] = {
              ...entity,
              fingerprint: entity.fingerprint || fingerprint,
            };
            newBitcoinIds.push(id);
          }
        }

        draftState.ledger.bitcoin.entities = newBitcoinEntities as any;
        draftState.ledger.bitcoin.ids = newBitcoinIds;
      }

      //
      // Migrate ledger.stacks entity IDs from 'default/...' to 'fingerprint/...'
      if (draftState.ledger?.stacks) {
        const newStacksEntities: Record<string, any> = {};
        const newStacksIds: string[] = [];

        for (const id of draftState.ledger.stacks.ids) {
          if (id.startsWith('default/')) {
            const newId = id.replace('default/', `${fingerprint}/`);
            const entity = draftState.ledger.stacks.entities[id];
            delete entity.targetId;
            delete entity.walletId;

            newStacksEntities[newId] = {
              ...entity,
              id: newId,
              fingerprint,
            };
            newStacksIds.push(newId);
          } else {
            const entity = draftState.ledger.stacks.entities[id];
            delete entity.targetId;
            delete entity.walletId;

            newStacksEntities[id] = {
              ...entity,
              fingerprint: entity.fingerprint || fingerprint,
            };
            newStacksIds.push(id);
          }
        }

        draftState.ledger.stacks.entities = newStacksEntities as any;
        draftState.ledger.stacks.ids = newStacksIds;
      }
    }

    //
    // Remove legacy properties
    if (draftState.ledger?.bitcoin?.entities) {
      for (const id of Object.keys(draftState.ledger.bitcoin.entities)) {
        const entity = draftState.ledger.bitcoin.entities[id];
        if (entity) {
          if ('targetId' in entity) delete entity.targetId;
          if ('walletId' in entity) delete entity.walletId;
          if (!entity.fingerprint) entity.fingerprint = fingerprint;
        }
      }
    }
    if (draftState.ledger?.stacks?.entities) {
      for (const id of Object.keys(draftState.ledger.stacks.entities)) {
        const entity = draftState.ledger.stacks.entities[id];
        if (entity) {
          if ('targetId' in entity) delete entity.targetId;
          if ('walletId' in entity) delete entity.walletId;
          if (!entity.fingerprint) entity.fingerprint = fingerprint;
        }
      }
    }

    // Add fingerprint to all appPermissions entities
    if (draftState.appPermissions?.entities) {
      for (const origin of Object.keys(draftState.appPermissions.entities)) {
        const entity = draftState.appPermissions.entities[origin];
        if (entity && !entity.fingerprint) {
          entity.fingerprint = fingerprint;
        }
      }
    }

    //
    // Clean up chains.stx.default when no keys exist
    if (!hasAnyKeys && draftState.chains?.stx?.default) {
      delete draftState.chains.stx.default;
    }
  });
}
