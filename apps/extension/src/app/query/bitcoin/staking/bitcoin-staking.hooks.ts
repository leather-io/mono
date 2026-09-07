import { useAccountRequest } from '@app/services/accounts/use-account-request';
import { toFetchState } from '@app/services/fetch-state';

import {
  useGetBtcBondEnrollmentWindowQuery,
  useGetBtcStakingPositionsQuery,
} from './bitcoin-staking.query';

export function useCurrentBtcStakingPositions() {
  const request = useAccountRequest();
  return toFetchState(useGetBtcStakingPositionsQuery(request));
}

export function useBtcBondEnrollmentWindow() {
  return toFetchState(useGetBtcBondEnrollmentWindowQuery());
}
