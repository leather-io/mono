import { Link } from 'react-router';

import { css } from 'leather-styles/css';
import { Box, Flex, Stack, VStack, styled } from 'leather-styles/jsx';
import { DummyIcon } from '~/components/dummy';
import { ProviderIcon } from '~/components/icons/provider-icon';
import { StacksIcon } from '~/components/icons/stacks-icon';
import { InfoGrid } from '~/components/info-grid/info-grid';
import {
  ValueDisplayerWithCustomLoader,
  ValueDisplayerWithLoader,
} from '~/components/value-displayer/value-displayer-with-loader';
import { useGetCoreInfoQuery, useGetStatusQuery } from '~/features/stacking/hooks/stacking.query';
import { useDelegationStatusQuery } from '~/features/stacking/pooled-stacking-info/use-delegation-status-query';
import { useGetPoolAddress } from '~/features/stacking/pooled-stacking-info/use-get-pool-address-query';
import {
  getPoolByAddress,
  getPoolSlugByPoolName,
} from '~/features/stacking/start-pooled-stacking/utils/utils-stacking-pools';
import { toHumanReadableStx } from '~/utils/unit-convert';

import { LoadingSpinner, SkeletonLoader } from '@leather.io/ui';

import { useUserPositionsFakeLoading } from './hooks/use-user-positions-fake-loading';
import { PostLabelHoverCard } from '~/components/post-label-hover-card';
import { content } from '~/data/content';

interface UserPositionsProps {
  stacksAddress: string;
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function UserPositions({ stacksAddress }: UserPositionsProps) {
  const delegationStatusQuery = useDelegationStatusQuery();
  const getStatusQuery = useGetStatusQuery();
  const getCoreInfoQuery = useGetCoreInfoQuery();
  const getPoolAddressQuery = useGetPoolAddress();

  const isLoading =
    delegationStatusQuery.isLoading ||
    getStatusQuery.isLoading ||
    getCoreInfoQuery.isLoading ||
    getPoolAddressQuery.isLoading ||
    getPoolAddressQuery.isFetching;

  const { fakeLoading } = useUserPositionsFakeLoading(isLoading);

  if (isLoading) {
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

  const isError =
    delegationStatusQuery.isError ||
    getStatusQuery.isError ||
    getPoolAddressQuery.isError ||
    getCoreInfoQuery.isError;

  if (isError) {
    const msg = 'Error while loading data, try reloading the page.';
    // eslint-disable-next-line no-console
    console.error(msg);
    return msg;
  }

  const hasData =
    getStatusQuery.data &&
    getCoreInfoQuery.data &&
    getPoolAddressQuery.data &&
    delegationStatusQuery.data;

  if (!hasData) {
    return null;
  }

  const isStacking = getStatusQuery.data.stacked;
  const poolAddress =
    getPoolAddressQuery.data.address ||
    (delegationStatusQuery.data.delegated
      ? delegationStatusQuery.data.details.delegated_to
      : undefined);

  // no positions
  if ((!delegationStatusQuery.data.delegated && !isStacking) || !poolAddress) {
    return (
      <Box mt="space.07" pb="space.05">
        <styled.span textStyle="heading.05" color="ink.text-subdued">
          No position found
        </styled.span>
      </Box>
    );
  }

  const pool = getPoolByAddress(poolAddress); // TODO: Detect custom pool
  const poolSlug = pool ? getPoolSlugByPoolName(pool.providerId) : undefined;

  const delegationInfoDetails = delegationStatusQuery.data.delegated
    ? delegationStatusQuery.data.details
    : undefined;

  // I beleive we'd like to show this in the UI
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const isExpired =
    delegationStatusQuery.data.delegated &&
    delegationStatusQuery.data.details.until_burn_ht !== undefined &&
    !Number.isNaN(delegationStatusQuery.data.details.until_burn_ht) &&
    delegationStatusQuery.data.details.until_burn_ht < getCoreInfoQuery.data.burn_block_height;

  return (
    <Stack>
      <styled.h2 textStyle="heading.05" mt="space.07">
        My positions
      </styled.h2>

      <InfoGrid
        width="100%"
        gridTemplateColumns={['repeat(auto-fit, minmax(210px, 1fr))']}
        gridTemplateRows="auto"
        height="fit-content"
        className={css({ '& > *:not(:first-child)': { height: 'unset' } })}
      >
        <InfoGrid.Cell>
          <VStack gap="space.05" alignItems="left" p="space.05">
            <SkeletonLoader width="32" height="32" isLoading={fakeLoading}>
              {pool ? <ProviderIcon providerId={pool.providerId} /> : <DummyIcon />}
            </SkeletonLoader>

            <SkeletonLoader height="15" width="80" isLoading={fakeLoading}>
              {pool && poolSlug ? (
                <Link
                  to={`/pooled-stacking/${poolSlug}/active`}
                  style={{ maxWidth: 'fit-content' }}
                >
                  <styled.h4 textStyle="label.01" borderBottom="1px solid">
                    {pool.name}
                  </styled.h4>
                </Link>
              ) : (
                <styled.h4 textStyle="label.01">Unknown pool</styled.h4>
              )}
            </SkeletonLoader>
          </VStack>
        </InfoGrid.Cell>
        <InfoGrid.Cell>
          <ValueDisplayerWithLoader
            name={<PostLabelHoverCard postKey="stacking-amount" label={(content.posts as Record<string, any>)["stacking-amount"]?.Title || "Amount"} textStyle="label.03" />}
            isLoading={fakeLoading}
            value={
              delegationInfoDetails
                ? toHumanReadableStx(delegationInfoDetails.amount_micro_stx)
                : '--'
            }
          />
        </InfoGrid.Cell>
        <InfoGrid.Cell>
          <ValueDisplayerWithLoader
            name={<PostLabelHoverCard postKey="historical-yield" label={(content.posts as Record<string, any>)["historical-yield"]?.Title || "APR"} textStyle="label.03" />}
            isLoading={fakeLoading}
            value="~10%"
          />
        </InfoGrid.Cell>
        <InfoGrid.Cell>
          <ValueDisplayerWithLoader
            name={<PostLabelHoverCard postKey="pooled-stacking-upcoming-rewards" label={(content.posts as Record<string, any>)["pooled-stacking-upcoming-rewards"]?.Title || "Next rewards"} textStyle="label.03" />}
            isLoading={fakeLoading}
            value="~10 days"
          />
        </InfoGrid.Cell>
        <InfoGrid.Cell>
          <ValueDisplayerWithCustomLoader
            name={<PostLabelHoverCard postKey="stacking-rewards-tokens" label={(content.posts as Record<string, any>)["stacking-rewards-tokens"]?.Title || "Rewards token"} textStyle="label.03" />}
            isLoading={fakeLoading}
            value={
              <Flex gap="space.02" alignItems="center">
                <StacksIcon />
                STX
              </Flex>
            }
            customSkeletonLayout={
              <Flex gap="space.02" alignItems="center">
                <SkeletonLoader
                  height="24"
                  width="24"
                  borderRadius="round"
                  isLoading={fakeLoading}
                />
                <SkeletonLoader height="15" width="80" isLoading={fakeLoading} />
              </Flex>
            }
          />
        </InfoGrid.Cell>
      </InfoGrid>
    </Stack>
  );
}
