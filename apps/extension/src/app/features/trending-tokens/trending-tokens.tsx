import { useCallback, useMemo, useRef, useState } from 'react';

import { css } from 'leather-styles/css';
import { Box, Flex, Stack, styled } from 'leather-styles/jsx';

import { prepTrendingItems } from '@leather.io/features';
import { ArrowLeftIcon, IconButton, InfoCircleIcon } from '@leather.io/ui';

import { useViewportMinWidth } from '@app/common/hooks/use-media-query';
import { useTrendingTokensQuery } from '@app/query/asset-list/trending-tokens.query';
import { BasicTooltip } from '@app/ui/components/tooltip/basic-tooltip';

import { TrendingTokenCard } from './trending-token-card';

const scrollAmount = 300;

const hideScrollbar = css({
  scrollbarWidth: 'none',
  '&::-webkit-scrollbar': { display: 'none' },
});

export function TrendingTokens() {
  const { data: trendingTokenData } = useTrendingTokensQuery();
  const scrollRef = useRef<HTMLDivElement>(null);
  const isLargeScreen = useViewportMinWidth('md');
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  const updateScrollState = useCallback(() => {
    const el = scrollRef.current;
    if (!el) return;
    setCanScrollLeft(el.scrollLeft > 0);
    setCanScrollRight(el.scrollLeft + el.clientWidth < el.scrollWidth - 1);
  }, []);

  const rows = useMemo(
    () => (trendingTokenData ? prepTrendingItems(trendingTokenData.items) : []),
    [trendingTokenData]
  );

  if (rows.length === 0) return null;

  function scrollLeft() {
    scrollRef.current?.scrollBy({ left: -scrollAmount, behavior: 'smooth' });
  }

  function scrollRight() {
    scrollRef.current?.scrollBy({ left: scrollAmount, behavior: 'smooth' });
  }

  function getArrowColor(isEnabled: boolean) {
    return isEnabled ? 'ink.action-primary-default' : 'ink.text-non-interactive';
  }

  return (
    <Stack gap="space.03">
      <Flex justifyContent="space-between" alignItems="center">
        <Flex alignItems="center" gap="space.01">
          <styled.span textStyle="label.02">Trending tokens</styled.span>
          <BasicTooltip
            label="Tokens trending across the Stacks ecosystem, ranked by recent trading activity."
            side={isLargeScreen ? 'right' : 'top'}
          >
            <InfoCircleIcon color="ink.text-subdued" variant="small" />
          </BasicTooltip>
        </Flex>
        {!isLargeScreen && (
          <Flex gap="space.01">
            <IconButton
              icon={<ArrowLeftIcon variant="small" color={getArrowColor(canScrollLeft)} />}
              onClick={scrollLeft}
            />
            <IconButton
              icon={
                <ArrowLeftIcon
                  variant="small"
                  color={getArrowColor(canScrollRight)}
                  style={{ transform: 'rotate(180deg)' }}
                />
              }
              onClick={scrollRight}
            />
          </Flex>
        )}
      </Flex>
      <Box overflowX="auto" ref={scrollRef} className={hideScrollbar} onScroll={updateScrollState}>
        <Flex gap="space.02" direction="column">
          {rows.map(row => (
            <Flex key={row[0].id} gap="space.02">
              {row.map(item => (
                <TrendingTokenCard key={item.id} item={item} />
              ))}
            </Flex>
          ))}
        </Flex>
      </Box>
    </Stack>
  );
}
