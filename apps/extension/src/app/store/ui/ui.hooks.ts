import { useDispatch, useSelector } from 'react-redux';

import { uiActions } from './ui.actions';
import { selectHasSwitched, selectLoadingState } from './ui.selectors';

export const LoadingKeys = {
  SUBMIT_STACKS_TRANSACTION: 'loading/SUBMIT_STACKS_TRANSACTION',
} as const;
export type LoadingKeys = (typeof LoadingKeys)[keyof typeof LoadingKeys];

export function useLoading(key: string) {
  const loadingState = useSelector(selectLoadingState);
  const dispatch = useDispatch();
  return {
    isLoading: loadingState.value === 'loading',
    setIsLoading(this: void) {
      dispatch(uiActions.setIsLoading(key));
    },
    setIsIdle(this: void) {
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
    setHasSwitched(this: void, value: boolean) {
      dispatch(uiActions.setHasSwitched(value));
    },
  };
}
