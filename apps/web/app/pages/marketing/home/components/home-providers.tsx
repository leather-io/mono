import { type ReactNode } from 'react';
import { Link } from 'react-router';

import { Box, Flex, Grid, styled } from 'leather-styles/jsx';
import { ProviderIcon } from '~/components/icons/provider-icon';
import { trackMarketingEvent } from '~/pages/marketing/shared/marketing-analytics';
import { iconRadius } from '~/pages/marketing/shared/marketing-radius';
import { Reveal } from '~/pages/marketing/shared/reveal';
import { trackExternalLinkClick } from '~/utils/external-links';

import { ArrowLeftIcon } from '@leather.io/ui';

import { type BondTargetRate, formatBondTargetRate } from '../bond-target-rate';
import { HomeSection, HomeSectionHeading } from './home-layout';

const providerLogoRadius = iconRadius(32);

const StyledLink = styled(Link);

const yieldGradient =
  'linear-gradient(105deg, {colors.orange.action-primary-default} 0%, #FF9F3A 45%, #FF6534 100%)';

interface Provider {
  name: string;
  /** A logo image, or a ready-made icon for providers drawn on a brand fill. */
  logo: string | ReactNode;
  yield: string;
}

interface ProviderGroup {
  title: string;
  description: string;
  providers: Provider[];
}

interface YieldCardProps {
  href: string;
  title: string;
  icon: string;
  cta: string;
  rate: string;
  rateLabel: string;
  rateContext: string;
  reference: {
    label: string;
    url: string;
    note: string;
  };
  groups: ProviderGroup[];
}

function ProviderTable({ providers }: { providers: Provider[] }) {
  return (
    <styled.table width="100%" mt="space.07" borderCollapse="collapse">
      <thead>
        <tr>
          <styled.th
            textAlign="left"
            textStyle="body.02"
            fontWeight="400"
            color="ink.text-non-interactive"
            pb="space.03"
          >
            Providers
          </styled.th>
          <styled.th
            textAlign="right"
            textStyle="body.02"
            fontWeight="400"
            color="ink.text-non-interactive"
            pb="space.03"
          >
            Offering
          </styled.th>
        </tr>
      </thead>
      <tbody>
        {providers.map((provider, index) => (
          <styled.tr
            key={provider.name}
            borderTop={index > 0 ? '1px solid {colors.ink.border-default}' : 'none'}
          >
            <styled.td py="space.03" pr="space.03">
              <Flex alignItems="center" gap="space.03">
                {typeof provider.logo === 'string' ? (
                  <styled.img
                    src={provider.logo}
                    alt=""
                    width="32px"
                    height="32px"
                    flexShrink={0}
                    loading="lazy"
                    style={{ borderRadius: providerLogoRadius }}
                  />
                ) : (
                  <Box
                    flexShrink={0}
                    overflow="hidden"
                    style={{ borderRadius: providerLogoRadius }}
                  >
                    {provider.logo}
                  </Box>
                )}
                <styled.span textStyle="body.02" color="ink.text-secondary">
                  {provider.name}
                </styled.span>
              </Flex>
            </styled.td>
            <styled.td
              py="space.03"
              textAlign="right"
              textStyle="body.02"
              color="ink.text-secondary"
            >
              {provider.yield}
            </styled.td>
          </styled.tr>
        ))}
      </tbody>
    </styled.table>
  );
}

function YieldCard({
  href,
  title,
  icon,
  cta,
  rate,
  rateLabel,
  rateContext,
  reference,
  groups,
}: YieldCardProps) {
  return (
    <Box>
      <StyledLink
        to={href}
        prefetch="intent"
        onClick={() =>
          trackMarketingEvent('provider_cta_clicked', { provider: title, cta, url: href })
        }
        display="block"
        border="1px solid"
        borderColor="ink.border-default"
        borderRadius="md"
        overflow="hidden"
        className="group"
        _focusVisible={{ outline: '2px solid', outlineColor: 'blue.border', outlineOffset: '2px' }}
      >
        <Grid gridTemplateColumns="1fr 1fr" gap="0">
          <Flex
            flexDir="column"
            alignItems="flex-start"
            gap={['space.05', null, 'space.07']}
            p={['space.05', null, 'space.06']}
            bg="ink.background-primary"
          >
            <Flex
              flexDir={['column', null, 'row']}
              alignItems={[null, null, 'center']}
              gap="space.03"
            >
              <styled.img src={icon} alt="" width="40px" height="40px" borderRadius="xs" />
              <styled.h3 textStyle="heading.04" fontWeight="400">
                {title}
              </styled.h3>
            </Flex>
            <Flex
              alignItems="center"
              gap="space.02"
              height="40px"
              px="space.04"
              borderRadius="round"
              bg="ink.action-primary-default"
              color="ink.background-primary"
              textStyle="label.02"
              whiteSpace="nowrap"
              _groupHover={{ bg: 'ink.action-primary-hover' }}
            >
              {cta}
              <styled.span transform="rotate(180deg)" display="flex" aria-hidden>
                <ArrowLeftIcon variant="small" color="ink.background-primary" />
              </styled.span>
            </Flex>
          </Flex>
          <Flex
            flexDir="column"
            justifyContent="space-between"
            p={['space.05', null, 'space.06']}
            bgImage={yieldGradient}
            color="ink.text-primary"
          >
            <styled.p textStyle="caption.01" fontWeight="500" lineHeight="20px">
              {rateLabel}
            </styled.p>
            <styled.p textStyle="heading.01" fontWeight="400" fontSize={['24px', null, '53px']}>
              {rate}
            </styled.p>
            <styled.p textStyle="caption.01" fontWeight="500" lineHeight="16px">
              {rateContext}
            </styled.p>
          </Flex>
        </Grid>
        <Box bg="ink.background-secondary" px={['space.05', null, 'space.06']} pb="space.06">
          {groups.map(group => (
            <Box key={group.title} pt={['space.05', null, 'space.07']}>
              <styled.h4 textStyle="label.01" fontWeight="400">
                {group.title}
              </styled.h4>
              <styled.p
                textStyle="body.02"
                lineHeight="24px"
                color="ink.text-secondary"
                maxW="440px"
              >
                {group.description}
              </styled.p>
              <ProviderTable providers={group.providers} />
            </Box>
          ))}
        </Box>
      </StyledLink>
      <styled.p textStyle="caption.01" color="ink.text-secondary" lineHeight="20px" mt="space.03">
        <styled.a
          href={reference.url}
          onClick={() => trackExternalLinkClick(reference.url, { section: 'home_providers' })}
          target="_blank"
          rel="noopener noreferrer"
          textDecoration="underline"
        >
          {reference.label}
        </styled.a>
        {' — '}
        {reference.note}
      </styled.p>
    </Box>
  );
}

export function HomeProviders({ bondTargetRate }: { bondTargetRate: BondTargetRate }) {
  const targetRate = formatBondTargetRate(bondTargetRate.rateBps);

  return (
    <HomeSection aria-labelledby="home-providers-heading">
      <Grid
        gridTemplateColumns={['1fr', null, null, '1fr 2fr']}
        gap={['space.09', null, null, 'space.07']}
      >
        <Box>
          <Box position={[null, null, null, 'sticky']} top="space.07">
            <Reveal>
              <HomeSectionHeading
                id="home-providers-heading"
                lines={['Explore providers,', 'on your terms.']}
              />
              <styled.p textStyle="body.01" mt="space.02" maxW="330px">
                Explore ways to use sBTC and stake STX. Compare each provider’s rates, fees, payout
                assets, and withdrawal terms before you commit.
              </styled.p>
            </Reveal>
          </Box>
        </Box>
        <Flex flexDir="column" gap="space.07">
          <YieldCard
            href="/sbtc"
            title="sBTC"
            icon="/marketing/home/icon-sbtc.webp"
            cta="Use sBTC"
            rate={targetRate}
            rateLabel="Bitcoin Staking · bond target rate"
            rateContext={
              bondTargetRate.isLive
                ? 'Live from the Stacks API · paid in sBTC'
                : 'As of 11 Nov 2026 · paid in sBTC'
            }
            reference={{
              label: 'How bond rewards work',
              url: 'https://docs.stacks.co/learn/bitcoin-staking/rewards-and-tranches',
              note: 'Each bond’s target rate is set when the bond opens and paid first from each cycle’s rewards, but it isn’t guaranteed. Bonds lock for about six months, and pools set their own fees and exit terms.',
            }}
            groups={[
              {
                title: 'Bitcoin Staking pools',
                description:
                  'Add sBTC to a pool that holds a protocol bond. The pool pairs it with STX and passes the bond’s sBTC rewards on by its own rules.',
                providers: [
                  {
                    name: 'Stacking DAO',
                    logo: '/marketing/home/provider-stacking-dao.png',
                    yield: 'Liquid stBTC',
                  },
                  {
                    name: 'Esbee DAO',
                    logo: <ProviderIcon providerId="esbeeDao" size="32" />,
                    yield: 'sBTC rewards',
                  },
                ],
              },
              {
                title: 'Bitcoin in Stacks DeFi',
                description:
                  'Use sBTC in lending markets and liquidity pools. Returns move with market conditions; fees and risks vary.',
                providers: [
                  {
                    name: 'Zest',
                    logo: '/marketing/home/provider-zest.png',
                    yield: 'Variable lending rate',
                  },
                  {
                    name: 'Bitflow',
                    logo: '/marketing/home/provider-bitflow.png',
                    yield: 'Liquidity pools',
                  },
                ],
              },
            ]}
          />
          <YieldCard
            href="/staking"
            title="STX Staking"
            icon="/marketing/home/icon-stx.png"
            cta="View pools"
            rate="8.22%"
            rateLabel="Fast Pool · historical APR"
            rateContext="Average of 136 payout cycles"
            reference={{
              label: 'Fast Pool history',
              url: 'https://fastpool.org/analytics',
              note: 'Provider-reported average, checked 11 Nov 2026. Includes earlier reward models and is not an estimate of the current pool’s return. Past returns do not predict future rewards.',
            }}
            groups={[
              {
                title: 'Pooled Stacking',
                description:
                  'Commit STX to help secure Stacks and earn Bitcoin rewards. Lock periods, fees, claim steps, and BTC or sBTC payouts depend on the pool.',
                providers: [
                  {
                    name: 'Stacking DAO',
                    logo: '/marketing/home/provider-stacking-dao.png',
                    yield: 'Claimable sBTC rewards',
                  },
                  {
                    name: 'Fast Pool',
                    logo: '/marketing/home/provider-fast-pool.png',
                    yield: '8.22% historical APR',
                  },
                  {
                    name: 'PlanBetter',
                    logo: '/marketing/home/provider-planbetter.png',
                    yield: 'Operator BTC payouts',
                  },
                ],
              },
              {
                title: 'Liquid Stacking',
                description:
                  'Receive a token representing a Stacking position. Rewards may compound in STX or be claimable as sBTC, depending on the product. Swaps and withdrawals depend on liquidity and provider terms.',
                providers: [
                  {
                    name: 'Stacking DAO',
                    logo: '/marketing/home/provider-stacking-dao.png',
                    yield: 'STX compounding / sBTC rewards',
                  },
                ],
              },
            ]}
          />
        </Flex>
      </Grid>
    </HomeSection>
  );
}
