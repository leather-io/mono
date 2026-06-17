import { produce } from 'immer';

import { countWalletAccounts, isValidAccountIndex, makeAccountIdentifer } from '@leather.io/crypto';

import { logger } from '@shared/logger';

function repairSoftwareHighestAccountIndex(draftState: any, fingerprint: string): void {
  const existing = draftState?.chains?.stx?.[fingerprint];
  const activeAccount = draftState?.active?.account;
  const activeIndex =
    activeAccount?.fingerprint === fingerprint ? activeAccount?.accountIndex : undefined;

  const priorAccountEntities = draftState?.accounts?.entities ?? {};
  const fingerprintPrefix = `${fingerprint}/`;
  const priorIndices = Object.keys(priorAccountEntities)
    .filter(id => id.startsWith(fingerprintPrefix))
    .map(id => Number(id.slice(fingerprintPrefix.length)));

  const repairedHighest = Math.max(
    0,
    ...[
      existing?.highestAccountIndex,
      existing?.currentAccountIndex,
      activeIndex,
      ...priorIndices,
    ].filter(isValidAccountIndex)
  );

  if (!draftState.chains) draftState.chains = {};
  if (!draftState.chains.stx) draftState.chains.stx = {};
  draftState.chains.stx[fingerprint] = {
    currentAccountStacksDescriptor: existing?.currentAccountStacksDescriptor ?? '',
    highestAccountIndex: repairedHighest,
  };
}

// Introduces the `accounts` entity slice, materializing an entity per derived
// account so name/hidden/icon metadata has a home keyed by
// `fingerprint/accountIndex`, with a lifecycle tied to the owning wallet.
export function migrateToAccountsSlice(state: any): any {
  logger.info('Beginning accounts slice migration');

  return produce(state, (draftState: any) => {
    const entities: Record<string, { id: string; name?: string; status?: 'active' | 'hidden' }> =
      {};
    const ids: string[] = [];

    const priorAccountEntities = draftState?.accounts?.entities ?? {};

    const keychainEntities = draftState?.keychains?.entities ?? {};
    const keychainIds: string[] = Array.isArray(draftState?.keychains?.ids)
      ? draftState.keychains.ids
      : [];
    const keychains = keychainIds
      .map(id => keychainEntities[id])
      .filter(
        (keychain): keychain is { descriptor: string; chain: 'bitcoin' | 'stacks' } =>
          typeof keychain?.descriptor === 'string' &&
          (keychain.chain === 'bitcoin' || keychain.chain === 'stacks')
      );

    const walletEntities = draftState?.wallets?.entities ?? {};
    const walletIds: string[] = Array.isArray(draftState?.wallets?.ids)
      ? draftState.wallets.ids
      : [];
    for (const wallet of walletIds.map(id => walletEntities[id]).filter(Boolean)) {
      if (!wallet?.fingerprint) continue;

      if (wallet.type === 'software') {
        repairSoftwareHighestAccountIndex(draftState, wallet.fingerprint);
      }

      const accountCount = countWalletAccounts({
        walletType: wallet.type,
        fingerprint: wallet.fingerprint,
        highestAccountIndex: draftState?.chains?.stx?.[wallet.fingerprint]?.highestAccountIndex,
        keychains,
      });

      for (let accountIndex = 0; accountIndex < accountCount; accountIndex++) {
        const id = makeAccountIdentifer(wallet.fingerprint, accountIndex);
        const prior = priorAccountEntities[id];
        entities[id] = {
          id,
          ...(prior?.name ? { name: prior.name } : {}),
          ...(prior?.status === 'active' || prior?.status === 'hidden'
            ? { status: prior.status }
            : {}),
        };
        ids.push(id);
      }
    }

    draftState.accounts = { ids, entities };

    const activeAccount = draftState?.active?.account;
    if (activeAccount?.fingerprint) {
      const activeId = makeAccountIdentifer(activeAccount.fingerprint, activeAccount.accountIndex);
      if (!entities[activeId]) {
        const sameWalletId = ids.find(id => id.startsWith(`${activeAccount.fingerprint}/`));
        if (sameWalletId) {
          draftState.active.account = { fingerprint: activeAccount.fingerprint, accountIndex: 0 };
        } else if (ids.length > 0) {
          const fallbackId = ids[0];
          const separatorIndex = fallbackId.lastIndexOf('/');
          draftState.active.account = {
            fingerprint: fallbackId.slice(0, separatorIndex),
            accountIndex: Number(fallbackId.slice(separatorIndex + 1)),
          };
        }
      }
    }
  });
}
