import { type EntityState } from '@reduxjs/toolkit';
import { type PersistedState } from 'redux-persist';

interface LegacyKeychainEntity {
  descriptor: string;
  [key: string]: unknown;
}

interface FlattenedKeychainEntity extends LegacyKeychainEntity {
  chain: 'bitcoin' | 'stacks';
}

// Requied type to satisfy redux-persist
type Original = {
  keychains: {
    bitcoin: EntityState<LegacyKeychainEntity, string>;
    stacks: EntityState<LegacyKeychainEntity, string>;
  };
} & PersistedState;

export function migrateFlattenKeychains(state: PersistedState) {
  const { keychains, ...rest } = state as Original;

  const flattenedKeychainState = {
    ids: [...keychains.bitcoin.ids, ...keychains.stacks.ids],
    entities: Object.fromEntries<FlattenedKeychainEntity>([
      ...Object.entries(keychains.bitcoin.entities).map(
        ([id, entity]) => [id, { ...entity, chain: 'bitcoin' }] as const
      ),
      ...Object.entries(keychains.stacks.entities).map(
        ([id, entity]) => [id, { ...entity, chain: 'stacks' }] as const
      ),
    ]),
  };

  return { ...rest, keychains: flattenedKeychainState };
}
