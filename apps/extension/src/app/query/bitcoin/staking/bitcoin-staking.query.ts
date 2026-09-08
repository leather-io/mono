import { useQuery } from '@tanstack/react-query';

import {
  createBtcBondEnrollmentWindowQueryConfig,
  createBtcStakingPositionsQueryConfig,
} from '@leather.io/queries';
import type { BtcStakingPositionsRequest } from '@leather.io/services';

import { filterFixturePositions, getBondFixture } from '@app/features/bonds/bond-fixtures';
import { isBondMockAllowed, useBondScenario } from '@app/features/bonds/bond-scenarios';
import { useUserSettings } from '@app/hooks/use-user-settings';
import { balanceQueryOptionsWithRefetch } from '@app/query/common/balance-query-options';

export function useGetBtcStakingPositionsQuery(request: BtcStakingPositionsRequest) {
  const settings = useUserSettings();
  const scenario = useBondScenario();
  const config = createBtcStakingPositionsQueryConfig(request, settings);

  // Non-production builds can replace the staking index with a named scenario
  const mock =
    isBondMockAllowed && scenario !== 'none'
      ? {
          queryKey: [...config.queryKey, 'mock', scenario, request.includeSpent ?? false],
          queryFn: () =>
            Promise.resolve(filterFixturePositions(getBondFixture(scenario), request.includeSpent)),
        }
      : {};

  return useQuery({
    ...config,
    ...balanceQueryOptionsWithRefetch,
    ...mock,
  });
}

export function useGetBtcBondEnrollmentWindowQuery() {
  const settings = useUserSettings();
  const scenario = useBondScenario();
  const config = createBtcBondEnrollmentWindowQueryConfig(settings);

  const mock =
    isBondMockAllowed && scenario !== 'none'
      ? {
          queryKey: [...config.queryKey, 'mock', scenario],
          queryFn: () => Promise.resolve(getBondFixture(scenario).enrollmentWindow),
        }
      : {};

  return useQuery({
    ...config,
    ...balanceQueryOptionsWithRefetch,
    ...mock,
  });
}
