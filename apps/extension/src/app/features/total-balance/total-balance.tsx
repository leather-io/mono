import { Suspense } from 'react';

import { Box, HStack } from 'leather-styles/jsx';

import { BtcBalance } from '@app/components/balance/btc-balance';
import { StxBalance } from '@app/components/balance/stx-balance';
import { LoadingRectangle } from '@app/components/loading-rectangle';
import { useHasCurrentBitcoinAccount } from '@app/store/accounts/blockchain/bitcoin/bitcoin.hooks';
import { useCurrentStacksAccount } from '@app/store/accounts/blockchain/stacks/stacks-account.hooks';

interface TotalBalanceLayoutProps {
  children: React.ReactNode;
}
function TotalBalanceLayout({ children }: TotalBalanceLayoutProps) {
  return (
    <Box p="space.04" width="100%">
      {children}
    </Box>
  );
}

interface TotalBalanceProps {
  displayAddresssBalanceOf?: 'all' | 'stx';
}

/**
 * #4370 This code has been ported from legacy PopupHeader to load balances
 */
function TotalBalanceSuspense({ displayAddresssBalanceOf }: TotalBalanceProps) {
  const account = useCurrentStacksAccount();
  const hasBitcoinKeys = useHasCurrentBitcoinAccount();
  return (
    <TotalBalanceLayout>
      <HStack alignItems="center" justifyContent="right">
        {displayAddresssBalanceOf === 'stx' && <StxBalance address={account?.address || ''} />}
        {hasBitcoinKeys && displayAddresssBalanceOf === 'all' && <BtcBalance />}
      </HStack>
    </TotalBalanceLayout>
  );
}

function TotalBalanceFallback() {
  return (
    <TotalBalanceLayout>
      <LoadingRectangle width="72px" height="14px" />
    </TotalBalanceLayout>
  );
}

export function TotalBalance(props: TotalBalanceProps) {
  return (
    <Suspense fallback={<TotalBalanceFallback />}>
      <TotalBalanceSuspense {...props} />
    </Suspense>
  );
}
