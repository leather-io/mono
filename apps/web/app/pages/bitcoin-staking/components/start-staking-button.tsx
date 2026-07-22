import { ReactNode, useState } from 'react';
import { Link, useNavigate } from 'react-router';

import { bitcoinStakingLabels } from '~/content/bitcoin-staking-content';
import {
  StakingPoolSlug,
  getPoolBySignerManager,
  stakingProviderIdToSlug,
} from '~/data/bitcoin-staking-data';
import { usePox5Position } from '~/features/bitcoin-staking/hooks/use-pox5-position';
import { stakingPaths } from '~/pages/bitcoin-staking/bitcoin-staking.constants';
import { useLeatherConnect } from '~/store/addresses';

import { Button, ButtonProps, useOnMount } from '@leather.io/ui';

interface StartStakingButtonLayoutProps extends ButtonProps {
  children?: ReactNode;
}
function StartStakingButtonLayout({ children, ...buttonProps }: StartStakingButtonLayoutProps) {
  return (
    <Button width="120" size="sm" minW="fit-content" {...buttonProps}>
      {children || bitcoinStakingLabels.startEarning}
    </Button>
  );
}

interface StartStakingButtonProps {
  slug: StakingPoolSlug;
  available: boolean;
}

function StartStakingPositionCheck({ slug, available }: StartStakingButtonProps) {
  const { isLoading, position } = usePox5Position();

  if (isLoading) {
    return (
      <Link to={stakingPaths.pool(slug)}>
        <StartStakingButtonLayout aria-busy />
      </Link>
    );
  }

  if (position.status === 'active') {
    const positionPool = getPoolBySignerManager(position.info.signerManagerContractId);
    const isThisPool = positionPool && stakingProviderIdToSlug(positionPool.providerId) === slug;

    if (isThisPool) {
      return (
        <Link to={stakingPaths.active(slug)}>
          <StartStakingButtonLayout>{bitcoinStakingLabels.viewPosition}</StartStakingButtonLayout>
        </Link>
      );
    }
    return <StartStakingButtonLayout disabled />;
  }

  if (!available) {
    return (
      <StartStakingButtonLayout disabled>
        {bitcoinStakingLabels.comingSoon}
      </StartStakingButtonLayout>
    );
  }

  return (
    <Link to={stakingPaths.pool(slug)}>
      <StartStakingButtonLayout data-testid={`start-staking-button-${slug}`} />
    </Link>
  );
}

export function StartStakingButton({ slug, available }: StartStakingButtonProps) {
  const { whenExtensionState, setShowInstallLeatherDialog, connect } = useLeatherConnect();
  const navigate = useNavigate();

  const [isClient, setIsClient] = useState(false);
  useOnMount(() => setIsClient(true));

  if (!isClient) {
    return <StartStakingButtonLayout aria-busy />;
  }

  if (!available) {
    return (
      <StartStakingButtonLayout disabled>
        {bitcoinStakingLabels.comingSoon}
      </StartStakingButtonLayout>
    );
  }

  return whenExtensionState({
    connected: <StartStakingPositionCheck slug={slug} available={available} />,
    detected: (
      <StartStakingButtonLayout
        onClick={async () => {
          await connect();
          void navigate(stakingPaths.pool(slug));
        }}
      />
    ),
    missing: <StartStakingButtonLayout onClick={() => setShowInstallLeatherDialog(true)} />,
  });
}
