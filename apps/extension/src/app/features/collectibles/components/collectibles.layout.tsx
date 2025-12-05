import type { ReactNode } from 'react';

import { styled } from 'leather-styles/jsx';

import { ArrowRotateRightLeftIcon, Callout } from '@leather.io/ui';

import { CollectiblesEmpty } from './collectibles-empty';
import { CollectiblesLoading } from './collectibles-loading';

interface CollectiblesLayoutProps {
  children: ReactNode;
  isLoading: boolean;
  hasCollectibles: boolean;
  isError: boolean;
  onRefresh(): void;
  isRefetching: boolean;
}

export function CollectiblesLayout({
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
        <styled.h2 textStyle="heading.04" margin="0">
          Collectibles
        </styled.h2>
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
        gridTemplateColumns="repeat(auto-fill, minmax(156px, 1fr))"
        gap="space.04"
      >
        {children}
      </styled.div>
    </styled.section>
  );
}
