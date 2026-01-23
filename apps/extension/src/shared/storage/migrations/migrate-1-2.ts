import { makeStxDerivationPath } from '@leather.io/stacks';

import { assumedZeroFingerprint } from '@shared/utils';

function processStacksLedgerKeys(stacksKeys: any) {
  const newStacksKeys = stacksKeys.entities.default.publicKeys.reduce(
    (acc: { ids: string[]; entities: Record<string, any> }, item: any, index: number) => {
      const path = makeStxDerivationPath(index);
      const id = path.replace('m', assumedZeroFingerprint);

      acc.ids.push(id);
      acc.entities[id] = {
        ...item,
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

export function migrateToRenameKeysStoreModule(state: any): any {
  const resolvedState = structuredClone(state);

  const newStore = {
    ...resolvedState,
    softwareKeys: resolvedState.keys,
    ledger: {
      ...resolvedState.ledger,
    },
  };

  // add stacks ledger keys to new place
  if (resolvedState.keys?.entities.default?.type === 'ledger') {
    newStore.ledger = {
      ...resolvedState.ledger,
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
