import { useCallback, useEffect, useRef, useState } from 'react';
import { Link } from 'react-router';

import { css, cx } from 'leather-styles/css';
import { Box, Flex, styled } from 'leather-styles/jsx';

import { ChevronLeftIcon, ChevronRightIcon } from '@leather.io/ui';

import { type FeaturedApp } from '../apps.data';

const cardLinkStyles = css({
  position: 'relative',
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'flex-end',
  height: '100%',
  overflow: 'hidden',
  borderRadius: 'sm',
  bg: 'ink.background-primary',
  color: 'ink.text-primary',
  _focusVisible: { outline: '3px solid', outlineColor: 'blue.border', outlineOffset: '-3px' },
});

const coverStyles = css({
  position: 'absolute',
  top: 0,
  left: 0,
  width: '100%',
  height: '70%',
  objectFit: 'cover',
  objectPosition: 'center top',
  transition: 'transform 0.4s cubic-bezier(0.2, 0, 0, 1)',
  _groupHover: { transform: 'scale(1.03)' },
  _motionReduce: { transition: 'none', _groupHover: { transform: 'none' } },
});

const navButtonStyles = css({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  width: '40px',
  height: '40px',
  borderRadius: 'round',
  border: 'default',
  bg: 'ink.background-primary',
  color: 'ink.text-primary',
  transition: 'background-color 120ms ease, opacity 120ms ease',
  _hover: { bg: 'ink.component-background-hover' },
  _disabled: { opacity: 0.35, cursor: 'default', _hover: { bg: 'ink.background-primary' } },
  _focusVisible: { outline: '2px solid', outlineColor: 'blue.border', outlineOffset: '2px' },
});

function FeaturedAppCard({ app }: { app: FeaturedApp }) {
  return (
    <Link to={`/posts/${app.postSlug}`} className={cx('group', 'dark', cardLinkStyles)}>
      <img
        src={app.cover.src}
        alt=""
        width={app.cover.width}
        height={app.cover.height}
        loading="lazy"
        decoding="async"
        className={coverStyles}
      />
      <Box
        position="absolute"
        inset="0"
        bgImage="linear-gradient(to bottom, transparent 30%, token(colors.ink.background-primary) 68%)"
        aria-hidden="true"
      />
      <Box position="relative" p="space.05" pt="0">
        <styled.img
          src={app.logo}
          alt=""
          htmlWidth={40}
          htmlHeight={40}
          w="40px"
          h="40px"
          borderRadius="round"
          bg="white"
          objectFit="cover"
          loading="lazy"
        />
        <styled.h3 textStyle="label.01" fontWeight={400} mt="space.03">
          {app.name}
        </styled.h3>
        <Flex alignItems="flex-end" gap="space.04" mt="space.02">
          <styled.p textStyle="caption.01" lineHeight="16px" color="ink.text-secondary" flex="1">
            {app.description}
          </styled.p>
          <styled.span
            aria-hidden="true"
            textStyle="label.01"
            transform="rotate(45deg)"
            mb="space.01"
          >
            ↑
          </styled.span>
        </Flex>
      </Box>
    </Link>
  );
}

function prefersReducedMotion() {
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

/** Horizontal scroll-snap row of featured app cards, with previous/next buttons. */
export function FeaturedAppsCarousel({ apps }: { apps: FeaturedApp[] }) {
  const listRef = useRef<HTMLUListElement>(null);
  const [canScroll, setCanScroll] = useState({ back: false, forward: true });

  const updateScrollState = useCallback(() => {
    const list = listRef.current;
    if (!list) return;
    setCanScroll({
      back: list.scrollLeft > 4,
      forward: list.scrollLeft + list.clientWidth < list.scrollWidth - 4,
    });
  }, []);

  useEffect(() => {
    updateScrollState();
    window.addEventListener('resize', updateScrollState);
    return () => window.removeEventListener('resize', updateScrollState);
  }, [updateScrollState]);

  function scrollByPage(direction: 1 | -1) {
    const list = listRef.current;
    if (!list) return;
    list.scrollBy({
      left: direction * list.clientWidth * 0.8,
      behavior: prefersReducedMotion() ? 'auto' : 'smooth',
    });
  }

  return (
    <Box>
      <styled.ul
        ref={listRef}
        onScroll={updateScrollState}
        display="grid"
        gridAutoFlow="column"
        gridAutoColumns={['78%', '260px', '300px']}
        gap="space.03"
        overflowX="auto"
        scrollSnapType="x mandatory"
        overscrollBehaviorX="contain"
        scrollbarWidth="none"
        css={{ '&::-webkit-scrollbar': { display: 'none' } }}
        aria-label="Featured apps"
      >
        {apps.map(app => (
          <styled.li key={app.slug} scrollSnapAlign="start" aspectRatio="1" minH="260px">
            <FeaturedAppCard app={app} />
          </styled.li>
        ))}
      </styled.ul>
      <Flex justifyContent="flex-end" gap="space.02" mt="space.04">
        <button
          type="button"
          className={navButtonStyles}
          onClick={() => scrollByPage(-1)}
          disabled={!canScroll.back}
          aria-label="Previous featured apps"
        >
          <ChevronLeftIcon variant="small" color="current" />
        </button>
        <button
          type="button"
          className={navButtonStyles}
          onClick={() => scrollByPage(1)}
          disabled={!canScroll.forward}
          aria-label="Next featured apps"
        >
          <ChevronRightIcon variant="small" color="current" />
        </button>
      </Flex>
    </Box>
  );
}
