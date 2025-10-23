import { keychainAdapter } from '@leather.io/state/keychains';

import { RootState } from '..';

export const keychainSelectors = keychainAdapter.getSelectors(
  (state: RootState) => state.keychains
);
