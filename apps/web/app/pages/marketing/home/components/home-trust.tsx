import { type ReactElement } from 'react';

import { Box, Grid, styled } from 'leather-styles/jsx';
import { Reveal } from '~/pages/marketing/shared/reveal';

import { MagnifyingGlassIcon, PulseIcon, ShieldIcon } from '@leather.io/ui';

import { HomeSection, HomeSectionHeading } from './home-layout';

interface TrustCard {
  title: string;
  description: string;
  href: string;
  icon: ReactElement;
  image: string;
  imageAlt: string;
}

const trustCards: TrustCard[] = [
  {
    title: 'Open source by design',
    description: 'Explore Leather’s public code, review changes, and see how the wallet is built.',
    href: 'https://github.com/leather-io/mono',
    icon: <MagnifyingGlassIcon variant="small" />,
    image: '/marketing/home/trust-github.webp',
    imageAlt: 'GitHub',
  },
  {
    title: 'A published extension audit',
    description:
      'Least Authority audited the Hiro Stacks Wallet browser extension in 2021. Read the report for its scope and findings.',
    href: 'https://leastauthority.com/blog/audit-of-hiros-stacks-wallet/',
    icon: <ShieldIcon variant="small" />,
    image: '/marketing/home/trust-least-authority.webp',
    imageAlt: 'Least Authority',
  },
  {
    title: 'Report a security issue',
    description:
      'Found a vulnerability? Follow our disclosure instructions or contact security@leather.io privately.',
    href: 'https://github.com/leather-io/mono/tree/dev/apps/extension#security',
    icon: <PulseIcon variant="small" />,
    image: '/marketing/home/trust-github.webp',
    imageAlt: 'Security reporting instructions on GitHub',
  },
];

export function HomeTrust() {
  return (
    <HomeSection aria-labelledby="home-trust-heading">
      <Reveal>
        <HomeSectionHeading
          id="home-trust-heading"
          lines={['Built on trust.', 'Safety by design.']}
        />
      </Reveal>
      <Grid
        gridTemplateColumns={['1fr', null, null, 'repeat(3, 1fr)']}
        gap="0"
        mt="space.07"
        border="1px solid"
        borderColor="ink.border-default"
        borderRadius="sm"
        overflow="hidden"
      >
        {trustCards.map((card, index) => (
          <styled.a
            key={card.title}
            href={card.href}
            target="_blank"
            rel="noopener noreferrer"
            className="group"
            display="flex"
            flexDir="column"
            p={['space.05', null, 'space.06']}
            pt={['space.05', null, 'space.07']}
            borderTop={[
              index > 0 ? '1px solid {colors.ink.border-default}' : 'none',
              null,
              null,
              'none',
            ]}
            borderLeft={[
              'none',
              null,
              null,
              index > 0 ? '1px solid {colors.ink.border-default}' : 'none',
            ]}
            transition="background-color 0.45s cubic-bezier(0.25, 1, 0.5, 1)"
            _hover={{ bg: 'ink.background-secondary' }}
            _motionReduce={{ transition: 'none' }}
            _focusVisible={{
              outline: '2px solid',
              outlineColor: 'blue.border',
              outlineOffset: '-2px',
            }}
          >
            <Box aria-hidden>{card.icon}</Box>
            <styled.h3 textStyle="heading.05" fontWeight="400" mt="space.05">
              {card.title}
            </styled.h3>
            <styled.p
              textStyle="body.02"
              lineHeight="24px"
              color="ink.text-secondary"
              mt="space.01"
            >
              {card.description}
            </styled.p>
            <styled.span
              alignSelf="flex-start"
              mt="space.05"
              textStyle="label.01"
              fontWeight="400"
              borderBottom="1px solid"
              borderColor="ink.border-default"
              _groupHover={{ borderColor: 'ink.text-primary' }}
            >
              Learn more <styled.span aria-hidden>↗</styled.span>
              <styled.span srOnly> (opens in a new tab)</styled.span>
            </styled.span>
            <styled.img
              src={card.image}
              alt={card.imageAlt}
              width="100%"
              height="auto"
              style={{ aspectRatio: '334 / 192' }}
              mt="space.06"
              loading="lazy"
            />
          </styled.a>
        ))}
      </Grid>
    </HomeSection>
  );
}
