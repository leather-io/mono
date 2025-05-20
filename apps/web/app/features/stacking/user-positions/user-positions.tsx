import { useNavigate } from 'react-router';

import { Box, Flex, Stack, styled } from 'leather-styles/jsx';
import { useActivePoolInfo } from '~/features/stacking/hooks/use-active-pool-info';
import { useUserPositionsFakeLoading } from '~/features/stacking/hooks/use-user-positions-fake-loading';
import { useRevokeDelegateStxMutation } from '~/features/stacking/pooled-stacking-info/use-revoke-delegate-stx';
import { UserPositionGrid } from '~/features/stacking/user-positions/user-position-grid';
import { useDaoInfo } from '~/queries/protocols/dao/info';
import { useLisaInfo } from '~/queries/protocols/lisa/info';
import {
  toHumanReadableDays,
  toHumanReadableMicroStx,
  toHumanReadablePercent,
} from '~/utils/unit-convert';

import { Flag, LoadingSpinner, QuestionCircleIcon } from '@leather.io/ui';

interface UserPositionsProps {
  stacksAddress: string;
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function UserPositions({ stacksAddress }: UserPositionsProps) {
  const navigate = useNavigate();
  const { mutateAsync: revokeDelegateStx } = useRevokeDelegateStxMutation();
  const poolInfo = useActivePoolInfo();
  const lisaProtocol = useLisaInfo();
  const daoProtocol = useDaoInfo();
  const { fakeLoading } = useUserPositionsFakeLoading(poolInfo.isLoading);

  function openRevokeStackingContractCall() {
    return revokeDelegateStx().then(() => navigate('/stacking'));
  }

  if (poolInfo.isLoading || lisaProtocol.isLoading || daoProtocol.isLoading) {
    return (
      <Flex mt="space.07" pb="space.05" justifyContent="start" alignItems="center" gap="space.02">
        <Box>
          <LoadingSpinner fill="ink.text-subdued" />
        </Box>
        <styled.span textStyle="heading.05" color="ink.text-subdued">
          Looking for positions...
        </styled.span>
      </Flex>
    );
  }

  if (poolInfo.isError && lisaProtocol.isError && daoProtocol.isError) {
    const msg = 'Error while loading data, try reloading the page.';
    // eslint-disable-next-line no-console
    console.error(msg);
    return msg;
  }

  const activePoolRewardProtocolInfo = !poolInfo.isError
    ? poolInfo.activePoolRewardProtocolInfo
    : null;
  const hasActivePool =
    !poolInfo.isError &&
    poolInfo.delegationStatusQuery.data.delegated &&
    activePoolRewardProtocolInfo?.isStacking &&
    activePoolRewardProtocolInfo?.poolAddress;

  const activeLisaProtocolInfo = lisaProtocol.info;
  const isLisaProtocolActive =
    !lisaProtocol.isError && lisaProtocol.info && lisaProtocol.balance?.data.gt(0);

  const activeDaoProtocolInfo = daoProtocol.info;
  const isDaoProtocolActive =
    !daoProtocol.isError && daoProtocol.info && daoProtocol.balance?.data?.gt(0);

  // no positions
  if (!hasActivePool && !isLisaProtocolActive && !isDaoProtocolActive) {
    return (
      <Box mt="space.07" pb="space.05">
        <styled.span textStyle="heading.05" color="ink.text-subdued">
          No position found
        </styled.span>
      </Box>
    );
  }

  return (
    <Stack>
      <styled.h2 textStyle="heading.05" mt="space.07">
        My positions
      </styled.h2>

      {/* Active pool */}
      {hasActivePool && (
        <UserPositionGrid
          isLoading={fakeLoading}
          name={activePoolRewardProtocolInfo.title ?? 'Unknown pool'}
          logo={activePoolRewardProtocolInfo.logo}
          poolSlug={activePoolRewardProtocolInfo.id}
          apr={activePoolRewardProtocolInfo.apr}
          nextReward={toHumanReadableDays(activePoolRewardProtocolInfo.nextCycleDays)}
          rewardTokenIcon={activePoolRewardProtocolInfo.rewardTokenIcon}
          rewardTokenSymbol={activePoolRewardProtocolInfo.rewardsToken}
          amount={
            activePoolRewardProtocolInfo?.delegatedAmountMicroStx
              ? toHumanReadableMicroStx(activePoolRewardProtocolInfo.delegatedAmountMicroStx)
              : undefined
          }
          onViewDetails={
            activePoolRewardProtocolInfo.id
              ? () => void navigate(`/stacking/pool/${activePoolRewardProtocolInfo.id}/active`)
              : undefined
          }
          onIncrease={
            activePoolRewardProtocolInfo.id
              ? () => void navigate(`/stacking/pool/${activePoolRewardProtocolInfo.id}`)
              : undefined
          }
          onStopPooling={openRevokeStackingContractCall}
        />
      )}

      {/* Active lisa protocol */}
      {isLisaProtocolActive && activeLisaProtocolInfo && (
        <UserPositionGrid
          isLoading={fakeLoading}
          name={activeLisaProtocolInfo.name ?? 'Unknown pool'}
          logo={activeLisaProtocolInfo.logo}
          poolSlug={activeLisaProtocolInfo.slug}
          amount={
            activeLisaProtocolInfo.amount
              ? toHumanReadableMicroStx(activeLisaProtocolInfo.amount)
              : undefined
          }
          apr={toHumanReadablePercent(activeLisaProtocolInfo.apr)}
          nextReward={toHumanReadableDays(activeLisaProtocolInfo.nextCycleDays)}
          rewardTokenIcon={activeLisaProtocolInfo.payoutIcon}
          rewardTokenSymbol={activeLisaProtocolInfo.payout}
          onViewDetails={() =>
            void navigate(`/stacking/liquid/${activeLisaProtocolInfo.slug}/active`)
          }
          onIncrease={() => void navigate(`/stacking/liquid/${activeLisaProtocolInfo.slug}`)}
        />
      )}

      {/* Active DAO protocol */}
      {isDaoProtocolActive && activeDaoProtocolInfo && (
        <UserPositionGrid
          isLoading={fakeLoading}
          name={activeDaoProtocolInfo.name ?? 'Unknown pool'}
          logo={activeDaoProtocolInfo.logo}
          poolSlug={activeDaoProtocolInfo.slug}
          amount={
            activeDaoProtocolInfo.amount
              ? toHumanReadableMicroStx(activeDaoProtocolInfo.amount)
              : undefined
          }
          apr={toHumanReadablePercent(activeDaoProtocolInfo.apr)}
          nextReward={toHumanReadableDays(activeDaoProtocolInfo.nextCycleDays)}
          rewardTokenIcon={activeDaoProtocolInfo.payoutIcon}
          rewardTokenSymbol={activeDaoProtocolInfo.payout}
          onViewDetails={() =>
            void navigate(`/stacking/liquid/${activeDaoProtocolInfo.slug}/active`)
          }
          onIncrease={() => void navigate(`/stacking/liquid/${activeDaoProtocolInfo.slug}`)}
        />
      )}

      {!activePoolRewardProtocolInfo?.id && (
        <styled.p textStyle="caption.01" color="ink.text-subdued">
          <Flag
            img={<QuestionCircleIcon variant="small" color={'inherit' as any} />}
            spacing="space.01"
          >
            After unpooling your previous position remains visible until the current cycle completes
          </Flag>
        </styled.p>
      )}
    </Stack>
  );
}
