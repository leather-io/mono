import {
  useGetAccountExtendedBalancesQuery,
  useGetStatusQuery,
} from '~/features/stacking/hooks/stacking.query';

import { usePox5StakerInfoQuery } from '../queries/pox5-stacking.query';
import { getPox5NeedsRestake } from '../utils/pox5-transition';

// Only usable under StackingClientProvider with a connected wallet (the pox-4
// status queries throw otherwise); parents must gate on connection state.
// Returns null until every input has resolved.
export function usePox5NeedsRestake(): boolean | null {
  const statusQuery = useGetStatusQuery();
  const balancesQuery = useGetAccountExtendedBalancesQuery();
  const stakerInfoQuery = usePox5StakerInfoQuery();

  if (statusQuery.data === undefined || balancesQuery.data === undefined) return null;
  if (stakerInfoQuery.data === undefined) return null;

  return getPox5NeedsRestake({
    pox4Stacked: statusQuery.data.stacked,
    lockedMicroStx: BigInt(balancesQuery.data.stx.locked),
    pox5StakerInfo: stakerInfoQuery.data,
  });
}
