import { Link } from 'react-router';

import BigNumber from 'bignumber.js';
import { HStack, Stack, styled } from 'leather-styles/jsx';
import { bitcoinStakingContent, bitcoinStakingLabels } from '~/content/bitcoin-staking-content';
import { getPoolBySignerManager, stakingProviderIdToSlug } from '~/data/bitcoin-staking-data';
import { PendingStakePanel } from '~/features/bitcoin-staking/components/pending-stake-panel';
import { usePox5Position } from '~/features/bitcoin-staking/hooks/use-pox5-position';
import { usePox5TransitionState } from '~/features/bitcoin-staking/hooks/use-pox5-transition-state';
import { stakingPaths } from '~/pages/bitcoin-staking/bitcoin-staking.constants';
import { toHumanReadableMicroStx } from '~/utils/unit-convert';

import { Button } from '@leather.io/ui';

// Rendered only for connected accounts (parent gates via StacksAccountLoader);
// the underlying pox-4 status queries throw without a stacking client.
export function StakingUserPosition() {
  const { position } = usePox5Position();
  const transitionPhase = usePox5TransitionState();

  if (transitionPhase === 'needs-restake' && position.status === 'none') {
    return (
      <Stack
        gap="space.02"
        p="space.05"
        borderWidth={1}
        borderColor="ink.border-default"
        borderRadius="sm"
        data-testid="needs-restake-banner"
      >
        <styled.p textStyle="label.02">{bitcoinStakingContent.needsRestake.title}</styled.p>
        <styled.p textStyle="caption.01" color="ink.text-subdued">
          {bitcoinStakingContent.needsRestake.description}
        </styled.p>
      </Stack>
    );
  }

  if (position.status === 'pending-stake') {
    return <PendingStakePanel />;
  }

  if (position.status === 'active') {
    const pool = getPoolBySignerManager(position.info.signerManagerContractId);

    return (
      <HStack
        justifyContent="space-between"
        alignItems="center"
        p="space.05"
        borderWidth={1}
        borderColor="ink.border-default"
        borderRadius="sm"
        data-testid="staking-user-position"
      >
        <Stack gap="space.01">
          <styled.span textStyle="label.03" color="ink.text-subdued">
            Your staked position{pool ? ` · ${pool.name}` : ''}
          </styled.span>
          <styled.span textStyle="heading.05">
            {toHumanReadableMicroStx(new BigNumber(position.info.amountMicroStx.toString()))}
          </styled.span>
        </Stack>
        {pool && (
          <Link to={stakingPaths.active(stakingProviderIdToSlug(pool.providerId))}>
            <Button size="sm">{bitcoinStakingLabels.viewPosition}</Button>
          </Link>
        )}
      </HStack>
    );
  }

  return null;
}
