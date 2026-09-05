import {
  createDescriptor,
  createKeyOriginPath,
  extractDerivationPathFromDescriptor,
  extractFingerprintFromDescriptor,
  extractKeyFromDescriptor,
} from '@leather.io/crypto';
import { SupportedBlockchains } from '@leather.io/models';
import { userAddsKeychains } from '@leather.io/state';
import {
  fingerprintMigration,
  userAddsWallet,
  userRemovesWallet,
  userRenamesWallet,
} from '@leather.io/state/wallet';

import { broadcastWalletListChanged } from '@shared/messages';
import { assumedZeroFingerprint } from '@shared/utils';

import { type AppThunk, persistor } from '..';
import { selectStacksKeychains } from '../keychains/keychain.selectors';
import { readAuthoritativeWalletTransactionState } from '../software-keys/software-key-state';
import { hydrateSlicesFromStorage } from '../utils/storage-sync';
import { withWalletWriteLock } from './wallet-write-lock';
import { selectWalletEntities } from './wallet.selectors';

interface AccountKeychain {
  chain: SupportedBlockchains;
  descriptor: string;
}

function descriptorIdentity(descriptor: string): string {
  const fingerprint = extractFingerprintFromDescriptor(descriptor);
  return descriptor.replace(`${fingerprint}/`, '');
}

interface AddOrMigrateLedgerKeychainsArgs {
  fingerprint: string;
  accountKeychains: AccountKeychain[];
}

async function persistLedgerWalletListChange() {
  await persistor.flush();
  void broadcastWalletListChanged({});
}

export function addOrMigrateLedgerKeychains({
  fingerprint,
  accountKeychains,
}: AddOrMigrateLedgerKeychainsArgs): AppThunk {
  return async (dispatch, getState) => {
    await withWalletWriteLock(async () => {
      const authoritative = await readAuthoritativeWalletTransactionState();
      dispatch(hydrateSlicesFromStorage(authoritative.state));
      const state = { ...getState(), ...authoritative.state };
      const wallets = selectWalletEntities(state);
      const legacyWallet = wallets[assumedZeroFingerprint];

      const isLegacyLedgerMigrationCandidate =
        !!legacyWallet &&
        legacyWallet.type === 'ledger' &&
        fingerprint !== assumedZeroFingerprint &&
        !wallets[fingerprint];

      const legacyIdentities = isLegacyLedgerMigrationCandidate
        ? new Set(
            selectStacksKeychains(state)
              .filter(
                keychain =>
                  extractFingerprintFromDescriptor(keychain.descriptor) === assumedZeroFingerprint
              )
              .map(keychain => descriptorIdentity(keychain.descriptor))
          )
        : null;
      const isSameDevice =
        !!legacyIdentities &&
        accountKeychains.some(keychain => {
          if (keychain.chain !== 'stacks') return false;
          return legacyIdentities.has(descriptorIdentity(keychain.descriptor));
        });

      const isUnmigratedLegacyLedger = isLegacyLedgerMigrationCandidate && isSameDevice;

      if (isUnmigratedLegacyLedger) {
        dispatch(fingerprintMigration(fingerprint));
        dispatch(userRemovesWallet({ fingerprint: assumedZeroFingerprint }));
        dispatch(userAddsWallet({ wallet: { ...legacyWallet, fingerprint }, accountKeychains }));
        await persistLedgerWalletListChange();
        return;
      }

      if (!wallets[fingerprint]) {
        dispatch(
          userAddsWallet({
            wallet: { createdOn: new Date().toISOString(), fingerprint, type: 'ledger' },
            accountKeychains,
          })
        );
        await persistLedgerWalletListChange();
        return;
      }

      if (accountKeychains.length) {
        dispatch(userAddsKeychains({ accountKeychains }));
        await persistLedgerWalletListChange();
      }
    });
  };
}

function rekeyDescriptorToFingerprint(descriptor: string, fingerprint: string): string {
  return createDescriptor(
    createKeyOriginPath(fingerprint, extractDerivationPathFromDescriptor(descriptor)),
    extractKeyFromDescriptor(descriptor)
  );
}

export function migrateLedgerStacksFingerprint({ fingerprint }: { fingerprint: string }): AppThunk {
  return async (dispatch, getState) => {
    await withWalletWriteLock(async () => {
      if (fingerprint === assumedZeroFingerprint) return;

      const authoritative = await readAuthoritativeWalletTransactionState();
      dispatch(hydrateSlicesFromStorage(authoritative.state));
      const state = { ...getState(), ...authoritative.state };
      const wallets = selectWalletEntities(state);
      const legacyWallet = wallets[assumedZeroFingerprint];

      if (!legacyWallet || legacyWallet.type !== 'ledger' || wallets[fingerprint]) return;

      const rekeyedKeychains = selectStacksKeychains(state)
        .filter(
          keychain =>
            extractFingerprintFromDescriptor(keychain.descriptor) === assumedZeroFingerprint
        )
        .map(keychain => ({
          chain: keychain.chain,
          descriptor: rekeyDescriptorToFingerprint(keychain.descriptor, fingerprint),
        }));

      dispatch(fingerprintMigration(fingerprint));
      dispatch(userRemovesWallet({ fingerprint: assumedZeroFingerprint }));
      dispatch(
        userAddsWallet({
          wallet: { ...legacyWallet, fingerprint },
          accountKeychains: rekeyedKeychains,
        })
      );
      await persistLedgerWalletListChange();
    });
  };
}

export function renameWallet({
  fingerprint,
  name,
}: {
  fingerprint: string;
  name: string;
}): AppThunk {
  return async dispatch => {
    await withWalletWriteLock(async () => {
      const authoritative = await readAuthoritativeWalletTransactionState();
      if (!authoritative.state.wallets.entities[fingerprint]) return;
      dispatch(hydrateSlicesFromStorage(authoritative.state));
      dispatch(userRenamesWallet({ fingerprint, name }));
      try {
        await persistor.flush();
      } catch {
        dispatch(hydrateSlicesFromStorage(authoritative.state));
        throw new Error('Unable to rename wallet. Persisted wallet state is invalid');
      }
      const persisted = await readAuthoritativeWalletTransactionState().catch(() => {
        dispatch(hydrateSlicesFromStorage(authoritative.state));
        throw new Error('Unable to rename wallet. Persisted wallet state is invalid');
      });
      if (persisted.state.wallets.entities[fingerprint]?.name === name) return;
      dispatch(hydrateSlicesFromStorage(persisted.state));
      throw new Error('Unable to rename wallet. Persisted wallet state is invalid');
    });
  };
}
