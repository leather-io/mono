import { RootState } from '@app/store';

export function selectStacksChain(state: RootState) {
  return state.chains.stx;
}
