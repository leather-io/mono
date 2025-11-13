import { produce } from 'immer';

import { extractFingerprintFromDescriptor } from '@leather.io/crypto';
import { isString } from '@leather.io/utils';

import type { RootState } from '@app/store';

function findDefaultAccountFingerprint(state: any): string {
  // Try to extract fingerprint from software wallet Stacks descriptor
  const stacksDescriptor = state.chains?.stx?.default?.currentAccountStacksDescriptor;
  if (isString(stacksDescriptor) && stacksDescriptor.includes('[')) {
    try {
      const fingerprint = extractFingerprintFromDescriptor(stacksDescriptor);
      if (fingerprint) return fingerprint;
    } catch (error) {
      // Continue to try ledger wallet
      // eslint-disable-next-line no-console
      console.log('Error extracting fingerprint from Stacks descriptor:', error, stacksDescriptor);
    }
  }

  // Try to extract fingerprint from ledger wallet Bitcoin policy
  const firstBitcoinId = state.ledger?.bitcoin?.ids?.[0];
  if (firstBitcoinId) {
    const bitcoinEntities = state.ledger?.bitcoin?.entities ?? {};
    const firstEntity = bitcoinEntities[firstBitcoinId];
    const policy = firstEntity?.policy;
    if (isString(policy) && policy.includes('[')) {
      try {
        const fingerprint = extractFingerprintFromDescriptor(policy);
        if (fingerprint) return fingerprint;
      } catch (error) {
        // Continue to default
        // eslint-disable-next-line no-console
        console.log('Error extracting fingerprint from Bitcoin policy:', error, policy);
      }
    }
  }

  // Default to 'default' for Stacks-only wallets
  return 'default';
}

export function migrateMultiWalletSupport(state: RootState) {
  // eslint-disable-next-line no-console
  console.log('RUNNING MULTI WALLET MIGRATION');

  return produce(state, (draftState: any) => {
    //
    // Migrate salt from:
    // state.softwareKeys.entities.default.salt → state.softwareKeys.salt
    const defaultSoftwareWallet = draftState.softwareKeys?.entities?.default;
    if (defaultSoftwareWallet && isString(defaultSoftwareWallet.salt)) {
      // Move `salt` to top level of softwareKeys slice
      draftState.softwareKeys.salt = defaultSoftwareWallet.salt;
      // Remove `salt` from the default key entity
      draftState.softwareKeys.entities.default.salt = undefined;
    }

    const fingerprint = findDefaultAccountFingerprint(state);
    const currentAccountIndex = draftState.chains?.stx?.default?.currentAccountIndex ?? 0;

    // Set active account
    draftState.active = { account: { fingerprint, accountIndex: currentAccountIndex } };

    //
    // Ensure wallets slice is initialized
    if (!draftState.wallets) {
      draftState.wallets = { ids: [], entities: {} };
    }

    //
    // If the wallet has a default software key, migrate it to use fingerprint
    if (state.softwareKeys.entities.default && fingerprint !== 'default') {
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

      //
      // Create wallet entry for software wallet
      if (!draftState.wallets.entities[fingerprint]) {
        draftState.wallets.entities[fingerprint] = {
          fingerprint,
          name: 'Wallet 1',
          type: 'software',
          createdOn: null,
        };
      }
      if (!draftState.wallets.ids.includes(fingerprint)) {
        draftState.wallets.ids.push(fingerprint);
      }
    }

    //
    // Migrate chains.stx from 'default' to fingerprint if we have one
    if (fingerprint !== 'default' && draftState.chains?.stx?.default) {
      draftState.chains.stx[fingerprint] = draftState.chains.stx.default;
      delete draftState.chains.stx.default;
    }

    //
    // Migrate ledger wallets to `wallets` slice
    const bitcoinEntities = draftState.ledger?.bitcoin?.entities ?? {};
    const stacksEntities = draftState.ledger?.stacks?.entities ?? {};
    const hasLedgerAccounts =
      Object.keys(bitcoinEntities).length > 0 || Object.keys(stacksEntities).length > 0;

    if (hasLedgerAccounts) {
      //
      // Create wallet entry for ledger wallet
      // For Stacks-only ledger wallets, fingerprint will be 'default'
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

      // Only update ledger entity IDs if we have a real fingerprint (not 'default')
      const shouldMigrateLedgerIds = fingerprint !== 'default';

      if (shouldMigrateLedgerIds) {
        //
        // Migrate ledger.bitcoin entity IDs from 'default/...' to 'fingerprint/...'
        if (draftState.ledger?.bitcoin) {
          const newBitcoinEntities: Record<string, any> = {};
          const newBitcoinIds: string[] = [];

          for (const id of draftState.ledger.bitcoin.ids) {
            if (id.startsWith('default/')) {
              const newId = id.replace('default/', `${fingerprint}/`);
              const entity = draftState.ledger.bitcoin.entities[id];
              newBitcoinEntities[newId] = { ...entity, id: newId, walletId: fingerprint };
              newBitcoinIds.push(newId);
            } else {
              newBitcoinEntities[id] = draftState.ledger.bitcoin.entities[id];
              newBitcoinIds.push(id);
            }
          }

          draftState.ledger.bitcoin.entities = newBitcoinEntities;
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
              newStacksEntities[newId] = { ...entity, id: newId, walletId: fingerprint };
              newStacksIds.push(newId);
            } else {
              newStacksEntities[id] = draftState.ledger.stacks.entities[id];
              newStacksIds.push(id);
            }
          }

          draftState.ledger.stacks.entities = newStacksEntities;
          draftState.ledger.stacks.ids = newStacksIds;
        }
      }
    }

    //
    // Add fingerprint to all appPermissions entities
    if (draftState.appPermissions?.entities) {
      for (const origin of Object.keys(draftState.appPermissions.entities)) {
        const entity = draftState.appPermissions.entities[origin];
        if (entity && !entity.fingerprint) {
          entity.fingerprint = fingerprint;
        }
      }
    }
  });
}
