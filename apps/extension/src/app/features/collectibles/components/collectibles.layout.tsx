import type { ReactNode } from 'react';

import { styled } from 'leather-styles/jsx';

import { ArrowRotateRightLeftIcon, Callout } from '@leather.io/ui';

import { CollectiblesEmpty } from './collectibles-empty';
import { CollectiblesLoading } from './collectibles-loading';

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
    <styled.section display="flex" flexDirection="column" gap="space.04">
      <styled.div display="flex" alignItems="center" justifyContent="space-between">
        <styled.div
          display="flex"
          alignItems="center"
          justifyContent="space-between"
          alignSelf="stretch"
          flexDirection="column"
        >
          <styled.span textStyle="label.03" margin="0">
            Amount
          </styled.span>
          <styled.h2 textStyle="heading.05" margin="0">
            {amount}
          </styled.h2>
        </styled.div>
        {/* TODO - add amount here and filter menu  */}

        <styled.button
          type="button"
          px="space.02"
          py="space.01"
          onClick={onRefresh}
          disabled={isRefetching}
        >
          <ArrowRotateRightLeftIcon variant="small" />
        </styled.button>
      </styled.div>

      {isLoading && <CollectiblesLoading />}

      {isError && (
        <Callout variant="warning" title="Unable to load collectibles">
          Try refreshing to fetch the latest gallery.
        </Callout>
      )}

      {!isLoading && !isError && !hasCollectibles && <CollectiblesEmpty />}

      <styled.div
        display="grid"
        gridTemplateColumns="repeat(auto-fill, minmax(195px, 195px))"
        // gap="space.04"
      >
        {children}
      </styled.div>
    </styled.section>
  );
}
