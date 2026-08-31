import { useNavigate } from 'react-router';

import BigNumber from 'bignumber.js';
import { HStack, Stack, styled } from 'leather-styles/jsx';
import { CopyAddress } from '~/components/copy-address';
import { bitcoinStakingContent, bitcoinStakingLabels } from '~/content/bitcoin-staking-content';
import {
  BitcoinStakingProviderId,
  getPoolBySignerManager,
  stakingProviderIdToSlug,
} from '~/data/bitcoin-staking-data';
import { PendingStakePanel } from '~/features/bitcoin-staking/components/pending-stake-panel';
import { usePox5NeedsRestake } from '~/features/bitcoin-staking/hooks/use-pox5-needs-restake';
import { usePox5Position } from '~/features/bitcoin-staking/hooks/use-pox5-position';
import { byosmPaths, stakingPaths } from '~/pages/bitcoin-staking/bitcoin-staking.constants';
import { useLeatherConnect } from '~/store/addresses';
import { toHumanReadableMicroStx } from '~/utils/unit-convert';

import { Button } from '@leather.io/ui';

import { ClaimRewardsButton } from './claim-rewards-button';
import { StakingPoolAvatar } from './staking-pool-avatar';

const positionRowLabel = 'Your staked position';

type PositionIdentity = { kind: 'listed'; poolName: string } | { kind: 'unlisted' };

interface StakingPositionRowProps {
  providerId: BitcoinStakingProviderId;
  identity: PositionIdentity;
  amountMicroStx: bigint;
  signerManagerContractId: string;
  viewPositionTo: string;
  stakerAddress: string | undefined;
}

function StakingPositionRow({
  providerId,
  identity,
  amountMicroStx,
  signerManagerContractId,
  viewPositionTo,
  stakerAddress,
}: StakingPositionRowProps) {
  const navigate = useNavigate();
  return (
    <HStack
      justifyContent="space-between"
      alignItems="center"
      gap="space.04"
      p="space.05"
      borderWidth={1}
      borderColor="ink.border-default"
      borderRadius="md"
      data-testid="staking-user-position"
    >
      <HStack gap="space.04" alignItems="center" minWidth={0}>
        <StakingPoolAvatar providerId={providerId} />
        <Stack gap="space.01" minWidth={0}>
          {identity.kind === 'unlisted' ? (
            <CopyAddress addr={signerManagerContractId} compact />
          ) : (
            <styled.span textStyle="label.03" color="ink.text-subdued">
              {positionRowLabel} · {identity.poolName}
            </styled.span>
          )}
          <styled.span textStyle="heading.05">
            {toHumanReadableMicroStx(new BigNumber(amountMicroStx.toString()))}
          </styled.span>
        </Stack>
      </HStack>

      <HStack gap="space.02" alignItems="center" flexShrink={0}>
        {stakerAddress && (
          <ClaimRewardsButton
            providerId={providerId}
            signerManagerContractId={signerManagerContractId}
            stakerAddress={stakerAddress}
          />
        )}
        <Button size="sm" onClick={() => void navigate(viewPositionTo)}>
          {bitcoinStakingLabels.viewPosition}
        </Button>
      </HStack>
    </HStack>
  );
}

// Rendered only for connected accounts (parent gates via StacksAccountLoader);
// the underlying pox-4 status queries throw without a stacking client.
export function StakingUserPosition() {
  const { position } = usePox5Position();
  const needsRestake = usePox5NeedsRestake();
  const { stacksAccount } = useLeatherConnect();

  if (needsRestake && position.status === 'none') {
    return (
      <Stack
        gap="space.02"
        p="space.05"
        borderWidth={1}
        borderColor="ink.border-default"
        borderRadius="md"
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
      <StakingPositionRow
        providerId={pool?.providerId ?? 'byosm'}
        identity={pool ? { kind: 'listed', poolName: pool.name } : { kind: 'unlisted' }}
        amountMicroStx={position.info.amountMicroStx}
        signerManagerContractId={position.info.signerManagerContractId}
        viewPositionTo={
          pool
            ? stakingPaths.active(stakingProviderIdToSlug(pool.providerId))
            : byosmPaths.active(position.info.signerManagerContractId)
        }
        stakerAddress={stacksAccount?.address}
      />
    );
  }

  return null;
}
