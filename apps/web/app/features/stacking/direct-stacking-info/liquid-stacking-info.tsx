import { Box, HStack, VStack, styled } from 'leather-styles/jsx';
import { ProtocolOverview } from '~/components/protocol-overview';
import { content } from '~/data/content';
import { PendingStackExtendAlert } from '~/features/stacking/components/pending-stack-extend-alert';
import { useGetHasPendingStackingTransactionQuery } from '~/features/stacking/direct-stacking-info/use-get-has-pending-tx-query';
import { protocols } from '~/features/stacking/start-liquid-stacking/utils/preset-protocols';
import {
  ProtocolIdToDisplayNameMap,
  ProtocolSlug,
  ProtocolSlugToIdMap,
} from '~/features/stacking/start-liquid-stacking/utils/types-preset-protocols';
import { useProtocolInfo } from '~/queries/protocols/use-protocol-info';
import { useStacksNetwork } from '~/store/stacks-network';
import { toHumanReadableMicroStx } from '~/utils/unit-convert';

import { Spinner } from '@leather.io/ui';

import { useGetPoxInfoQuery, useGetStatusQuery } from '../hooks/stacking.query';
import { NoStackingInfo } from './components/no-stacking-info';
import { PendingStackingInfo } from './components/pending-stacking-info';

export interface DirectStackingInfoProps {
  address: string;
  protocolSlug: ProtocolSlug;
}

export function LiquidStackingInfo({ protocolSlug }: DirectStackingInfoProps) {
  const { networkName } = useStacksNetwork();
  const getStatusQuery = useGetStatusQuery();
  const getPoxInfoQuery = useGetPoxInfoQuery();
  const {
    getHasPendingDirectStackingQuery,
    getHasPendingStackIncreaseQuery,
    getHasPendingStackExtendQuery,
  } = useGetHasPendingStackingTransactionQuery();
  const protocolInfo = useProtocolInfo(protocolSlug);

  if (
    getStatusQuery.isLoading ||
    getPoxInfoQuery.isLoading ||
    getHasPendingDirectStackingQuery.isLoading ||
    getHasPendingStackIncreaseQuery.isLoading ||
    getHasPendingStackExtendQuery.isLoading ||
    protocolInfo.isLoading
  ) {
    // return <CenteredSpinner />;
    return <Spinner />;
  }

  if (
    getStatusQuery.isError ||
    !getStatusQuery.data ||
    getPoxInfoQuery.isError ||
    !getPoxInfoQuery.data ||
    getHasPendingDirectStackingQuery.isError ||
    getHasPendingStackIncreaseQuery.isError ||
    protocolInfo.isError
  ) {
    const msg = 'Error while loading data, try reloading the page.';
    // eslint-disable-next-line no-console
    console.error(msg);
    return <styled.div mt="space.07">{msg}</styled.div>;
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
      <HStack display={['none', 'none', 'flex']} justifyContent="space-between">
        <VStack gap="space.05" alignItems="left" p="space.05">
          {protocol.icon}
          <styled.h4 textDecoration="underline" textStyle="label.01">
            {protocol.name}
          </styled.h4>
        </VStack>
      </HStack>

      {protocolInfo.info && <ProtocolOverview info={protocolInfo.info} />}

      {getHasPendingStackExtendQuery.data && (
        <PendingStackExtendAlert pendingStackExtend={getHasPendingStackExtendQuery.data} />
      )}

      {getHasPendingStackIncreaseQuery.data && (
        <Box pb="space.04">
          <styled.p textStyle="label.02">
            {content.statusMessages.waitingForTxConfirmation}
          </styled.p>
          <styled.p>
            {content.statusMessages.stackingSubmitted.replace(
              'an additional amount',
              `an additional amount of ${toHumanReadableMicroStx(getHasPendingStackIncreaseQuery.data.increaseBy)}`
            )}
          </styled.p>
        </Box>
      )}

      {isBeforeFirstRewardCycle && (
        <Box pb="space.04">
          <styled.p textStyle="label.02">{content.statusMessages.waitingForCycleToStart}</styled.p>
          <styled.p>{content.statusMessages.stackingReady}</styled.p>
        </Box>
      )}
    </VStack>
  );
}
