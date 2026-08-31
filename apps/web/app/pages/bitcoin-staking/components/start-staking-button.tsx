import { ReactNode, useState } from 'react';
import { useNavigate } from 'react-router';

import { bitcoinStakingLabels } from '~/content/bitcoin-staking-content';
import { StakingPoolSlug, stakingProviderIdToSlug } from '~/data/bitcoin-staking-data';
import { usePox5Position } from '~/features/bitcoin-staking/hooks/use-pox5-position';
import { byosmPaths, stakingPaths } from '~/pages/bitcoin-staking/bitcoin-staking.constants';
import { useLeatherConnect } from '~/store/addresses';

import { Button, ButtonProps, useOnMount } from '@leather.io/ui';

import { useStakingPoolLink } from './use-staking-pool-link';

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
}

function StartStakingPositionCheck({ slug }: StartStakingButtonProps) {
  const navigate = useNavigate();
  const { position } = usePox5Position();
  const { isLoading, to } = useStakingPoolLink(slug);

  if (!to) {
    if (position.status === 'active') {
      const switchTo = position.pool
        ? stakingPaths.updateWithTarget(stakingProviderIdToSlug(position.pool.providerId), slug)
        : byosmPaths.updateWithTarget(position.info.signerManagerContractId, slug);
      return (
        <StartStakingButtonLayout
          variant="outline"
          onClick={() => void navigate(switchTo)}
          data-testid={`switch-pool-button-${slug}`}
        >
          {bitcoinStakingLabels.switchPool}
        </StartStakingButtonLayout>
      );
    }
    return <StartStakingButtonLayout disabled aria-busy={isLoading || undefined} />;
  }

  if (position.status === 'active') {
    return (
      <StartStakingButtonLayout onClick={() => void navigate(to)}>
        {bitcoinStakingLabels.viewPosition}
      </StartStakingButtonLayout>
    );
  }

  return (
    <StartStakingButtonLayout
      onClick={() => void navigate(to)}
      data-testid={`start-staking-button-${slug}`}
    />
  );
}

export function StartStakingButton({ slug }: StartStakingButtonProps) {
  const { whenExtensionState, setShowInstallLeatherDialog, connect } = useLeatherConnect();
  const navigate = useNavigate();

  const [isClient, setIsClient] = useState(false);
  useOnMount(() => setIsClient(true));

  if (!isClient) {
    return <StartStakingButtonLayout aria-busy />;
  }

  return whenExtensionState({
    connected: <StartStakingPositionCheck slug={slug} />,
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
