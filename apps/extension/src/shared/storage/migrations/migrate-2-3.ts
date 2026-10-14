import { produce } from 'immer';

import {
  createDescriptor,
  createKeyOriginPath,
  extractFingerprintFromDescriptor,
  extractKeyOriginPathFromDescriptor,
} from '@leather.io/crypto';
import { isDefined, isString } from '@leather.io/utils';

import { logger } from '@shared/logger';
import { assumedZeroFingerprint } from '@shared/utils';
import { isRecord } from '@shared/utils/is-record';

import { type LegacyRecord, asUnknownArray, getRecordAtPath } from './legacy-state';

interface LegacyWalletEntity {
  fingerprint: string;
  name: string;
  type: 'software' | 'ledger';
  createdOn: null;
}

function getFirstId(ids: unknown) {
  return asUnknownArray(ids)?.[0];
}

function addWalletEntity(wallets: LegacyRecord | undefined, wallet: LegacyWalletEntity) {
  const walletEntities = getRecordAtPath(wallets, 'entities');
  if (walletEntities && !walletEntities[wallet.fingerprint]) {
    walletEntities[wallet.fingerprint] = wallet;
  }
  const walletIds = asUnknownArray(wallets?.ids);
  if (walletIds && !walletIds.includes(wallet.fingerprint)) {
    walletIds.push(wallet.fingerprint);
  }
}

function findDefaultAccountFingerprint(state: unknown): string {
  // Try to extract fingerprint from software wallet Stacks descriptor
  const stacksDescriptor = getRecordAtPath(
    state,
    'chains',
    'stx',
    'default'
  )?.currentAccountStacksDescriptor;
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
  const firstBitcoinId = getFirstId(getRecordAtPath(state, 'ledger', 'bitcoin')?.ids);
  if (isString(firstBitcoinId) && firstBitcoinId) {
    const bitcoinEntities = getRecordAtPath(state, 'ledger', 'bitcoin', 'entities') ?? {};
    const firstEntity = getRecordAtPath(bitcoinEntities, firstBitcoinId);
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

export function migrateMultiWalletSupport(state: unknown) {
  logger.info('Beginning multi-wallet support migration');

  return produce(state, draftState => {
    if (!isRecord(draftState)) return;

    // Clean up very old state that might be hanging around from very old
    // versions (pre-migration to using no serialization)
    if (draftState.onboarding) delete draftState.onboarding;
    if (draftState.ordinals) delete draftState.ordinals;
    if (draftState.analytics) delete draftState.analytics;

    // Move salt from:
    // state.softwareKeys.entities.default.salt → state.softwareKeys.salt
    const softwareKeys = getRecordAtPath(draftState, 'softwareKeys');
    if (softwareKeys) {
      const defaultSoftwareWallet = getRecordAtPath(softwareKeys, 'entities', 'default');
      if (defaultSoftwareWallet && isString(defaultSoftwareWallet.salt)) {
        // Move `salt` to top level of softwareKeys slice
        softwareKeys.salt = defaultSoftwareWallet.salt;
        // Remove `salt` from the default key entity
        defaultSoftwareWallet.salt = undefined;
      }
    }

    const fingerprint = findDefaultAccountFingerprint(state);
    const currentAccountIndex =
      getRecordAtPath(draftState, 'chains', 'stx', 'default')?.currentAccountIndex ?? 0;

    // Check if there are any keys in the wallet
    const bitcoinEntities = getRecordAtPath(draftState, 'ledger', 'bitcoin', 'entities') ?? {};
    const stacksEntities = getRecordAtPath(draftState, 'ledger', 'stacks', 'entities') ?? {};
    const softwareKeyIds = asUnknownArray(softwareKeys?.ids);
    const hasSoftwareKeys = isDefined(softwareKeyIds) && softwareKeyIds.length > 0;
    const hasLedgerAccounts =
      Object.keys(bitcoinEntities).length > 0 || Object.keys(stacksEntities).length > 0;
    const hasAnyKeys = hasSoftwareKeys || hasLedgerAccounts;

    // Set active account
    draftState.active = { account: { fingerprint, accountIndex: currentAccountIndex } };

    // Ensure wallets slice is initialized
    if (!draftState.wallets) draftState.wallets = { ids: [], entities: {} };
    const wallets = getRecordAtPath(draftState, 'wallets');

    //
    // If the wallet has a default software key, migrate it to use fingerprint
    const softwareKeyEntities = getRecordAtPath(softwareKeys, 'entities');
    if (
      softwareKeys &&
      softwareKeyEntities &&
      getRecordAtPath(state, 'softwareKeys', 'entities')?.default &&
      fingerprint !== 'default'
    ) {
      const defaultKey = getRecordAtPath(softwareKeyEntities, 'default');
      softwareKeyEntities[fingerprint] = {
        ...defaultKey,
        id: fingerprint,
      };
      delete softwareKeyEntities.default;

      if (softwareKeyIds) {
        const defaultIndex = softwareKeyIds.indexOf('default');
        if (defaultIndex !== -1) {
          softwareKeyIds[defaultIndex] = fingerprint;
        }
      }

      // Create wallet entry for software wallet
      addWalletEntity(wallets, {
        fingerprint,
        name: 'Wallet 1',
        type: 'software',
        createdOn: null,
      });
    }

    //
    // Migrate chains.stx from 'default' to fingerprint
    // Only migrate if there are keys in the wallet
    const stxChains = getRecordAtPath(draftState, 'chains', 'stx');
    if (hasAnyKeys && stxChains?.default) {
      stxChains[fingerprint] = stxChains.default;
      delete stxChains.default;
    }

    //
    // Migrate ledger wallets to `wallets` slice

    if (hasLedgerAccounts) {
      //
      // Create wallet entry for ledger wallet
      // For Stacks-only ledger wallets, fingerprint will be assumedZeroFingerprint
      addWalletEntity(wallets, {
        fingerprint,
        name: 'My Ledger',
        type: 'ledger',
        createdOn: null,
      });

      //
      // Migrate ledger.bitcoin entity IDs from 'default/...' to 'fingerprint/...'
      const ledgerBitcoin = getRecordAtPath(draftState, 'ledger', 'bitcoin');
      if (ledgerBitcoin) {
        const newBitcoinEntities: LegacyRecord = {};
        const newBitcoinIds: string[] = [];
        const ledgerBitcoinEntities = getRecordAtPath(ledgerBitcoin, 'entities');
        const ledgerBitcoinIds = asUnknownArray(ledgerBitcoin.ids) ?? [];

        for (const id of ledgerBitcoinIds.filter(isString)) {
          if (id.startsWith('default/')) {
            const newId = id.replace('default/', `${fingerprint}/`);
            const entity = getRecordAtPath(ledgerBitcoinEntities, id) ?? {};
            delete entity.targetId;
            delete entity.walletId;
            newBitcoinEntities[newId] = {
              ...entity,
              id: newId,
              fingerprint,
            };
            newBitcoinIds.push(newId);
          } else {
            const entity = getRecordAtPath(ledgerBitcoinEntities, id) ?? {};
            delete entity.targetId;
            delete entity.walletId;
            newBitcoinEntities[id] = {
              ...entity,
              fingerprint: entity.fingerprint || fingerprint,
            };
            newBitcoinIds.push(id);
          }
        }

        ledgerBitcoin.entities = newBitcoinEntities;
        ledgerBitcoin.ids = newBitcoinIds;
      }

      //
      // Migrate ledger.stacks entity IDs from 'default/...' to 'fingerprint/...'
      const ledgerStacks = getRecordAtPath(draftState, 'ledger', 'stacks');
      if (ledgerStacks) {
        const newStacksEntities: LegacyRecord = {};
        const newStacksIds: string[] = [];
        const ledgerStacksEntities = getRecordAtPath(ledgerStacks, 'entities');
        const ledgerStacksIds = asUnknownArray(ledgerStacks.ids) ?? [];

        for (const id of ledgerStacksIds.filter(isString)) {
          if (id.startsWith('default/')) {
            const newId = id.replace('default/', `${fingerprint}/`);
            const entity = getRecordAtPath(ledgerStacksEntities, id) ?? {};
            delete entity.targetId;
            delete entity.walletId;

            newStacksEntities[newId] = {
              ...entity,
              id: newId,
              fingerprint,
            };
            newStacksIds.push(newId);
          } else {
            const entity = getRecordAtPath(ledgerStacksEntities, id) ?? {};
            delete entity.targetId;
            delete entity.walletId;

            newStacksEntities[id] = {
              ...entity,
              fingerprint: entity.fingerprint || fingerprint,
            };
            newStacksIds.push(id);
          }
        }

        ledgerStacks.entities = newStacksEntities;
        ledgerStacks.ids = newStacksIds;
      }
    }

    //
    // Remove legacy properties
    const legacyBitcoinEntities = getRecordAtPath(draftState, 'ledger', 'bitcoin', 'entities');
    if (legacyBitcoinEntities) {
      for (const id of Object.keys(legacyBitcoinEntities)) {
        const entity = getRecordAtPath(legacyBitcoinEntities, id);
        if (entity) {
          if ('targetId' in entity) delete entity.targetId;
          if ('walletId' in entity) delete entity.walletId;
          if (!entity.fingerprint) entity.fingerprint = fingerprint;
        }
      }
    }
    const legacyStacksEntities = getRecordAtPath(draftState, 'ledger', 'stacks', 'entities');
    if (legacyStacksEntities) {
      for (const id of Object.keys(legacyStacksEntities)) {
        const entity = getRecordAtPath(legacyStacksEntities, id);
        if (entity) {
          if ('targetId' in entity) delete entity.targetId;
          if ('walletId' in entity) delete entity.walletId;
          if (!entity.fingerprint) entity.fingerprint = fingerprint;
        }
      }
    }

    // Add fingerprint to all appPermissions entities
    const appPermissionEntities = getRecordAtPath(draftState, 'appPermissions', 'entities');
    if (appPermissionEntities) {
      for (const origin of Object.keys(appPermissionEntities)) {
        const entity = getRecordAtPath(appPermissionEntities, origin);
        if (entity && !entity.fingerprint) {
          entity.fingerprint = fingerprint;
        }
      }
    }

    //
    // Migrate ledger keys to keychain store
    if (hasLedgerAccounts) {
      if (!draftState.keychains) draftState.keychains = { ids: [], entities: {} };
      const keychainEntities = getRecordAtPath(draftState, 'keychains', 'entities') ?? {};
      const keychainIds = asUnknownArray(getRecordAtPath(draftState, 'keychains')?.ids);

      // Migrate Bitcoin keys
      const bitcoinKeyEntities = getRecordAtPath(draftState, 'ledger', 'bitcoin', 'entities');
      if (bitcoinKeyEntities) {
        for (const id of Object.keys(bitcoinKeyEntities)) {
          const entity = getRecordAtPath(bitcoinKeyEntities, id);
          const descriptor = entity?.policy;
          if (isString(descriptor) && descriptor) {
            // Bitcoin keys already have the descriptor (policy) which includes the key origin path
            try {
              const keyOriginPath = extractKeyOriginPathFromDescriptor(descriptor);
              if (keyOriginPath && !keychainEntities[keyOriginPath]) {
                keychainEntities[keyOriginPath] = {
                  descriptor,
                  chain: 'bitcoin',
                };
                keychainIds?.push(keyOriginPath);
              }
            } catch (error) {
              logger.error(
                'Error extracting key origin from Bitcoin descriptor:',
                error,
                descriptor
              );
            }
          }
        }
      }

      // Migrate Stacks keys
      const stacksKeyEntities = getRecordAtPath(draftState, 'ledger', 'stacks', 'entities');
      if (stacksKeyEntities) {
        for (const id of Object.keys(stacksKeyEntities)) {
          const entity = getRecordAtPath(stacksKeyEntities, id);

          const publicKey = entity?.stxPublicKey || entity?.publicKey;
          if (
            !entity ||
            !isString(entity.path) ||
            !entity.path ||
            !isString(publicKey) ||
            !publicKey
          )
            continue;

          const entityFingerprint = entity.fingerprint || fingerprint;
          if (!isString(entityFingerprint)) continue;
          const keyOrigin = createKeyOriginPath(entityFingerprint, entity.path);
          const descriptor = createDescriptor(keyOrigin, publicKey);
          if (!keychainEntities[keyOrigin]) {
            keychainEntities[keyOrigin] = {
              descriptor,
              chain: 'stacks',
            };
            keychainIds?.push(keyOrigin);
          }
        }
      }
    }

    //
    // Clean up chains.stx.default when no keys exist
    if (!hasAnyKeys && stxChains?.default) {
      delete stxChains.default;
    }

    //
    // Clean up old ledger slice after migration to keychains
    if (hasLedgerAccounts && draftState.ledger) {
      delete draftState.ledger;
    }
  });
}
