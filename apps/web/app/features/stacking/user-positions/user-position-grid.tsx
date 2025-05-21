import { ReactNode } from 'react';

import { css } from 'leather-styles/css';
import { Box, Flex, VStack, styled } from 'leather-styles/jsx';
import { InfoGrid } from '~/components/info-grid/info-grid';
import {
  ValueDisplayerWithCustomLoader,
  ValueDisplayerWithLoader,
} from '~/components/value-displayer/value-displayer-with-loader';

import {
  ChevronDownIcon,
  CloseIcon,
  DropdownMenu,
  Flag,
  InfoCircleIcon,
  PlusIcon,
  SkeletonLoader,
} from '@leather.io/ui';

interface UserPositionGridProps {
  isLoading: boolean;
  name: string;
  logo?: ReactNode;
  poolSlug?: string;
  amount?: string;
  apr?: string | null;
  nextReward?: string;
  rewardTokenIcon?: React.ReactNode;
  rewardTokenSymbol?: string;
  onViewDetails?: () => void;
  onIncrease?: () => void;
  onStopPooling?: () => void;
}

export function UserPositionGrid({
  isLoading,
  name,
  logo,
  poolSlug,
  amount,
  apr,
  nextReward,
  rewardTokenIcon,
  rewardTokenSymbol,
  onViewDetails,
  onIncrease,
  onStopPooling,
}: UserPositionGridProps) {
  const hasMenu = onViewDetails || onIncrease || onStopPooling;

  return (
    <InfoGrid
      width="100%"
      gridTemplateColumns={['repeat(auto-fit, minmax(210px, 1fr))']}
      gridTemplateRows="auto"
      height="fit-content"
      className={css({ '& > *:not(:first-child)': { height: 'unset' } })}
    >
      <InfoGrid.Cell>
        <VStack gap="space.05" alignItems="left" p="space.05">
          <SkeletonLoader width="32" height="32" isLoading={isLoading}>
            {logo}
          </SkeletonLoader>

          <SkeletonLoader height="15" width="80" isLoading={isLoading}>
            {poolSlug && hasMenu ? (
              <DropdownMenu.Root>
                <DropdownMenu.Trigger>
                  <Flag reverse img={<ChevronDownIcon variant="small" />} spacing="space.01">
                    <styled.h4 userSelect="none" textStyle="label.01" textAlign="left">
                      {name}
                    </styled.h4>
                  </Flag>
                </DropdownMenu.Trigger>
                <DropdownMenu.Content align="start">
                  <Box p="space.02" textStyle="label.02">
                    {onViewDetails && (
                      <DropdownMenu.Item onSelect={() => onViewDetails()}>
                        <Flag img={<InfoCircleIcon variant="small" />}>View position details</Flag>
                      </DropdownMenu.Item>
                    )}
                    {onIncrease && (
                      <DropdownMenu.Item onSelect={() => onIncrease()}>
                        <Flag img={<PlusIcon variant="small" />}>Increase pooling amount</Flag>
                      </DropdownMenu.Item>
                    )}
                    {onStopPooling && (
                      <DropdownMenu.Item onSelect={() => onStopPooling()}>
                        <Flag
                          color="red.action-primary-default"
                          img={<CloseIcon color="red.action-primary-default" variant="small" />}
                        >
                          Stop pooling
                        </Flag>
                      </DropdownMenu.Item>
                    )}
                  </Box>
                </DropdownMenu.Content>
              </DropdownMenu.Root>
            ) : (
              <styled.h4 textStyle="label.01">{name ?? 'Unknown pool'}</styled.h4>
            )}
          </SkeletonLoader>
        </VStack>
      </InfoGrid.Cell>

      <InfoGrid.Cell>
        <ValueDisplayerWithLoader name="Amount" isLoading={isLoading} value={amount ?? '—'} />
      </InfoGrid.Cell>

      <InfoGrid.Cell>
        <ValueDisplayerWithLoader name="APR" isLoading={isLoading} value={apr ?? '—'} />
      </InfoGrid.Cell>

      <InfoGrid.Cell>
        <ValueDisplayerWithLoader
          name="Next rewards"
          isLoading={isLoading}
          value={nextReward ?? '—'}
        />
      </InfoGrid.Cell>

      <InfoGrid.Cell>
        <ValueDisplayerWithCustomLoader
          name="Rewards token"
          isLoading={isLoading}
          value={
            <Flex gap="space.02" alignItems="center">
              {rewardTokenIcon}
              {rewardTokenSymbol ?? '—'}
            </Flex>
          }
          customSkeletonLayout={
            <Flex gap="space.02" alignItems="center">
              <SkeletonLoader height="24" width="24" borderRadius="round" isLoading={isLoading} />
              <SkeletonLoader height="15" width="80" isLoading={isLoading} />
            </Flex>
          }
        />
      </InfoGrid.Cell>
    </InfoGrid>
  );
}
