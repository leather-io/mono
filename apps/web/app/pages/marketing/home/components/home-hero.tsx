import { Fragment } from 'react';

import { Box, Flex, Grid, styled } from 'leather-styles/jsx';
import { StoreButtons } from '~/pages/marketing/shared/store-buttons';

import { ErrorTriangleIcon } from '@leather.io/ui';

// Entrance motion rebuilt from the Framer site's appear effects. Pure CSS, so it runs before
// hydration and without JS. Every entrance starts at opacity 0.001 rather than 0: the SSR HTML stays
// visible to crawlers and the first paint still counts for LCP. Reduced motion: no animation.
// The 900–1439px overrides are the Framer site's tablet timings.
const headlineLines = [['Buy.', 'Send.'], ['Swap.', 'Earn.'], ['Grow.']];
const headline = headlineLines.flat().join(' ');
const headlineStartDelay = 0.4;
// Framer's default per-word stagger for text effects (not stored in the project config)
const headlineWordStagger = 0.05;

function wordDelay(lineIndex: number, wordIndex: number) {
  const index = headlineLines.slice(0, lineIndex).flat().length + wordIndex;
  return `${Math.round((headlineStartDelay + index * headlineWordStagger) * 1000)}ms`;
}

const partners = [
  { name: 'Coinbase', src: '/marketing/home/partner-coinbase.webp', width: 140 },
  { name: 'Binance', src: '/marketing/home/partner-binance.webp', width: 140 },
  { name: 'MoonPay', src: '/marketing/home/partner-moonpay.webp', width: 140 },
  { name: 'Gate', src: '/marketing/home/partner-gate.webp', width: 106 },
];

function PhishingNotice() {
  return (
    <Flex
      role="note"
      _motionSafe={{ animation: 'marketingAppear 0.4s cubic-bezier(0.22, 1, 0.36, 1) both' }}
      alignItems="flex-start"
      gap="space.03"
      bg="ink.border-default"
      px={['space.04', null, 'space.04']}
      py="space.03"
      textStyle="label.02"
      fontWeight="400"
    >
      <Flex flexShrink={0} height="20px" alignItems="center" aria-hidden>
        <ErrorTriangleIcon variant="small" />
      </Flex>
      <styled.p>
        There is an active email phishing 2FA scam. Leather will never send you an email. Do not
        click any links.
      </styled.p>
    </Flex>
  );
}

export function HomeHero() {
  return (
    <styled.section aria-labelledby="home-hero-heading">
      <PhishingNotice />

      <Grid
        gridTemplateColumns={['1fr', null, null, '1fr 1fr']}
        gap={['space.05', null, null, 'space.07']}
        mt={['space.07', null, 'space.08']}
      >
        <styled.h1
          id="home-hero-heading"
          // The words below are split into spans for the animation; give the heading its
          // accessible name as one string so screen readers don't read it word by word
          aria-label={headline}
          textStyle="display.02"
          fontSize={['56px', '64px', '68px']}
          lineHeight={['50px', '56px', '60px']}
        >
          {headlineLines.map((line, lineIndex) => (
            <Fragment key={line.join(' ')}>
              {lineIndex > 0 && ' '}
              <styled.span display="block" aria-hidden>
                {line.map((word, wordIndex) => (
                  <Fragment key={word}>
                    {wordIndex > 0 && ' '}
                    <styled.span
                      display="inline-block"
                      _motionSafe={{
                        animation: 'marketingWordIn 0.2s cubic-bezier(0.12, 0.23, 0.5, 1) both',
                      }}
                      style={{ animationDelay: wordDelay(lineIndex, wordIndex) }}
                    >
                      {word}
                    </styled.span>
                  </Fragment>
                ))}
              </styled.span>
            </Fragment>
          ))}
        </styled.h1>
        <Box id="download" scrollMarginTop="space.07">
          <styled.p
            textStyle="heading.04"
            fontWeight="400"
            fontSize={['24px', null, '26px']}
            _motionSafe={{
              animation: 'marketingAppear 0.4s cubic-bezier(0.5, 0, 0.88, 0.77) 0.75s both',
              '@media (min-width: 900px) and (max-width: 1439.98px)': {
                animation: 'marketingAppear 0.3s cubic-bezier(0.5, 0, 0.88, 0.77) 0.65s both',
              },
            }}
          >
            Leather is a wallet for Bitcoin and Stacks, designed for security, clarity, and growth.
            Join 100,000+ users on your favorite platform.
          </styled.p>
          <Box
            _motionSafe={{
              animation: 'marketingAppear 0.4s cubic-bezier(0.44, 0, 0.56, 1) 0.5s both',
            }}
          >
            <StoreButtons containerProps={{ mt: 'space.05', display: ['none', null, 'flex'] }} />
            <StoreButtons
              platforms={['ios', 'chrome', 'android']}
              containerProps={{ mt: 'space.05', display: ['flex', null, 'none'] }}
            />
          </Box>
        </Box>
      </Grid>

      <Box
        position="relative"
        overflow="hidden"
        bg="ink.border-default"
        borderRadius="sm"
        mt={['space.07', null, '86px']}
        aspectRatio={['342 / 500', null, '1196 / 615']}
        _motionSafe={{
          animation: 'marketingDropIn 0.4s cubic-bezier(0.44, 0, 0.56, 1) 1.25s both',
          '@media (min-width: 900px) and (max-width: 1439.98px)': {
            animation: 'marketingDropIn 0.25s cubic-bezier(0.44, 0, 0.56, 1) 1s both',
          },
        }}
      >
        {/* Desktop: browser extension + phone; mobile: phone only */}
        <styled.img
          src="/marketing/home/hero-mockup.webp"
          alt="The Leather browser extension and mobile app showing a wallet with a total balance of $7,517.49 and Stacks, Bitcoin and sBTC holdings"
          display={['none', null, 'block']}
          position="absolute"
          left="5.3%"
          top="7.3%"
          width="89.5%"
          height="auto"
          fetchPriority="high"
        />
        <styled.img
          src="/marketing/home/hero-mockup-phone.webp"
          alt="The Leather mobile app showing a wallet with a total balance of $7,517.49"
          display={['block', null, 'none']}
          position="absolute"
          left="50%"
          transform="translateX(-50%)"
          top="8%"
          width="60%"
          height="auto"
        />
      </Box>

      <Flex
        flexDir={['column', null, 'row']}
        justifyContent="space-between"
        alignItems={[null, null, 'center']}
        gap={['space.03', null, 'space.05']}
        mt={['space.07', null, 'space.05']}
      >
        <styled.p textStyle="caption.01" color="ink.text-secondary" maxW="160px">
          Buy instantly through trusted partners.
        </styled.p>
        <styled.ul
          aria-label="Partners"
          display="flex"
          alignItems="center"
          justifyContent="space-between"
          gap={['space.02', null, 'space.09']}
          flex={[null, null, '0 1 794px']}
        >
          {partners.map(partner => (
            <styled.li key={partner.name} flexShrink={1} minW={0}>
              <styled.img
                src={partner.src}
                alt={partner.name}
                style={{ width: partner.width }}
                maxW="100%"
                height="auto"
                loading="lazy"
              />
            </styled.li>
          ))}
        </styled.ul>
      </Flex>
    </styled.section>
  );
}
