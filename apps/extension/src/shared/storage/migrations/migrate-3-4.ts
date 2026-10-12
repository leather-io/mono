import { produce } from 'immer';

import { countWalletAccounts, isValidAccountIndex, makeAccountIdentifer } from '@leather.io/crypto';
import { isNumber, isString } from '@leather.io/utils';

import { logger } from '@shared/logger';
import { isRecord } from '@shared/utils/is-record';

import { type LegacyRecord, getRecordAtPath, isUnknownArray } from './legacy-state';

interface LegacyKeychain {
  descriptor: string;
  chain: 'bitcoin' | 'stacks';
}

function isLegacyKeychain(keychain: unknown): keychain is LegacyKeychain {
  return (
    isRecord(keychain) &&
    typeof keychain.descriptor === 'string' &&
    (keychain.chain === 'bitcoin' || keychain.chain === 'stacks')
  );
}

function toAccountIndex(value: unknown) {
  return isNumber(value) ? value : undefined;
}

function getStringIds(ids: unknown) {
  return isUnknownArray(ids) ? ids.filter(isString) : [];
}

function repairSoftwareHighestAccountIndex(draftState: LegacyRecord, fingerprint: string): void {
  const existing = getRecordAtPath(draftState, 'chains', 'stx', fingerprint);
  const activeAccount = getRecordAtPath(draftState, 'active', 'account');
  const activeIndex =
    activeAccount?.fingerprint === fingerprint ? activeAccount.accountIndex : undefined;

  const priorAccountEntities = getRecordAtPath(draftState, 'accounts', 'entities') ?? {};
  const fingerprintPrefix = `${fingerprint}/`;
  const priorIndices = Object.keys(priorAccountEntities)
    .filter(id => id.startsWith(fingerprintPrefix))
    .map(id => Number(id.slice(fingerprintPrefix.length)));

  const repairedHighest = Math.max(
    0,
    ...[
      toAccountIndex(existing?.highestAccountIndex),
      toAccountIndex(existing?.currentAccountIndex),
      toAccountIndex(activeIndex),
      ...priorIndices,
    ].filter(isValidAccountIndex)
  );

  if (!draftState.chains) draftState.chains = {};
  const chains = getRecordAtPath(draftState, 'chains');
  if (chains && !chains.stx) chains.stx = {};
  const stxChains = getRecordAtPath(chains, 'stx');
  if (stxChains) {
    stxChains[fingerprint] = {
      currentAccountStacksDescriptor: existing?.currentAccountStacksDescriptor ?? '',
      highestAccountIndex: repairedHighest,
    };
  }
}

// Introduces the `accounts` entity slice, materializing an entity per derived
// account so name/hidden/icon metadata has a home keyed by
// `fingerprint/accountIndex`, with a lifecycle tied to the owning wallet.
export function migrateToAccountsSlice(state: unknown) {
  logger.info('Beginning accounts slice migration');

  return produce(state, draftState => {
    if (!isRecord(draftState)) return;

    const entities: Record<string, { id: string; name?: unknown; status?: 'active' | 'hidden' }> =
      {};
    const ids: string[] = [];

    const priorAccountEntities = getRecordAtPath(draftState, 'accounts', 'entities') ?? {};

    const keychainEntities = getRecordAtPath(draftState, 'keychains', 'entities') ?? {};
    const keychainIds = getStringIds(getRecordAtPath(draftState, 'keychains')?.ids);
    const keychains = keychainIds.map(id => keychainEntities[id]).filter(isLegacyKeychain);

    const walletEntities = getRecordAtPath(draftState, 'wallets', 'entities') ?? {};
    const walletIds = getStringIds(getRecordAtPath(draftState, 'wallets')?.ids);
    for (const wallet of walletIds.map(id => getRecordAtPath(walletEntities, id))) {
      if (!wallet?.fingerprint || !isString(wallet.fingerprint)) continue;

      if (wallet.type === 'software') {
        repairSoftwareHighestAccountIndex(draftState, wallet.fingerprint);
      }

      const accountCount = countWalletAccounts({
        walletType: isString(wallet.type) ? wallet.type : '',
        fingerprint: wallet.fingerprint,
        highestAccountIndex: toAccountIndex(
          getRecordAtPath(draftState, 'chains', 'stx', wallet.fingerprint)?.highestAccountIndex
        ),
        keychains,
      });

      for (let accountIndex = 0; accountIndex < accountCount; accountIndex++) {
        const id = makeAccountIdentifer(wallet.fingerprint, accountIndex);
        const prior = getRecordAtPath(priorAccountEntities, id);
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

    const active = getRecordAtPath(draftState, 'active');
    const activeAccount = getRecordAtPath(active, 'account');
    const activeFingerprint = activeAccount?.fingerprint;
    if (active && activeAccount && isString(activeFingerprint) && activeFingerprint) {
      const activeAccountIndex = activeAccount.accountIndex;
      const activeId = isNumber(activeAccountIndex)
        ? makeAccountIdentifer(activeFingerprint, activeAccountIndex)
        : undefined;
      if (!activeId || !entities[activeId]) {
        const sameWalletId = ids.find(id => id.startsWith(`${activeFingerprint}/`));
        if (sameWalletId) {
          active.account = { fingerprint: activeFingerprint, accountIndex: 0 };
        } else if (ids.length > 0) {
          const fallbackId = ids[0];
          const separatorIndex = fallbackId.lastIndexOf('/');
          active.account = {
            fingerprint: fallbackId.slice(0, separatorIndex),
            accountIndex: Number(fallbackId.slice(separatorIndex + 1)),
          };
        }
      }
    }
  });
}
