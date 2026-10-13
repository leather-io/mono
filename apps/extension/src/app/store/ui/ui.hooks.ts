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
  function setIsLoading() {
    dispatch(uiActions.setIsLoading(key));
  }

  function setIsIdle() {
    dispatch(uiActions.setIsIdle());
  }

  return {
    isLoading: loadingState.value === 'loading',
    setIsLoading,
    setIsIdle,
  };
}

// Tracks that the user switched accounts within an open popup. When set, the
// policy and software-key selectors ignore the account pinned by URL search params
export function useHasSwitchedAccounts() {
  const hasSwitched = useSelector(selectHasSwitched);
  const dispatch = useDispatch();
  function setHasSwitched(value: boolean) {
    dispatch(uiActions.setHasSwitched(value));
  }

  return {
    hasSwitched,
    setHasSwitched,
  };
}
