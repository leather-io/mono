import { Outlet, data } from 'react-router';

import { bitcoinStakingEnabled } from './bitcoin-staking.constants';

// Gate the entire /staking/* area: when the feature is disabled (production),
// every route under this layout 404s, even on direct URL entry.
export function loader() {
  if (!bitcoinStakingEnabled) throw data('Not found', { status: 404 });
  return null;
}

export default function BitcoinStakingLayout() {
  return <Outlet />;
}
