import {
  createDescriptor,
  createKeyOriginPath,
  extractDerivationPathFromDescriptor,
  extractFingerprintFromDescriptor,
  extractKeyFromDescriptor,
} from '@leather.io/crypto';
import { SupportedBlockchains } from '@leather.io/models';
import { userAddsKeychains } from '@leather.io/state';
import { fingerprintMigration, userAddsWallet, userRemovesWallet } from '@leather.io/state/wallet';

import { assumedZeroFingerprint } from '@shared/utils';

import type { AppThunk } from '..';
import { selectStacksKeychains } from '../keychains/keychain.selectors';
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

export function addOrMigrateLedgerKeychains({
  fingerprint,
  accountKeychains,
}: AddOrMigrateLedgerKeychainsArgs): AppThunk {
  return (dispatch, getState) => {
    const state = getState();
    const wallets = selectWalletEntities(state);
    const legacyWallet = wallets[assumedZeroFingerprint];

    const legacyIdentities = new Set(
      selectStacksKeychains(state)
        .filter(
          keychain =>
            extractFingerprintFromDescriptor(keychain.descriptor) === assumedZeroFingerprint
        )
        .map(keychain => descriptorIdentity(keychain.descriptor))
    );
    const isSameDevice = accountKeychains.some(keychain =>
      legacyIdentities.has(descriptorIdentity(keychain.descriptor))
    );

    const isUnmigratedLegacyLedger =
      !!legacyWallet &&
      legacyWallet.type === 'ledger' &&
      fingerprint !== assumedZeroFingerprint &&
      !wallets[fingerprint] &&
      isSameDevice;

    if (isUnmigratedLegacyLedger) {
      dispatch(fingerprintMigration(fingerprint));
      dispatch(userRemovesWallet({ fingerprint: assumedZeroFingerprint }));
      dispatch(userAddsWallet({ wallet: { ...legacyWallet, fingerprint }, accountKeychains }));
      return;
    }

    if (!wallets[fingerprint]) {
      dispatch(
        userAddsWallet({
          wallet: { createdOn: new Date().toISOString(), fingerprint, type: 'ledger' },
          accountKeychains,
        })
      );
      return;
    }

    if (accountKeychains.length) {
      dispatch(userAddsKeychains({ accountKeychains }));
    }
  };
}

function rekeyDescriptorToFingerprint(descriptor: string, fingerprint: string): string {
  return createDescriptor(
    createKeyOriginPath(fingerprint, extractDerivationPathFromDescriptor(descriptor)),
    extractKeyFromDescriptor(descriptor)
  );
}

export function migrateLedgerStacksFingerprint({ fingerprint }: { fingerprint: string }): AppThunk {
  return (dispatch, getState) => {
    if (fingerprint === assumedZeroFingerprint) return;

    const state = getState();
    const wallets = selectWalletEntities(state);
    const legacyWallet = wallets[assumedZeroFingerprint];

    if (!legacyWallet || legacyWallet.type !== 'ledger' || wallets[fingerprint]) return;

    const rekeyedKeychains = selectStacksKeychains(state)
      .filter(
        keychain => extractFingerprintFromDescriptor(keychain.descriptor) === assumedZeroFingerprint
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
  };
}
