import { useDispatch, useSelector } from 'react-redux';

import { uiActions } from './ui.actions';
import { selectHasSwitched, selectLoadingState } from './ui.selectors';

export enum LoadingKeys {
  SUBMIT_STACKS_TRANSACTION = 'loading/SUBMIT_STACKS_TRANSACTION',
  SUBMIT_SWAP_TRANSACTION = 'loading/SUBMIT_SWAP_TRANSACTION',
}

export function useLoading(key: string) {
  const loadingState = useSelector(selectLoadingState);
  const dispatch = useDispatch();
  return {
    isLoading: loadingState.value === 'loading',
    setIsLoading() {
      dispatch(uiActions.setIsLoading(key));
    },
    setIsIdle() {
      dispatch(uiActions.setIsIdle());
    },
  };
}

// Tracks that the user switched accounts within an open popup. When set, the
// policy and software-key selectors ignore the account pinned by URL search params
export function useHasSwitchedAccounts() {
  const hasSwitched = useSelector(selectHasSwitched);
  const dispatch = useDispatch();
  return {
    hasSwitched,
    setHasSwitched(value: boolean) {
      dispatch(uiActions.setHasSwitched(value));
    },
  };
}
