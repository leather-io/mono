import type { ReactNode } from 'react';

import { Box, Flex, Stack, styled } from 'leather-styles/jsx';

import { ArrowRotateRightLeftIcon, Callout, InfoCircleIcon } from '@leather.io/ui';

import { CollectiblesEmpty } from './collectibles-empty';
import { CollectiblesLearn } from './collectibles-learn';
import { CollectiblesLoading } from './collectibles-loading';
import { CollectiblesMarketplaces } from './collectibles-marketplaces';

interface CollectiblesLayoutProps {
  children: ReactNode;
  amount: number;
  isLoading: boolean;
  hasCollectibles: boolean;
  isError: boolean;
  onRefresh(): void;
  isRefetching: boolean;
}

export function CollectiblesLayout({
  amount,
  children,
  isLoading,
  hasCollectibles,
  isError,
  onRefresh,
  isRefetching,
}: CollectiblesLayoutProps) {
  return (
    <Stack gap="space.04">
      <Flex
        alignItems="center"
        justifyContent="space-between"
        px={[0, null, 'space.05']}
        py="space.05"
        width="100%"
      >
        <Stack gap="space.01">
          <Flex alignItems="center" gap="space.01">
            <styled.span textStyle="label.03" margin="0">
              Amount
            </styled.span>
            <InfoCircleIcon color="ink.text-subdued" variant="small" />
          </Flex>
          <styled.h2 textStyle="heading.05" margin="0">
            {amount}
          </styled.h2>
        </Stack>

        <styled.button
          type="button"
          height="40px"
          width="40px"
          display="flex"
          alignItems="center"
          justifyContent="center"
          borderRadius="999px"
          border="default"
          bg="ink.background-primary"
          _hover={
            isRefetching ? undefined : { bg: 'ink.component-background-hover', cursor: 'pointer' }
          }
          onClick={onRefresh}
          disabled={isRefetching}
          aria-label="Refresh collectibles"
        >
          <ArrowRotateRightLeftIcon variant="small" />
        </styled.button>
      </Flex>

      {isError && (
        <Box px={[0, null, 'space.05']}>
          <Callout variant="warning" title="Unable to load collectibles">
            Try refreshing to fetch the latest gallery.
          </Callout>
        </Box>
      )}

      {isLoading && <CollectiblesLoading />}

      {!isLoading && !isError && !hasCollectibles && (
        <Box px={[0, null, 'space.05']}>
          <CollectiblesEmpty />
        </Box>
      )}

      {!isLoading && !isError && hasCollectibles ? (
        <Box width={['calc(100% + 48px)', null, '100%']} marginX={['-24px', null, 0]}>
          <styled.div
            display="grid"
            gridTemplateColumns={['repeat(2, 195px)', null, 'repeat(4, 195px)']}
            justifyContent="center"
          >
            {children}
          </styled.div>
        </Box>
      ) : null}

      {!isLoading && !isError ? (
        <Stack gap="space.04" px={[0, null, 'space.05']}>
          <CollectiblesMarketplaces />
          <CollectiblesLearn />
        </Stack>
      ) : null}
    </Stack>
  );
}
