import { Box, Flex, Grid, styled } from 'leather-styles/jsx';
import { StoreButtons } from '~/pages/marketing/shared/store-buttons';

import { ErrorTriangleIcon } from '@leather.io/ui';

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
          textStyle="display.02"
          fontSize={['56px', '64px', '68px']}
          lineHeight={['50px', '56px', '60px']}
        >
          <styled.span display="block">Buy. Send.</styled.span>{' '}
          <styled.span display="block">Swap. Earn.</styled.span>{' '}
          <styled.span display="block">Grow.</styled.span>
        </styled.h1>
        <Box id="download" scrollMarginTop="space.07">
          <styled.p textStyle="heading.04" fontWeight="400" fontSize={['24px', null, '26px']}>
            Leather is a wallet for Bitcoin and Stacks, designed for security, clarity, and growth.
            Join 100,000+ users on your favorite platform.
          </styled.p>
          <StoreButtons containerProps={{ mt: 'space.05', display: ['none', null, 'flex'] }} />
          <StoreButtons
            platforms={['ios', 'chrome', 'android']}
            containerProps={{ mt: 'space.05', display: ['flex', null, 'none'] }}
          />
        </Box>
      </Grid>

      <Box
        position="relative"
        overflow="hidden"
        bg="ink.border-default"
        borderRadius="sm"
        mt={['space.07', null, '86px']}
        aspectRatio={['342 / 500', null, '1196 / 615']}
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
