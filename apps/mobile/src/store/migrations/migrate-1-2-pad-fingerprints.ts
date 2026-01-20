import { EntityState } from '@reduxjs/toolkit';
import { PersistedState } from 'redux-persist';

import { safelyReadPaddedFingerprint } from '@leather.io/crypto';

interface KeychainEntity {
  descriptor: string;
  chain: 'bitcoin' | 'stacks';
}

interface AccountEntity {
  id: string;
  [key: string]: unknown;
}

interface WalletEntity {
  fingerprint: string;
  [key: string]: unknown;
}

type State = {
  keychains: EntityState<KeychainEntity, 'descriptor'>;
  accounts: EntityState<AccountEntity, 'id'>;
  wallets: EntityState<WalletEntity, 'fingerprint'>;
} & PersistedState;

function updateDescriptorFingerprint(descriptor: string): string {
  const bracketEndIndex = descriptor.indexOf(']');
  if (bracketEndIndex === -1) return descriptor;

  const keyOriginPath = descriptor.substring(1, bracketEndIndex);
  const parts = keyOriginPath.split('/');
  const fingerprint = parts[0];
  if (!fingerprint) return descriptor;

  const paddedFingerprint = safelyReadPaddedFingerprint(fingerprint);
  const pathSegments = parts.slice(1);
  const newKeyOriginPath = [paddedFingerprint, ...pathSegments].join('/');
  return `[${newKeyOriginPath}]${descriptor.substring(bracketEndIndex + 1)}`;
}

function updateAccountId(accountId: string): string {
  const parts = accountId.split('/');
  const fingerprint = parts[0];
  const accountIndex = parts[1];
  if (!fingerprint || !accountIndex) return accountId;

  const paddedFingerprint = safelyReadPaddedFingerprint(fingerprint);
  return `${paddedFingerprint}/${accountIndex}`;
}

export function migratePadFingerprints(state: PersistedState) {
  const typedState = state as State;

  const updatedKeychains = {
    ...typedState.keychains,
    entities: Object.fromEntries(
      Object.entries(typedState.keychains.entities).map(([id, entity]) => {
        if (!entity) return [id, entity];
        return [
          id,
          {
            ...entity,
            descriptor: updateDescriptorFingerprint(entity.descriptor),
          },
        ];
      })
    ),
  };

  const fingerprintMap = new Map<string, string>();
  Object.values(typedState.wallets.entities).forEach(wallet => {
    if (!wallet) return;
    const paddedFingerprint = safelyReadPaddedFingerprint(wallet.fingerprint);
    if (paddedFingerprint !== wallet.fingerprint) {
      fingerprintMap.set(wallet.fingerprint, paddedFingerprint);
    }
  });

  const updatedWallets = {
    ids: typedState.wallets.ids.map(id =>
      typeof id === 'string' ? safelyReadPaddedFingerprint(id) : id
    ),
    entities: Object.fromEntries(
      Object.entries(typedState.wallets.entities).map(([id, entity]) => {
        if (!entity) return [id, entity];
        const paddedFingerprint = safelyReadPaddedFingerprint(entity.fingerprint);
        return [
          paddedFingerprint,
          {
            ...entity,
            fingerprint: paddedFingerprint,
          },
        ];
      })
    ),
  };

  const updatedAccounts = {
    ...typedState.accounts,
    ids: typedState.accounts.ids.map(id =>
      typeof id === 'string' ? updateAccountId(id) : id
    ),
    entities: Object.fromEntries(
      Object.entries(typedState.accounts.entities).map(([id, entity]) => {
        if (!entity) return [id, entity];
        const newId = updateAccountId(entity.id);
        return [
          newId,
          {
            ...entity,
            id: newId,
          },
        ];
      })
    ),
  };

  return {
    ...state,
    keychains: updatedKeychains,
    wallets: updatedWallets,
    accounts: updatedAccounts,
  };
}
