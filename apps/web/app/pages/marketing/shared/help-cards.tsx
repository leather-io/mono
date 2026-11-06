import { type ReactElement } from 'react';
import { Link } from 'react-router';

import { Box, Grid, type HTMLStyledProps, styled } from 'leather-styles/jsx';

import { GlassesIcon, SupportIcon, TerminalIcon } from '@leather.io/ui';

const StyledLink = styled(Link);

interface HelpCard {
  title: string;
  description: string;
  href: string;
  icon: ReactElement;
}

const helpCards: HelpCard[] = [
  {
    title: 'Help',
    description: 'Quick answers and support for common questions.',
    href: '/support',
    icon: <SupportIcon />,
  },
  {
    title: 'Guides',
    description: 'Simple walkthroughs to get you started.',
    href: '/support',
    icon: <GlassesIcon />,
  },
  {
    title: 'Developers',
    description: 'Docs and tools to help you build faster.',
    href: '/developers',
    icon: <TerminalIcon />,
  },
];

/**
 * The Help / Guides / Developers strip shared by /developers and the not-found page.
 * Three bordered cells on desktop; a stacked list (icon left) on mobile.
 */
export function HelpCards(props: HTMLStyledProps<'nav'>) {
  return (
    <styled.nav aria-label="Get help" {...props}>
      <Grid
        gridTemplateColumns={['1fr', null, 'repeat(3, 1fr)']}
        gap="0"
        borderY="1px solid"
        borderColor="ink.border-default"
      >
        {helpCards.map((card, index) => (
          <StyledLink
            key={card.title}
            to={card.href}
            prefetch="intent"
            display="flex"
            flexDir={['row', null, 'column']}
            alignItems={['center', null, 'flex-start']}
            gap={['space.04', null, '0']}
            p={['space.05', null, 'space.07']}
            minHeight={[null, null, '224px']}
            borderTop={[index > 0 ? '1px solid {colors.ink.border-default}' : 'none', null, 'none']}
            borderLeft={[
              'none',
              null,
              index > 0 ? '1px solid {colors.ink.border-default}' : 'none',
            ]}
            transition="background 120ms ease"
            _hover={{ bg: 'ink.component-background-hover' }}
            _focusVisible={{
              outline: '2px solid',
              outlineColor: 'blue.border',
              outlineOffset: '-2px',
            }}
          >
            <Box
              display="flex"
              alignItems="center"
              justifyContent="center"
              flexShrink={0}
              width="48px"
              height="48px"
              bg="ink.background-secondary"
              borderRadius="xs"
              aria-hidden
            >
              {card.icon}
            </Box>
            <Box mt={[null, null, 'auto']} pt={[null, null, 'space.07']}>
              <styled.h3 textStyle="heading.05" fontWeight="400">
                {card.title}
              </styled.h3>
              <styled.p textStyle="caption.01" color="ink.text-secondary">
                {card.description}
              </styled.p>
            </Box>
          </StyledLink>
        ))}
      </Grid>
    </styled.nav>
  );
}
