import { type RootState } from '@app/store/store';

export function selectStacksChain(state: RootState) {
  return state.chains.stx;
}
