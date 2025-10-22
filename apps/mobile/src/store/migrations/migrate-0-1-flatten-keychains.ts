import { EntityState } from '@reduxjs/toolkit';
import { PersistedState } from 'redux-persist';

// Requied type to satisfy redux-persist
type Original = {
  keychains: {
    bitcoin: EntityState<any, 'descriptor'>;
    stacks: EntityState<any, 'descriptor'>;
  };
} & PersistedState;

export function migrateFlattenKeychains(state: PersistedState) {
  const { keychains, ...rest } = state as Original;

  const flattenedKeychainState = {
    ids: [...keychains.bitcoin.ids, ...keychains.stacks.ids],
    entities: Object.fromEntries([
      ...Object.entries(keychains.bitcoin.entities).map(([id, entity]) => [
        id,
        { ...entity, chain: 'bitcoin' },
      ]),
      ...Object.entries(keychains.stacks.entities).map(([id, entity]) => [
        id,
        { ...entity, chain: 'stacks' },
      ]),
    ]),
  };

  return { ...rest, keychains: flattenedKeychainState };
}
