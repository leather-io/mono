import { makeStxDerivationPath } from '@leather.io/stacks';

import { assumedZeroFingerprint } from '@shared/utils';
import { isRecord } from '@shared/utils/is-record';

import { type LegacyRecord, getRecordAtPath, isUnknownArray } from './legacy-state';

interface LegacyLedgerKeys {
  ids: string[];
  entities: LegacyRecord;
}

interface RenamedKeysStore {
  [key: string]: unknown;
  ledger: LegacyRecord;
}

function processStacksLedgerKeys(stacksKeys: unknown) {
  const publicKeys = getRecordAtPath(stacksKeys, 'entities', 'default')?.publicKeys;
  const newStacksKeys = (isUnknownArray(publicKeys) ? publicKeys : []).reduce<LegacyLedgerKeys>(
    (acc, item, index) => {
      const path = makeStxDerivationPath(index);
      const id = path.replace('m', assumedZeroFingerprint);

      acc.ids.push(id);
      acc.entities[id] = {
        ...(isRecord(item) ? item : {}),
        path,
        id,
        walletId: 'default',
        targetId: '',
      };

      return acc;
    },
    { ids: [], entities: {} }
  );

  return newStacksKeys;
}

export function migrateToRenameKeysStoreModule(state: unknown): RenamedKeysStore {
  const clonedState: unknown = structuredClone(state);
  const resolvedState = isRecord(clonedState) ? clonedState : {};

  const newStore: RenamedKeysStore = {
    ...resolvedState,
    softwareKeys: resolvedState.keys,
    ledger: {
      ...getRecordAtPath(resolvedState, 'ledger'),
    },
  };

  // add stacks ledger keys to new place
  if (getRecordAtPath(resolvedState, 'keys', 'entities', 'default')?.type === 'ledger') {
    newStore.ledger = {
      ...getRecordAtPath(resolvedState, 'ledger'),
      stacks: processStacksLedgerKeys(resolvedState.keys),
    };
  }

  // add default bitcoin ledger state
  if (!newStore.ledger.bitcoin) {
    newStore.ledger.bitcoin = {
      ids: [],
      entities: {},
    };
  }

  // add default stacks ledger state
  if (!newStore.ledger.stacks) {
    newStore.ledger.stacks = {
      ids: [],
      entities: {},
    };
  }

  // remove old keys store
  Reflect.deleteProperty(newStore, 'keys');

  return newStore;
}
