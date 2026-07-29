import { Outlet } from 'react-router';

import { Pox5TxTrackerProvider } from '~/features/bitcoin-staking/components/pox5-tx-tracker-provider';

export default function BitcoinStakingLayout() {
  return (
    <Pox5TxTrackerProvider>
      <Outlet />
    </Pox5TxTrackerProvider>
  );
}
