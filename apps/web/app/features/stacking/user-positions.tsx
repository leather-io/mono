import { useNavigate } from 'react-router';

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
import { toHumanReadableMicroStx } from '~/utils/unit-convert';

import {
  ChevronDownIcon,
  CloseIcon,
  DropdownMenu,
  Flag,
  InfoCircleIcon,
  LoadingSpinner,
  PlusIcon,
  QuestionCircleIcon,
  SkeletonLoader,
} from '@leather.io/ui';

import { useUserPositionsFakeLoading } from './hooks/use-user-positions-fake-loading';
import { useRevokeDelegateStxMutation } from './pooled-stacking-info/use-revoke-delegate-stx';

interface UserPositionsProps {
  stacksAddress: string;
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function UserPositions({ stacksAddress }: UserPositionsProps) {
  const navigate = useNavigate();
  const { mutateAsync: revokeDelegateStx } = useRevokeDelegateStxMutation();

  function openRevokeStackingContractCall() {
    return revokeDelegateStx().then(() => navigate('/stacking'));
  }

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

  // Logic like this should not live in UI components
  // I believe we'd like to show this in the UI
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
                <DropdownMenu.Root>
                  <DropdownMenu.Trigger>
                    <Flag reverse img={<ChevronDownIcon variant="small" />} spacing="space.01">
                      <styled.h4 userSelect="none" textStyle="label.01" textAlign="left">
                        {pool.name}
                      </styled.h4>
                    </Flag>
                  </DropdownMenu.Trigger>

                  <DropdownMenu.Content align="start">
                    <Box p="space.02" textStyle="label.02">
                      <DropdownMenu.Item
                        onSelect={() => void navigate(`/stacking/pool/${poolSlug}/active`)}
                      >
                        <Flag img={<InfoCircleIcon variant="small" />}>View position details</Flag>
                      </DropdownMenu.Item>
                      <DropdownMenu.Item
                        onSelect={() => void navigate(`/stacking/pool/${poolSlug}`)}
                      >
                        <Flag img={<PlusIcon variant="small" />}>Increase pooling amount</Flag>
                      </DropdownMenu.Item>
                      <DropdownMenu.Item onSelect={() => openRevokeStackingContractCall()}>
                        <Flag
                          color="red.action-primary-default"
                          img={<CloseIcon color="red.action-primary-default" variant="small" />}
                        >
                          Stop pooling
                        </Flag>
                      </DropdownMenu.Item>
                    </Box>
                  </DropdownMenu.Content>
                </DropdownMenu.Root>
              ) : (
                <styled.h4 textStyle="label.01">Unknown pool</styled.h4>
              )}
            </SkeletonLoader>
          </VStack>
        </InfoGrid.Cell>
        <InfoGrid.Cell>
          <ValueDisplayerWithLoader
            name="Amount"
            isLoading={fakeLoading}
            value={
              delegationInfoDetails
                ? toHumanReadableMicroStx(delegationInfoDetails.amount_micro_stx)
                : '—'
            }
          />
        </InfoGrid.Cell>
        <InfoGrid.Cell>
          <ValueDisplayerWithLoader name="APR" isLoading={fakeLoading} value="~10%" />
        </InfoGrid.Cell>
        <InfoGrid.Cell>
          <ValueDisplayerWithLoader name="Next rewards" isLoading={fakeLoading} value="~10 days" />
        </InfoGrid.Cell>
        <InfoGrid.Cell>
          <ValueDisplayerWithCustomLoader
            name="Rewards token"
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

      {!pool && !poolSlug && (
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
