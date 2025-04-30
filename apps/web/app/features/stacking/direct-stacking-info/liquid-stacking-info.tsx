import { Box, HStack, VStack, styled } from 'leather-styles/jsx';
import { PendingStackExtendAlert } from '~/features/stacking/components/pending-stack-extend-alert';
import { LiquidStackingActionButtons } from '~/features/stacking/direct-stacking-info/components/liquid-stacking-action-buttons';
import { LiquidStackingInfoGrid } from '~/features/stacking/direct-stacking-info/components/liquid-stacking-info-grid';
import { useGetHasPendingStackingTransactionQuery } from '~/features/stacking/direct-stacking-info/use-get-has-pending-tx-query';
import { protocols } from '~/features/stacking/start-liquid-stacking/utils/preset-protocols';
import {
  ProtocolIdToDisplayNameMap,
  ProtocolSlug,
  ProtocolSlugToIdMap,
} from '~/features/stacking/start-liquid-stacking/utils/types-preset-protocols';
import { poolRewardProtocol } from '~/features/stacking/start-pooled-stacking/components/preset-pools';
import { useStxCryptoAssetBalance } from '~/queries/balance/account-balance.hooks';
import { useStacksNetwork } from '~/store/stacks-network';
import { toHumanReadableStx } from '~/utils/unit-convert';

import { Spinner } from '@leather.io/ui';

import {
  useGetAccountExtendedBalancesQuery,
  useGetCoreInfoQuery,
  useGetPoxInfoQuery,
  useGetStatusQuery,
} from '../hooks/stacking.query';
import { NoStackingInfo } from './components/no-stacking-info';
import { PendingStackingInfo } from './components/pending-stacking-info';

export interface DirectStackingInfoProps {
  address: string;
  protocolSlug: ProtocolSlug;
}

export function LiquidStackingInfo({ address, protocolSlug }: DirectStackingInfoProps) {
  const { networkName } = useStacksNetwork();
  const getStatusQuery = useGetStatusQuery();
  const getAccountExtendedBalancesQuery = useGetAccountExtendedBalancesQuery();
  const getCoreInfoQuery = useGetCoreInfoQuery();
  const { filteredBalanceQuery: getAccountBalanceLockedQuery } = useStxCryptoAssetBalance(address);
  const getPoxInfoQuery = useGetPoxInfoQuery();
  const {
    getHasPendingDirectStackingQuery,
    getHasPendingStackIncreaseQuery,
    getHasPendingStackExtendQuery,
  } = useGetHasPendingStackingTransactionQuery();

  if (
    getStatusQuery.isLoading ||
    getAccountExtendedBalancesQuery.isLoading ||
    getCoreInfoQuery.isLoading ||
    getPoxInfoQuery.isLoading ||
    getAccountBalanceLockedQuery.isLoading ||
    getHasPendingDirectStackingQuery.isLoading ||
    getHasPendingStackIncreaseQuery.isLoading ||
    getHasPendingStackExtendQuery.isLoading
  ) {
    // return <CenteredSpinner />;
    return <Spinner />;
  }

  if (
    getStatusQuery.isError ||
    !getStatusQuery.data ||
    getAccountExtendedBalancesQuery.isError ||
    !getAccountExtendedBalancesQuery.data ||
    getAccountBalanceLockedQuery.isError ||
    !getAccountBalanceLockedQuery.data ||
    getCoreInfoQuery.isError ||
    !getCoreInfoQuery.data ||
    getPoxInfoQuery.isError ||
    !getPoxInfoQuery.data ||
    getHasPendingDirectStackingQuery.isError ||
    getHasPendingStackIncreaseQuery.isError
  ) {
    const msg = 'Error while loading data, try reloading the page.';
    // eslint-disable-next-line no-console
    console.error(msg);
    return msg;
  }

  const isStacking = getStatusQuery.data.stacked;

  if (!isStacking && getHasPendingDirectStackingQuery.data === null) {
    return <NoStackingInfo />;
  }

  const transactionId = getHasPendingDirectStackingQuery.data?.transactionId;

  if (!isStacking && getHasPendingDirectStackingQuery.data) {
    return (
      <PendingStackingInfo
        data={getHasPendingDirectStackingQuery.data}
        transactionId={transactionId}
        networkName={networkName}
      />
    );
  }

  // This if statement may be unnecessary, as cases for when the account is not stacked should have
  // already been handled above, but the type system can not guarantee this.
  if (!getStatusQuery.data.stacked) {
    const id = 'ee504e56-9cc5-49b4-ae98-a5cac5c35dbf';
    const msg = 'Expected account to be stacked';
    // eslint-disable-next-line no-console
    console.error(id, msg);
    return msg;
  }

  const isBeforeFirstRewardCycle =
    getPoxInfoQuery.data.reward_cycle_id < getStatusQuery.data.details.first_reward_cycle;

  const protocolId = ProtocolSlugToIdMap[protocolSlug];
  const protocolName = ProtocolIdToDisplayNameMap[protocolId];
  const protocol = protocols[protocolName];

  return (
    <VStack alignItems="stretch" pt="12px">
      <HStack justifyContent="space-between">
        <VStack gap="space.05" alignItems="left" p="space.05">
          {protocol.icon}
          <styled.h4 textStyle="label.01">{protocol.name}</styled.h4>
        </VStack>
        <LiquidStackingActionButtons protocolSlug={protocolSlug} />
      </HStack>

      <LiquidStackingInfoGrid
        rewardProtocol={poolRewardProtocol}
        rewardCycleId={getPoxInfoQuery.data.reward_cycle_id}
        lockedAmount={getAccountBalanceLockedQuery.data.availableBalance.amount}
        stackerInfoDetails={getStatusQuery.data.details}
        pendingStackExtend={getHasPendingStackExtendQuery.data}
        protocolSlug={protocolSlug}
      />

      {getHasPendingStackExtendQuery.data && (
        <PendingStackExtendAlert pendingStackExtend={getHasPendingStackExtendQuery.data} />
      )}

      {getHasPendingStackIncreaseQuery.data && (
        <Box pb="space.04">
          <styled.p textStyle="label.02">Waiting for transaction confirmation</styled.p>
          <styled.p>
            A stacking request was successfully submitted to the blockchain. Once confirmed, an
            additional amount of{' '}
            {toHumanReadableStx(getHasPendingStackIncreaseQuery.data.increaseBy)} will be stacking.
          </styled.p>
        </Box>
      )}

      {isBeforeFirstRewardCycle && (
        <Box pb="space.04">
          <styled.p textStyle="label.02">Waiting for the cycle to start</styled.p>
          <styled.p>
            Your STX are ready for stacking. Once the next cycle starts the network will determine
            if and how many slots are claimed.
          </styled.p>
        </Box>
      )}
    </VStack>
  );
}
