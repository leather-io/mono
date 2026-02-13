import type { ReactNode } from 'react';

import { Box, Flex, Stack, styled } from 'leather-styles/jsx';

import {
  ArrowRotateClockwiseIcon,
  Callout,
  DropdownMenu,
  InfoCircleIcon,
  ItemLayout,
  LockIcon,
  SettingsSliderIcon,
  TrashIcon,
} from '@leather.io/ui';

import { useCurrentAccountDiscardedInscriptions } from '@app/store/settings/settings.selectors';

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
}

export function CollectiblesLayout({
  amount,
  children,
  isLoading,
  hasCollectibles,
  isError,
  onRefresh,
}: CollectiblesLayoutProps) {
  const { recoverAllInscriptions, discardAllInscriptions } =
    useCurrentAccountDiscardedInscriptions();
  const showHeader = !isLoading && hasCollectibles;

  return (
    <Stack gap="space.04">
      {showHeader && (
        <Flex
          alignItems="center"
          justifyContent="space-between"
          px={{ base: 0, md: 'space.05' }}
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

          <DropdownMenu.Root>
            <DropdownMenu.Trigger asChild>
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
                _hover={{ bg: 'ink.component-background-hover', cursor: 'pointer' }}
                aria-label="Manage collectibles"
                data-testid="manage-collectibles-btn"
              >
                <SettingsSliderIcon variant="small" />
              </styled.button>
            </DropdownMenu.Trigger>
            <DropdownMenu.Portal>
              <DropdownMenu.Content align="end" sideOffset={8}>
                <DropdownMenu.Item onSelect={onRefresh} data-testid="refresh-collectibles">
                  <ItemLayout
                    titleLeft="Refresh"
                    titleRight=""
                    captionLeft=""
                    img={<ArrowRotateClockwiseIcon />}
                  />
                </DropdownMenu.Item>
                <DropdownMenu.Item
                  onSelect={recoverAllInscriptions}
                  data-testid="recover-all-inscriptions"
                >
                  <ItemLayout
                    titleLeft="Recover all inscriptions"
                    titleRight=""
                    captionLeft=""
                    img={<LockIcon />}
                  />
                </DropdownMenu.Item>
                <DropdownMenu.Item
                  onSelect={discardAllInscriptions}
                  data-testid="unprotect-all-inscriptions"
                >
                  <ItemLayout
                    titleLeft={
                      <styled.span color="red.action-primary-default">
                        Unprotect all inscriptions
                      </styled.span>
                    }
                    titleRight=""
                    captionLeft=""
                    img={<TrashIcon color="red.action-primary-default" />}
                  />
                </DropdownMenu.Item>
              </DropdownMenu.Content>
            </DropdownMenu.Portal>
          </DropdownMenu.Root>
        </Flex>
      )}

      {isError && (
        <Box px={{ base: 0, md: 'space.05' }}>
          <Callout variant="warning" title="Unable to load collectibles">
            Try refreshing to fetch the latest gallery.
          </Callout>
        </Box>
      )}

      {isLoading && <CollectiblesLoading />}

      {!isLoading && !isError && !hasCollectibles && (
        <Box px={{ base: 0, md: 'space.05' }}>
          <CollectiblesEmpty />
        </Box>
      )}

      {!isLoading && !isError && hasCollectibles ? (
        <Box width="100%">
          <styled.div
            display="grid"
            gridTemplateColumns={{
              base: 'repeat(2, 1fr)',
              md: 'repeat(auto-fill, minmax(180px, 1fr))',
            }}
          >
            {children}
          </styled.div>
        </Box>
      ) : null}

      {!isLoading && !isError && hasCollectibles && (
        <Stack gap="space.04">
          <CollectiblesMarketplaces />
          <CollectiblesLearn />
        </Stack>
      )}
    </Stack>
  );
}
