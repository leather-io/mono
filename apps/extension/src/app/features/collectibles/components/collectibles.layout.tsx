import type { ReactNode } from 'react';

import { Box, Flex, Stack, styled } from 'leather-styles/jsx';

import {
  ArrowRotateClockwiseIcon,
  Callout,
  DropdownMenu,
  Flag,
  IconButton,
  InfoCircleIcon,
  ItemLayout,
  LockIcon,
  SettingsSliderIcon,
  TrashIcon,
} from '@leather.io/ui';

import { useCurrentAccountDiscardedInscriptions } from '@app/store/settings/settings.selectors';
import { BasicTooltip } from '@app/ui/components/tooltip/basic-tooltip';

import { CollectiblesEmpty } from './collectibles-empty';
import { CollectiblesLearn } from './collectibles-learn';
import { CollectiblesLoading } from './collectibles-loading';
import { CollectiblesMarketplaces } from './collectibles-marketplaces';

interface CollectiblesLayoutProps {
  children: ReactNode;
  amount: number;
  isLoading: boolean;
  isFetching: boolean;
  hasCollectibles: boolean;
  isError: boolean;
  onRefresh(): void;
}

export function CollectiblesLayout({
  amount,
  children,
  isLoading,
  isFetching,
  hasCollectibles,
  isError,
  onRefresh,
}: CollectiblesLayoutProps) {
  const { recoverAllInscriptions, discardAllInscriptions } =
    useCurrentAccountDiscardedInscriptions();
  const isReady = !isLoading && !isError;
  const showLoading = isLoading || (isFetching && hasCollectibles);
  const showEmpty = isReady && !isFetching && !hasCollectibles;
  const showGrid = isReady && hasCollectibles;

  return (
    <Stack gap="space.04" flex={1}>
      {showGrid && (
        <Flex justifyContent="space-between" alignItems="flex-start">
          <Box>
            <BasicTooltip
              side="right"
              label="Total collectibles in this account, including: Stacks NFTs, BNS names, Stamps and Ordinal Inscriptions on Bitcoin."
            >
              <Flag
                reverse
                spacing="space.01"
                img={<InfoCircleIcon color="ink.text-subdued" display="inline" variant="small" />}
              >
                <styled.span textStyle="label.02">Amount</styled.span>
              </Flag>
            </BasicTooltip>
            <Box pt="space.01">
              <styled.h2 textStyle="heading.05">{amount}</styled.h2>
            </Box>
          </Box>

          <DropdownMenu.Root>
            <DropdownMenu.Trigger asChild>
              <IconButton
                icon={<SettingsSliderIcon variant="small" />}
                aria-label="Manage collectibles"
                data-testid="manage-collectibles-btn"
                width="40px"
                height="40px"
              />
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
        <Box px={[0, 'space.05']}>
          <Callout variant="warning" title="Unable to load collectibles">
            Try refreshing to fetch the latest gallery.
          </Callout>
        </Box>
      )}

      {showLoading && <CollectiblesLoading />}

      {showEmpty && <CollectiblesEmpty />}

      {showGrid ? (
        <Box width="100%" borderRadius="xs" overflow="hidden">
          <styled.div
            display="grid"
            gridTemplateColumns={['repeat(2, 1fr)', 'repeat(auto-fill, minmax(180px, 1fr))']}
          >
            {children}
          </styled.div>
        </Box>
      ) : null}

      {isReady && (
        <Stack gap="space.04">
          <CollectiblesMarketplaces />
          <CollectiblesLearn />
        </Stack>
      )}
    </Stack>
  );
}
