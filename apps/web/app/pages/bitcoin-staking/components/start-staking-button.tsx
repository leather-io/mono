import { ReactNode, useState } from 'react';
import { useNavigate } from 'react-router';

import { bitcoinStakingLabels } from '~/content/bitcoin-staking-content';
import { StakingPoolSlug, stakingProviderIdToSlug } from '~/data/bitcoin-staking-data';
import { usePox5Position } from '~/features/bitcoin-staking/hooks/use-pox5-position';
import { stakingPaths } from '~/pages/bitcoin-staking/bitcoin-staking.constants';
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
  showProposedSwitchAction?: boolean;
}

function StartStakingPositionCheck({
  slug,
  showProposedSwitchAction = false,
}: StartStakingButtonProps) {
  const navigate = useNavigate();
  const { position } = usePox5Position();
  const { isLoading, to } = useStakingPoolLink(slug);

  if (!to) {
    if (showProposedSwitchAction && position.status === 'active' && position.pool) {
      const currentSlug = stakingProviderIdToSlug(position.pool.providerId);
      const switchTo = `${stakingPaths.update(currentSlug)}?to=${slug}`;
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

export function StartStakingButton({ slug, showProposedSwitchAction }: StartStakingButtonProps) {
  const { whenExtensionState, setShowInstallLeatherDialog, connect } = useLeatherConnect();
  const navigate = useNavigate();

  const [isClient, setIsClient] = useState(false);
  useOnMount(() => setIsClient(true));

  if (!isClient) {
    return <StartStakingButtonLayout aria-busy />;
  }

  return whenExtensionState({
    connected: (
      <StartStakingPositionCheck slug={slug} showProposedSwitchAction={showProposedSwitchAction} />
    ),
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
