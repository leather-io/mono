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
    description:
      'Transparent by design. Community-tested and reviewed to ensure the highest level of safety.',
    href: 'https://github.com/leather-io',
    icon: <MagnifyingGlassIcon variant="small" />,
    image: '/marketing/home/trust-github.webp',
    imageAlt: 'GitHub',
  },
  {
    title: 'Audited by Least Authority',
    description: 'Reviewed by one of the most respected security firms in the crypto industry.',
    href: 'https://leastauthority.com/blog/audit-of-hiros-stacks-wallet/',
    icon: <ShieldIcon variant="small" />,
    image: '/marketing/home/trust-least-authority.webp',
    imageAlt: 'Least Authority',
  },
  {
    title: 'Field tested by hackerone.com',
    description:
      'Validated by ethical hackers who continuously identify and resolve vulnerabilities.',
    href: 'https://hackerone.com/leather_wallet',
    icon: <PulseIcon variant="small" />,
    image: '/marketing/home/trust-hackerone.webp',
    imageAlt: 'HackerOne',
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
