import { type ReactNode } from 'react';

import { Box, Flex, Grid, styled } from 'leather-styles/jsx';
import { installLinks } from '~/pages/marketing/shared/install-links';
import { trackMarketingEvent } from '~/pages/marketing/shared/marketing-analytics';

import { ExternalLinkIcon, LedgerIcon, StarIcon } from '@leather.io/ui';

import { HomeSection } from './home-layout';

const bitflowQuote = {
  text: 'Leather integrating the Bitflow SDK is a huge win for the in-wallet trading experience.',
  source: 'Dylan Floyd',
  attribution: 'Bitflow co-founder · Integration partner',
  href: 'https://invezz.com/news/2024/08/02/bitflow-announces-leather-wallet-integration-to-onboard-over-370000-users-to-bitcoin-l2-defi-assets/',
};

const ledgerQuote = {
  text: 'The security of a Ledger signer and the convenience of a software Bitcoin wallet.',
  source: 'Ledger Academy',
  attribution: 'Hardware wallet integration partner',
  href: 'https://www.ledger.com/academy/topics/security/best-bitcoin-wallets',
};

interface SourceLinkProps {
  href: string;
  name: string;
  icon: ReactNode;
  children: ReactNode;
  accessibleLabel?: string;
  onClick(): void;
}

function SourceLink({ href, name, icon, children, accessibleLabel, onClick }: SourceLinkProps) {
  return (
    <styled.a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      onClick={onClick}
      aria-label={accessibleLabel}
      className="group"
      display="inline-grid"
      gridTemplateColumns="{sizes.xxl} minmax(0, 1fr)"
      alignItems="center"
      alignSelf="flex-start"
      gap="space.03"
      minHeight="44px"
      borderRadius="xs"
      _focusVisible={{ outline: '2px solid', outlineColor: 'blue.border', outlineOffset: '4px' }}
    >
      <Flex width="xxl" height="xxl" alignItems="center" justifyContent="center" aria-hidden>
        {icon}
      </Flex>
      <Flex direction="column">
        <styled.span
          display="inline-flex"
          alignItems="center"
          gap="space.01"
          textStyle="label.02"
          _groupHover={{ textDecoration: 'underline' }}
        >
          {name}
          <ExternalLinkIcon aria-hidden variant="small" />
          <styled.span srOnly> (opens in a new tab)</styled.span>
        </styled.span>
        <styled.span color="ink.text-secondary" textStyle="caption.01" transform="translateY(1px)">
          {children}
        </styled.span>
      </Flex>
    </styled.a>
  );
}

interface PartnerQuoteProps {
  quote: typeof bitflowQuote;
  icon: ReactNode;
  featured?: boolean;
}

function PartnerQuote({ quote, icon, featured }: PartnerQuoteProps) {
  return (
    <styled.figure>
      <styled.blockquote
        cite={quote.href}
        position="relative"
        textStyle={featured ? 'heading.04' : 'heading.05'}
        fontSize={featured ? { md: '30px', xl: '42px' } : { lg: '23px' }}
        lineHeight={featured ? '1.16' : '1.3'}
        fontWeight="400"
        letterSpacing={featured ? '-0.025em' : '-0.015em'}
        textWrap="pretty"
      >
        <styled.span
          aria-hidden
          position="absolute"
          insetInlineEnd="100%"
          marginInlineEnd="space.01"
          top="-0.04em"
          color="ink.text-non-interactive"
        >
          “
        </styled.span>
        {quote.text}
      </styled.blockquote>
      <styled.figcaption display="flex" mt="space.04">
        <SourceLink
          href={quote.href}
          name={quote.source}
          icon={icon}
          onClick={() =>
            trackMarketingEvent('learn_more_clicked', {
              section: 'home_social_proof',
              card: quote.source,
              url: quote.href,
            })
          }
        >
          {quote.attribution}
        </SourceLink>
      </styled.figcaption>
    </styled.figure>
  );
}

function ChromeRating() {
  return (
    <SourceLink
      href={installLinks.chrome}
      name="Chrome Web Store"
      icon={
        <styled.img
          src="/marketing/shared/chrome.webp"
          alt=""
          width="100%"
          height="100%"
          loading="lazy"
        />
      }
      accessibleLabel="Chrome Web Store, 4.6 out of 5 (opens in a new tab)"
      onClick={() =>
        trackMarketingEvent('store_link_clicked', {
          store: 'chrome',
          section: 'home_social_proof',
          url: installLinks.chrome,
        })
      }
    >
      <styled.span
        aria-hidden
        display="flex"
        alignItems="center"
        gap="space.02"
        whiteSpace="nowrap"
      >
        <styled.span
          display="flex"
          gap="space.01"
          css={{ '& > svg path': { fill: 'currentColor' } }}
        >
          {[1, 2, 3, 4].map(star => (
            <StarIcon key={star} variant="small" />
          ))}
          <styled.span position="relative" display="flex">
            <StarIcon variant="small" />
            <styled.span
              position="absolute"
              inset="0"
              clipPath="inset(0 40% 0 0)"
              css={{ '& path': { fill: 'currentColor' } }}
            >
              <StarIcon variant="small" />
            </styled.span>
          </styled.span>
        </styled.span>
        <styled.span>4.6 / 5</styled.span>
      </styled.span>
    </SourceLink>
  );
}

export function HomeSocialProof() {
  return (
    <HomeSection
      id="social-proof"
      aria-label="Wallet reviews and partner quotes"
      className="dark"
      bg="ink.background-primary"
      color="ink.text-primary"
      border="1px solid"
      borderColor="ink.border-default"
      borderRadius="md"
      overflow="hidden"
      scrollMarginTop="space.09"
    >
      <Grid gridTemplateColumns={{ base: 'minmax(0, 1fr)', xl: 'minmax(0, 2fr) minmax(0, 1fr)' }}>
        <Flex
          direction="column"
          justifyContent="center"
          py="space.06"
          paddingInlineStart={{ base: 'space.05', xl: 'space.08' }}
          paddingInlineEnd="space.06"
        >
          <PartnerQuote
            quote={ledgerQuote}
            icon={
              <Flex
                width="100%"
                height="100%"
                alignItems="center"
                justifyContent="center"
                bg="ink.text-primary"
                borderRadius="xs"
              >
                <LedgerIcon variant="medium" color="ink.background-primary" />
              </Flex>
            }
            featured
          />
        </Flex>
        <Flex
          direction="column"
          justifyContent="center"
          gap="space.05"
          py="space.06"
          borderTopWidth={{ base: '1px', xl: '0' }}
          borderInlineStartWidth={{ base: '0', xl: '1px' }}
          borderStyle="solid"
          borderColor="ink.border-default"
        >
          <Box px="space.06">
            <PartnerQuote
              quote={bitflowQuote}
              icon={
                <styled.img
                  src="/marketing/home/provider-bitflow.png"
                  alt=""
                  width="100%"
                  height="100%"
                  borderRadius="xs"
                  loading="lazy"
                />
              }
            />
          </Box>
          <Box role="separator" borderTop="1px solid {colors.ink.border-default}" />
          <Flex px="space.06">
            <ChromeRating />
          </Flex>
        </Flex>
      </Grid>
    </HomeSection>
  );
}
