import { ReactNode, useState } from 'react';
import { Link, useNavigate } from 'react-router';

import { useDelegationStatusQuery } from '~/features/stacking/pooled-stacking-info/use-delegation-status-query';
import { useGetPoolAddress } from '~/features/stacking/pooled-stacking-info/use-get-pool-address-query';
import { PoolAddress } from '~/features/stacking/start-pooled-stacking/utils/stacking-pool-types';
import { useLeatherConnect } from '~/store/addresses';
import { useStacksNetwork } from '~/store/stacks-network';

import { Button, ButtonProps, useOnMount } from '@leather.io/ui';

interface StartEarningButtonLayoutProps extends ButtonProps {
  children?: ReactNode;
}
function StartEarningButtonLayout({ children, ...buttonProps }: StartEarningButtonLayoutProps) {
  return (
    <Button width="100" size="xs" minW="fit-content" {...buttonProps}>
      {children || 'Start earning'}
    </Button>
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
    return (
      <Link to={toStartEarn}>
        <StartEarningButtonLayout aria-busy />
      </Link>
    );
  }

  const resolvedAddress = getPoolAddressQuery.data?.poolAddress;

  if (!resolvedAddress) {
    return (
      <Link to={toStartEarn}>
        <StartEarningButtonLayout />
      </Link>
    );
  }

  if (networkName === 'mocknet' || poolAddresses?.[networkName] !== resolvedAddress)
    return <StartEarningButtonLayout disabled />;

  return (
    <Link to={toViewActive}>
      <StartEarningButtonLayout>View pooling</StartEarningButtonLayout>
    </Link>
  );
}

export function StartEarningButton({ slug, poolAddresses }: StartEarningButtonProps) {
  const { whenExtensionState, setShowInstallLeatherDialog, connect } = useLeatherConnect();
  const navigate = useNavigate();

  const [isClient, setIsClient] = useState(false);
  useOnMount(() => setIsClient(true));

  if (!isClient) {
    return <StartEarningButtonLayout aria-busy />;
  }

  return whenExtensionState({
    connected: <StartEarningPoolCheck slug={slug} poolAddresses={poolAddresses} />,
    detected: (
      <StartEarningButtonLayout
        onClick={async () => {
          await connect();
          void navigate(`/stacking/pool/${slug}`);
        }}
      />
    ),
    missing: <StartEarningButtonLayout onClick={() => setShowInstallLeatherDialog(true)} />,
  });
}
