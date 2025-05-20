import { useNavigate } from 'react-router';

import { css } from 'leather-styles/css';
import { Box, Flex, Stack, VStack, styled } from 'leather-styles/jsx';
import { DummyIcon } from '~/components/dummy';
import { InfoGrid } from '~/components/info-grid/info-grid';
import {
  ValueDisplayerWithCustomLoader,
  ValueDisplayerWithLoader,
} from '~/components/value-displayer/value-displayer-with-loader';
import { useActivePoolInfo } from '~/features/stacking/hooks/use-active-pool-info';
import { toHumanReadableDays, toHumanReadableMicroStx } from '~/utils/unit-convert';

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
import { PostLabelHoverCard } from '~/components/post-label-hover-card';
import { content } from '~/data/content';

interface UserPositionsProps {
  stacksAddress: string;
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function UserPositions({ stacksAddress }: UserPositionsProps) {
  const navigate = useNavigate();
  const { mutateAsync: revokeDelegateStx } = useRevokeDelegateStxMutation();
  const poolInfo = useActivePoolInfo();
  const { fakeLoading } = useUserPositionsFakeLoading(poolInfo.isLoading);

  function openRevokeStackingContractCall() {
    return revokeDelegateStx().then(() => navigate('/stacking'));
  }

  if (poolInfo.isLoading) {
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

  if (poolInfo.isError) {
    const msg = 'Error while loading data, try reloading the page.';
    // eslint-disable-next-line no-console
    console.error(msg);
    return msg;
  }

  const activePoolRewardProtocolInfo = poolInfo.activePoolRewardProtocolInfo;

  // no positions
  if (
    (!poolInfo.delegationStatusQuery.data.delegated && !activePoolRewardProtocolInfo?.isStacking) ||
    !activePoolRewardProtocolInfo ||
    !activePoolRewardProtocolInfo?.poolAddress
  ) {
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
              {activePoolRewardProtocolInfo ? activePoolRewardProtocolInfo.logo : <DummyIcon />}
            </SkeletonLoader>

            <SkeletonLoader height="15" width="80" isLoading={fakeLoading}>
              {activePoolRewardProtocolInfo ? (
                <DropdownMenu.Root>
                  <DropdownMenu.Trigger>
                    <Flag reverse img={<ChevronDownIcon variant="small" />} spacing="space.01">
                      <styled.h4 userSelect="none" textStyle="label.01" textAlign="left">
                        {activePoolRewardProtocolInfo.title}
                      </styled.h4>
                    </Flag>
                  </DropdownMenu.Trigger>

                  <DropdownMenu.Content align="start">
                    <Box p="space.02" textStyle="label.02">
                      <DropdownMenu.Item
                        onSelect={() =>
                          void navigate(`/stacking/pool/${activePoolRewardProtocolInfo.id}/active`)
                        }
                      >
                        <Flag img={<InfoCircleIcon variant="small" />}>View position details</Flag>
                      </DropdownMenu.Item>
                      <DropdownMenu.Item
                        onSelect={() =>
                          void navigate(`/stacking/pool/${activePoolRewardProtocolInfo.id}`)
                        }
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
            name={<PostLabelHoverCard postKey="stacking-amount" label={(content.posts as Record<string, any>)["stacking-amount"]?.Title || "Amount"} textStyle="label.03" />}
            isLoading={fakeLoading}
            value={
              activePoolRewardProtocolInfo.delegatedAmountMicroStx
                ? toHumanReadableMicroStx(activePoolRewardProtocolInfo.delegatedAmountMicroStx)
                : '—'
            }
          />
        </InfoGrid.Cell>
        <InfoGrid.Cell>
          <ValueDisplayerWithLoader
            name={<PostLabelHoverCard postKey="historical-yield" label={(content.posts as Record<string, any>)["historical-yield"]?.Title || "APR"} textStyle="label.03" />}
            isLoading={fakeLoading}
           
            value={activePoolRewardProtocolInfo.apr}
         
          />
        </InfoGrid.Cell>
        <InfoGrid.Cell>
          <ValueDisplayerWithLoader
           
            name={<PostLabelHoverCard postKey="pooled-stacking-upcoming-rewards" label={(content.posts as Record<string, any>)["pooled-stacking-upcoming-rewards"]?.Title || "Next rewards"} textStyle="label.03" />}
           
            isLoading={fakeLoading}
           
            value={`~${toHumanReadableDays(activePoolRewardProtocolInfo.nextCycleDays)}`}
         
          />
        </InfoGrid.Cell>
        <InfoGrid.Cell>
          <ValueDisplayerWithCustomLoader
            name={<PostLabelHoverCard postKey="stacking-rewards-tokens" label={(content.posts as Record<string, any>)["stacking-rewards-tokens"]?.Title || "Rewards token"} textStyle="label.03" />}
            isLoading={fakeLoading}
            value={
              <Flex gap="space.02" alignItems="center">
                {activePoolRewardProtocolInfo.rewardTokenIcon}
                {activePoolRewardProtocolInfo.rewardsToken}
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

      {!activePoolRewardProtocolInfo.id && (
        <styled.p textStyle="caption.01" color="ink.text-subdued">
          <Flag
            img={<QuestionCircleIcon variant="small" color={'inherit' as any} />}
            spacing="space.01"
          >
            {content.stacking.unpoolingInfo}
          </Flag>
        </styled.p>
      )}
    </Stack>
  );
}
