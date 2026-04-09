import { type ReactNode, useState } from 'react';

import { SettingsSelectors } from '@tests/selectors/settings.selectors';
import { Box, Flex, Stack, styled } from 'leather-styles/jsx';

import {
  ArrowRotateClockwiseIcon,
  Callout,
  DropdownMenu,
  Flag,
  IconButton,
  InfoCircleIcon,
  ItemLayout,
  SettingsSliderIcon,
} from '@leather.io/ui';

import { analytics } from '@shared/utils/analytics';

import { ManageInscriptionsSheet } from '@app/features/manage-inscriptions/manage-inscriptions-sheet';
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
  hasInscriptions: boolean;
  isError: boolean;
  onRefresh(): void;
}

export function CollectiblesLayout({
  amount,
  children,
  isLoading,
  isFetching,
  hasCollectibles,
  hasInscriptions,
  isError,
  onRefresh,
}: CollectiblesLayoutProps) {
  const isReady = !isLoading && !isError;
  const showLoading = isLoading || (isFetching && hasCollectibles);
  const showEmpty = isReady && !isFetching && !hasCollectibles;
  const showGrid = isReady && hasCollectibles;

  const [showManageInscriptions, setShowManageInscriptions] = useState(false);
  return (
    <>
      <Stack gap="space.05" flex={1} pb="space.08">
        {hasInscriptions && (
          <Callout variant="warning" title="Ordinals support ending May 16">
            Please transfer your Ordinals to another wallet before this date.
          </Callout>
        )}
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
                <DropdownMenu.Content align="end" sideOffset={8} minWidth="272px">
                  <DropdownMenu.Item onSelect={onRefresh} data-testid="refresh-collectibles">
                    <ItemLayout
                      titleLeft="Refresh"
                      titleRight=""
                      captionLeft=""
                      img={<ArrowRotateClockwiseIcon />}
                    />
                  </DropdownMenu.Item>
                  <DropdownMenu.Item
                    onSelect={() => {
                      analytics.track('click_manage_inscriptions');
                      setShowManageInscriptions(true);
                    }}
                    data-testid={SettingsSelectors.ManageInscriptions}
                  >
                    <ItemLayout
                      titleLeft="Manage inscriptions"
                      titleRight=""
                      captionLeft=""
                      img={<SettingsSliderIcon />}
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
          <Box
            width="auto"
            mx={['-space.05', null, 0]}
            borderRadius={[0, null, 'xs']}
            overflow="hidden"
          >
            <styled.div
              display="grid"
              gridTemplateColumns={['repeat(2, 1fr)', 'repeat(auto-fill, minmax(180px, 1fr))']}
            >
              {children}
            </styled.div>
          </Box>
        ) : null}

        {isReady && (
          <Stack gap="space.05" pt="space.06">
            <CollectiblesMarketplaces />
            <CollectiblesLearn />
          </Stack>
        )}
      </Stack>
      {showManageInscriptions && (
        <ManageInscriptionsSheet
          isShowing={showManageInscriptions}
          onClose={() => setShowManageInscriptions(false)}
        />
      )}
    </>
  );
}
