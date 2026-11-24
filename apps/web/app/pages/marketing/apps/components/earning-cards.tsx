import { type ReactNode } from 'react';
import { Link } from 'react-router';

import { css, cx } from 'leather-styles/css';
import { Box, Flex, Grid, styled } from 'leather-styles/jsx';
import { type BondTargetRate, formatBondTargetRate } from '~/pages/marketing/home/bond-target-rate';
import {
  type Provider,
  bondPoolProviders,
  pooledStackingProviders,
  sbtcDefiProviders,
} from '~/pages/marketing/home/components/home-providers';
import { iconRadius } from '~/pages/marketing/shared/marketing-radius';
import { trackExternalLinkClick } from '~/utils/external-links';

import { earningOptions, earningProviderLinks } from '../apps.data';
import { EarningArt } from './earning-art';
import { pillStyles } from './pill-styles';

const { bitcoinStaking, stxStaking, sbtcDefi } = earningOptions;

const stxOfferingOverrides: Record<string, string | undefined> = stxStaking.offeringOverrides;
const stxStakingProviders = pooledStackingProviders.map(provider => ({
  ...provider,
  yield: stxOfferingOverrides[provider.name] ?? provider.yield,
}));

interface EarningOption {
  eyebrow: string;
  title: string;
  description: string;
  cta: string;
  href: string;
}

function EarningCard({ children }: { children: ReactNode }) {
  return (
    <Flex
      position="relative"
      flexDirection="column"
      height="100%"
      minHeight={[null, null, '360px']}
      p="space.05"
      border="default"
      borderRadius="md"
      bg="ink.background-primary"
      overflow="hidden"
    >
      {children}
    </Flex>
  );
}

function CardHeader({ option }: { option: EarningOption }) {
  return (
    <Flex alignItems="center" justifyContent="space-between" gap="space.04">
      <Box minW={0}>
        <styled.p textStyle="caption.01" color="ink.text-secondary">
          {option.eyebrow}
        </styled.p>
        <styled.h3 textStyle="heading.05" fontWeight={400}>
          {option.title}
        </styled.h3>
      </Box>
      <Link to={option.href} className={pillStyles}>
        {option.cta}
      </Link>
    </Flex>
  );
}

const logoRadius = iconRadius(32);

function ProviderLogo({ logo }: { logo: Provider['logo'] }) {
  if (typeof logo === 'string')
    return (
      <styled.img
        src={logo}
        alt=""
        htmlWidth={32}
        htmlHeight={32}
        w="32px"
        h="32px"
        flexShrink={0}
        loading="lazy"
        style={{ borderRadius: logoRadius }}
      />
    );
  return (
    <Box flexShrink={0} overflow="hidden" style={{ borderRadius: logoRadius }}>
      {logo}
    </Box>
  );
}

// Nested inside the card, so the hover fill uses the smaller radius and bleeds into the card's
// padding to keep the logos aligned with the text above.
const providerRowStyles = css({
  display: 'flex',
  alignItems: 'center',
  gap: 'space.03',
  p: 'space.02',
  mx: '-space.02',
  borderRadius: 'sm',
  textStyle: 'caption.01',
});

const providerLinkStyles = css({
  transition: 'background-color 120ms ease',
  _hover: { bg: 'ink.component-background-hover' },
  _focusVisible: { outline: '2px solid', outlineColor: 'blue.border', outlineOffset: '-2px' },
});

function ProviderRow({ provider }: { provider: Provider }) {
  const href = earningProviderLinks[provider.name];
  const content = (
    <>
      <ProviderLogo logo={provider.logo} />
      <styled.span whiteSpace="nowrap">{provider.name}</styled.span>
      <styled.span ml="auto" textAlign="right" textWrap="balance">
        {provider.yield}
      </styled.span>
    </>
  );

  if (!href) return <div className={providerRowStyles}>{content}</div>;
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={`${provider.name}: ${provider.yield} (opens in a new tab)`}
      onClick={() => trackExternalLinkClick(href, { section: 'apps_earning' })}
      className={cx(providerRowStyles, providerLinkStyles)}
    >
      {content}
    </a>
  );
}

function ProviderList({ providers }: { providers: Provider[] }) {
  return (
    <styled.ul display="flex" flexDirection="column" gap="space.01" mt="space.06">
      {providers.map(provider => (
        <li key={provider.name}>
          <ProviderRow provider={provider} />
        </li>
      ))}
    </styled.ul>
  );
}

function BitcoinStakingCard({ bondTargetRate }: { bondTargetRate: BondTargetRate }) {
  return (
    <EarningCard>
      <Grid gridTemplateColumns={['1fr', null, null, '1fr 1fr']} gap="space.05" flex="1">
        <Flex flexDirection="column" maxW={[null, null, null, '440px']}>
          <CardHeader option={bitcoinStaking} />
          <Flex alignItems="baseline" gap="space.02" mt="space.04" flexWrap="wrap">
            <styled.span textStyle="heading.03" fontWeight={400}>
              {formatBondTargetRate(bondTargetRate.rateBps)}
            </styled.span>
            <styled.span textStyle="caption.01" color="ink.text-secondary">
              {bitcoinStaking.rateLabel}
              {bondTargetRate.isLive ? ' · live' : ' · as of 11 Nov 2026'}
            </styled.span>
          </Flex>
          <styled.p textStyle="body.02" color="ink.text-secondary" mt="space.02" maxW="400px">
            {bitcoinStaking.description}
          </styled.p>
          <Box mt="auto">
            <ProviderList providers={bondPoolProviders} />
          </Box>
        </Flex>
        {/* Bleeds to the card's top and outer edges */}
        <Box
          position="relative"
          order={[-1, null, null, 0]}
          minHeight={['300px', null, '340px', '460px']}
          mt="-space.05"
          mr="-space.05"
          ml={['-space.05', null, null, 0]}
          mb={[0, null, null, '-space.05']}
        >
          <EarningArt />
        </Box>
      </Grid>
    </EarningCard>
  );
}

function OptionCard({ option, providers }: { option: EarningOption; providers: Provider[] }) {
  return (
    <EarningCard>
      <CardHeader option={option} />
      <styled.p textStyle="body.02" color="ink.text-secondary" mt="space.04" maxW="400px">
        {option.description}
      </styled.p>
      <Box mt="auto">
        <ProviderList providers={providers} />
      </Box>
    </EarningCard>
  );
}

export function EarningCards({ bondTargetRate }: { bondTargetRate: BondTargetRate }) {
  return (
    <Grid gridTemplateColumns={['1fr', null, '1fr 1fr']} gap="space.03">
      <Box gridColumn={[null, null, '1 / -1']}>
        <BitcoinStakingCard bondTargetRate={bondTargetRate} />
      </Box>
      <OptionCard option={stxStaking} providers={stxStakingProviders} />
      <OptionCard option={sbtcDefi} providers={sbtcDefiProviders} />
    </Grid>
  );
}
