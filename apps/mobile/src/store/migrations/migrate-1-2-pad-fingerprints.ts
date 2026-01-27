import { EntityState } from '@reduxjs/toolkit';
import { PersistedState } from 'redux-persist';

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

interface AppsEntity {
  origin: string;
  accountId?: string;
  [key: string]: unknown;
}

type State = {
  keychains: EntityState<KeychainEntity, string>;
  accounts: EntityState<AccountEntity, string>;
  wallets: EntityState<WalletEntity, string>;
  apps: EntityState<AppsEntity, string>;
  settings: {
    currentAccount?: null | {
      id: string;
      fingerprint: string;
      [key: string]: unknown;
    };
    [key: string]: unknown;
  };
} & PersistedState;

function padFingerprint(fingerprint: string): string {
  return fingerprint.padStart(8, '0');
}

function padFingerprintInDescriptor(descriptor: string): string {
  const bracketEnd = descriptor.indexOf('/');
  if (bracketEnd === -1) return descriptor;
  const fingerprint = descriptor.slice(1, bracketEnd);
  if (!fingerprint) return descriptor;

  return '[' + padFingerprint(fingerprint) + descriptor.slice(bracketEnd);
}

function padKeyOrigin(origin: string): string {
  const slashIndex = origin.indexOf('/');
  if (slashIndex === -1) return origin;
  const fingerprint = origin.slice(0, slashIndex);
  return padFingerprint(fingerprint) + origin.slice(slashIndex);
}

function padAccountId(accountId: string): string {
  return padKeyOrigin(accountId);
}

export function migratePadFingerprints(state: PersistedState) {
  const typedState = state as State;

  const updatedKeychains = {
    ids: typedState.keychains.ids.map(id => padKeyOrigin(id)),
    entities: Object.fromEntries(
      Object.entries(typedState.keychains.entities).map(([id, entity]) => {
        if (!entity) return [id, entity];
        return [
          padKeyOrigin(id),
          {
            ...entity,
            descriptor: padFingerprintInDescriptor(entity.descriptor),
          },
        ];
      })
    ),
  };

  const updatedWallets = {
    ids: typedState.wallets.ids.map(id => padFingerprint(id)),
    entities: Object.fromEntries(
      Object.entries(typedState.wallets.entities).map(([id, entity]) => {
        if (!entity) return [id, entity];
        return [
          padFingerprint(id),
          {
            ...entity,
            fingerprint: padFingerprint(entity.fingerprint),
          },
        ];
      })
    ),
  };

  const updatedAccounts = {
    ids: typedState.accounts.ids.map(id => padAccountId(id)),
    entities: Object.fromEntries(
      Object.entries(typedState.accounts.entities).map(([id, entity]) => {
        if (!entity) return [id, entity];
        return [
          padAccountId(id),
          {
            ...entity,
            id: padAccountId(entity.id),
          },
        ];
      })
    ),
  };

  const updatedApps = {
    ...typedState.apps,
    entities: Object.fromEntries(
      Object.entries(typedState.apps.entities).map(([id, entity]) => {
        if (!entity) return [id, entity];
        if (entity.accountId) {
          return [
            id,
            {
              ...entity,

              accountId: padAccountId(entity.accountId),
            },
          ];
        }
        return [id, entity];
      })
    ),
  };

  const updatedSettings = {
    ...typedState.settings,
    currentAccount: typedState.settings.currentAccount
      ? {
          ...typedState.settings.currentAccount,
          fingerprint: padFingerprint(typedState.settings.currentAccount.fingerprint),
        }
      : typedState.settings.currentAccount,
  };

  return {
    ...state,
    keychains: updatedKeychains,
    wallets: updatedWallets,
    accounts: updatedAccounts,
    apps: updatedApps,
    settings: updatedSettings,
  };
}
