import { Link } from 'react-router';

import { css } from 'leather-styles/css';
import { Stack, VStack, styled } from 'leather-styles/jsx';
import { DummyIcon } from '~/components/dummy';
import { InfoGrid } from '~/components/info-grid/info-grid';
import { useGetCoreInfoQuery, useGetStatusQuery } from '~/features/stacking/hooks/stacking.query';
import { useDelegationStatusQuery } from '~/features/stacking/pooled-stacking-info/use-delegation-status-query';
import { useGetPoolAddress } from '~/features/stacking/pooled-stacking-info/use-get-pool-address-query';
import {
  getPoolByAddress,
  getPoolSlugByPoolName,
} from '~/features/stacking/start-pooled-stacking/utils/utils-preset-pools';
import { ValueDisplayer } from '~/pages/sbtc-rewards/components/reward-value-displayer';
import { toHumanReadableStx } from '~/utils/unit-convert';

import { LoadingSpinner } from '@leather.io/ui';

interface UserPositionsProps {
  stacksAddress: string;
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function UserPositions({ stacksAddress }: UserPositionsProps) {
  const delegationStatusQuery = useDelegationStatusQuery();
  const getStatusQuery = useGetStatusQuery();
  const getCoreInfoQuery = useGetCoreInfoQuery();
  const getPoolAddressQuery = useGetPoolAddress();

  if (
    delegationStatusQuery.isLoading ||
    getStatusQuery.isLoading ||
    getCoreInfoQuery.isLoading ||
    getPoolAddressQuery.isLoading ||
    getPoolAddressQuery.isFetching
  ) {
    return <LoadingSpinner />;
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

  if ((!delegationStatusQuery.data.delegated && !isStacking) || !poolAddress) {
    return null; // no positions
  }

  const pool = getPoolByAddress(poolAddress); // TODO: Detect custom pool
  const poolSlug = pool ? getPoolSlugByPoolName(pool.name) : undefined;

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
            {pool ? pool.icon : <DummyIcon />}
            {pool && poolSlug ? (
              <Link to={`/pooled-stacking/${poolSlug}/active`} style={{ maxWidth: 'fit-content' }}>
                <styled.h4 textStyle="label.01" borderBottom="1px solid">
                  {pool.name}
                </styled.h4>
              </Link>
            ) : (
              <styled.h4 textStyle="label.01">Unknown pool</styled.h4>
            )}
          </VStack>
        </InfoGrid.Cell>
        <InfoGrid.Cell>
          <ValueDisplayer
            name="Amount"
            value={
              delegationInfoDetails
                ? toHumanReadableStx(delegationInfoDetails.amount_micro_stx)
                : '--'
            }
          />
        </InfoGrid.Cell>
        <InfoGrid.Cell>
          <ValueDisplayer name="APR" value="~10%" />
        </InfoGrid.Cell>
        <InfoGrid.Cell>
          <ValueDisplayer name="Next rewards" value="~10 days" />
        </InfoGrid.Cell>
        <InfoGrid.Cell>
          <ValueDisplayer name="Rewards token" value="STX" />
        </InfoGrid.Cell>
      </InfoGrid>
    </Stack>
  );
}
