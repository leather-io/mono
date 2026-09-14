import { useAccountRequest } from '@app/services/accounts/use-account-request';
import { toFetchState } from '@app/services/fetch-state';

import {
  useGetBtcBondEnrollmentWindowQuery,
  useGetBtcStakingPositionsQuery,
} from './bitcoin-staking.query';

interface UseCurrentBtcStakingPositionsOptions {
  includeSpent?: boolean;
}

export function useCurrentBtcStakingPositions({
  includeSpent,
}: UseCurrentBtcStakingPositionsOptions = {}) {
  const request = useAccountRequest();
  return toFetchState(useGetBtcStakingPositionsQuery({ ...request, includeSpent }));
}

export function useBtcBondEnrollmentWindow() {
  return toFetchState(useGetBtcBondEnrollmentWindowQuery());
}
