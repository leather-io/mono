import { ReactNode } from 'react';

import { Box, Flex, styled } from 'leather-styles/jsx';
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
  Link,
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
  onViewDetails?(): void;
  onIncrease?(): void;
  onStopPooling?(): void;
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
    >
      <InfoGrid.Cell>
        <Flex flex={1} flexDir="column" justifyContent="space-between" gap="space.06" p="space.05">
          <SkeletonLoader height="16" width="120" isLoading={isLoading}>
            <Flex alignItems="center" gap="space.02" height="16px" overflow="visible">
              {logo}
              <styled.h4 color="ink.text-subdued" textStyle="label.03">
                {name ?? 'Unknown pool'}
              </styled.h4>
            </Flex>
          </SkeletonLoader>

          <SkeletonLoader width="120" height="15" isLoading={isLoading}>
            {hasMenu && poolSlug ? (
              <DropdownMenu.Root>
                <DropdownMenu.Trigger asChild>
                  <Link
                    _before={{ bg: 'transparent' }}
                    _hover={{ color: 'ink.action-primary-hover' }}
                    variant="text"
                    maxWidth="fit-content"
                  >
                    <Flex alignItems="center" gap="space.01">
                      <styled.span textStyle="label.01">Manage position</styled.span>
                      <ChevronDownIcon variant="small" />
                    </Flex>
                  </Link>
                </DropdownMenu.Trigger>
                <DropdownMenu.Portal>
                  <DropdownMenu.Content align="start" side="bottom" sideOffset={4}>
                    <Box p="space.02" textStyle="label.02">
                      {onViewDetails && (
                        <DropdownMenu.Item onSelect={() => onViewDetails()}>
                          <Flag img={<InfoCircleIcon variant="small" />}>
                            View position details
                          </Flag>
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
                </DropdownMenu.Portal>
              </DropdownMenu.Root>
            ) : null}
          </SkeletonLoader>
        </Flex>
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
