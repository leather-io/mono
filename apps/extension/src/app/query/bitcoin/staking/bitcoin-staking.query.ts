import { useQuery } from '@tanstack/react-query';

import {
  createBtcBondEnrollmentWindowQueryConfig,
  createBtcStakingPositionsQueryConfig,
} from '@leather.io/queries';
import type { BtcStakingPositionsRequest } from '@leather.io/services';

import { useUserSettings } from '@app/hooks/use-user-settings';
import { balanceQueryOptionsWithRefetch } from '@app/query/common/balance-query-options';

export function useGetBtcStakingPositionsQuery(request: BtcStakingPositionsRequest) {
  const settings = useUserSettings();
  return useQuery({
    ...createBtcStakingPositionsQueryConfig(request, settings),
    ...balanceQueryOptionsWithRefetch,
  });
}

export function useGetBtcBondEnrollmentWindowQuery() {
  const settings = useUserSettings();
  return useQuery({
    ...createBtcBondEnrollmentWindowQueryConfig(settings),
    ...balanceQueryOptionsWithRefetch,
  });
}
