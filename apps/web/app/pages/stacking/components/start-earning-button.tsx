import { ReactNode, useState } from 'react';
import { Link } from 'react-router';

import { useDelegationStatusQuery } from '~/features/stacking/pooled-stacking-info/use-delegation-status-query';
import { useGetPoolAddress } from '~/features/stacking/pooled-stacking-info/use-get-pool-address-query';
import { PoolAddress } from '~/features/stacking/start-pooled-stacking/utils/stacking-pool-types';
import { useLeatherConnect } from '~/store/addresses';
import { useStacksNetwork } from '~/store/stacks-network';

import { Button, ButtonProps, useOnMount } from '@leather.io/ui';

interface StartEarningButtonLayoutProps extends ButtonProps {
  to: string;
  children?: ReactNode;
}
function StartEarningButtonLayout({ children, to, ...buttonProps }: StartEarningButtonLayoutProps) {
  return (
    <Link to={to} style={{ minWidth: 'fit-content' }}>
      <Button width="100" size="xs" minW="fit-content" {...buttonProps}>
        {children || 'Start earning'}
      </Button>
    </Link>
  );
}

interface StartEarningButtonProps {
  slug: string;
  poolAddresses?: PoolAddress;
}
function StartEarningPoolCheck({ slug, poolAddresses }: StartEarningButtonProps) {
  const delegationStatusQuery = useDelegationStatusQuery();
  const { networkName } = useStacksNetwork();
  const getPoolAddressQuery = useGetPoolAddress();

  const isLoading =
    delegationStatusQuery.isLoading ||
    getPoolAddressQuery.isLoading ||
    getPoolAddressQuery.isFetching;

  const toStartEarn = `/stacking/pool/${slug}`;
  const toViewActive = `/stacking/pool/${slug}/active`;

  if (isLoading) {
    return <StartEarningButtonLayout to={toStartEarn} aria-busy />;
  }

  const resolvedAddress = getPoolAddressQuery.data?.poolAddress;

  if (!resolvedAddress) {
    return <StartEarningButtonLayout to={toStartEarn} />;
  }

  if (networkName === 'mocknet' || poolAddresses?.[networkName] !== resolvedAddress) {
    return <StartEarningButtonLayout to={toStartEarn} disabled />;
  }

  return <StartEarningButtonLayout to={toViewActive}>View pooling</StartEarningButtonLayout>;
}

export function StartEarningButton({ slug, poolAddresses }: StartEarningButtonProps) {
  const { whenExtensionState } = useLeatherConnect();

  const [isClient, setIsClient] = useState(false);
  useOnMount(() => setIsClient(true));

  const toStartEarn = `/stacking/pool/${slug}`;

  if (!isClient) {
    return <StartEarningButtonLayout to={toStartEarn} aria-busy />;
  }

  return whenExtensionState({
    connected: <StartEarningPoolCheck slug={slug} poolAddresses={poolAddresses} />,
    detected: <StartEarningButtonLayout to={toStartEarn} disabled />,
    missing: <StartEarningButtonLayout to={toStartEarn} disabled />,
  });
}
