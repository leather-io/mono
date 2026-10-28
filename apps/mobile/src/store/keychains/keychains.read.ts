import { keychainAdapter } from '@leather.io/state/keychains';

import { type RootState } from '../store';

export const keychainSelectors = keychainAdapter.getSelectors(
  (state: RootState) => state.keychains
);
