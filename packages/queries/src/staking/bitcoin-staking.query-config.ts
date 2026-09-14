import type { QueryFunctionContext, UseQueryOptions } from '@tanstack/react-query';

import type { BtcBondEnrollmentWindow, BtcStakingPosition } from '@leather.io/models';
import {
  type BtcStakingPositionsRequest,
  type UserSettings,
  getBitcoinStakingService,
} from '@leather.io/services';

import { createServiceQueryKey } from '../shared/query-key.factory';
import { balanceQueryOptions } from '../shared/query-options';

export function createBtcStakingPositionsQueryKey(
  request: BtcStakingPositionsRequest,
  settings: UserSettings
) {
  return createServiceQueryKey(
    'bitcoin-staking-service--get-account-staking-positions',
    [request],
    settings
  );
}
export function createBtcStakingPositionsQueryConfig(
  request: BtcStakingPositionsRequest,
  settings: UserSettings
) {
  return {
    queryKey: createBtcStakingPositionsQueryKey(request, settings),
    queryFn: ({ signal }: QueryFunctionContext) =>
      getBitcoinStakingService().getAccountStakingPositions(request, signal),
    ...balanceQueryOptions,
  } satisfies UseQueryOptions<BtcStakingPosition[], Error>;
}

export function createBtcBondEnrollmentWindowQueryKey(settings: UserSettings) {
  return createServiceQueryKey(
    'bitcoin-staking-service--get-upcoming-bond-enrollment-window',
    [],
    settings
  );
}
export function createBtcBondEnrollmentWindowQueryConfig(settings: UserSettings) {
  return {
    queryKey: createBtcBondEnrollmentWindowQueryKey(settings),
    queryFn: ({ signal }: QueryFunctionContext) =>
      getBitcoinStakingService().getUpcomingBondEnrollmentWindow(signal),
    ...balanceQueryOptions,
  } satisfies UseQueryOptions<BtcBondEnrollmentWindow | null, Error>;
}
