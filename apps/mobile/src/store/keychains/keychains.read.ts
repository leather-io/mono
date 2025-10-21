import { RootState } from '..';
import { keychainAdapter } from './keychains.write';

export const keychainSelectors = keychainAdapter.getSelectors(
  (state: RootState) => state.keychains
);
