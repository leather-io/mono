import { Link } from 'react-router';

import { Box, Flex, Grid, styled } from 'leather-styles/jsx';
import { Reveal } from '~/pages/marketing/shared/reveal';

import { ArrowLeftIcon } from '@leather.io/ui';

import { HomeSection, HomeSectionHeading } from './home-layout';

const StyledLink = styled(Link);

// Leather's orange yield gradient (as on the Framer site's provider cards)
const yieldGradient =
  'linear-gradient(105deg, {colors.orange.action-primary-default} 0%, #FF9F3A 45%, #FF6534 100%)';

interface Provider {
  name: string;
  logo: string;
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
            Historical yield
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
                <styled.img
                  src={provider.logo}
                  alt=""
                  width="32px"
                  height="32px"
                  flexShrink={0}
                  loading="lazy"
                />
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

function YieldCard({ href, title, icon, cta, rate, groups }: YieldCardProps) {
  return (
    <StyledLink
      to={href}
      prefetch="intent"
      display="block"
      border="1px solid"
      borderColor="ink.border-default"
      borderRadius="sm"
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
          <styled.p textStyle="heading.01" fontWeight="400" fontSize={['24px', null, '53px']}>
            {rate}
          </styled.p>
          <styled.p textStyle="caption.01" fontWeight="500" lineHeight="16px">
            Based on avg. past
            <br />
            yearly rewards
          </styled.p>
        </Flex>
      </Grid>
      <Box bg="ink.background-secondary" px={['space.05', null, 'space.06']} pb="space.06">
        {groups.map(group => (
          <Box key={group.title} pt={['space.05', null, 'space.07']}>
            <styled.h4 textStyle="label.01" fontWeight="400">
              {group.title}
            </styled.h4>
            <styled.p textStyle="body.02" lineHeight="24px" color="ink.text-secondary" maxW="440px">
              {group.description}
            </styled.p>
            <ProviderTable providers={group.providers} />
          </Box>
        ))}
      </Box>
    </StyledLink>
  );
}

export function HomeProviders() {
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
                lines={['The best providers,', 'in one place.']}
              />
              <styled.p textStyle="body.01" mt="space.02" maxW="330px">
                We’ve aggregated the best for you, so your assets work harder with full transparency
                and steady yields over time.
              </styled.p>
            </Reveal>
          </Box>
        </Box>
        <Flex flexDir="column" gap="space.07">
          <YieldCard
            href="/sbtc"
            title="sBTC"
            icon="/marketing/home/icon-sbtc.webp"
            cta="Earn BTC"
            rate="5%"
            groups={[
              {
                title: 'Bitcoin on layer 2',
                description:
                  'Turn your Bitcoin into an active asset. Earn rewards, use it in DeFi, and explore new ways to grow your BTC on layer 2.',
                providers: [
                  {
                    name: 'sBTC Rewards Program',
                    logo: '/marketing/home/icon-sbtc.webp',
                    yield: 'Up to 5% on your Bitcoin, paid in sBTC',
                  },
                  { name: 'Zest', logo: '/marketing/home/provider-zest.png', yield: '5.2%' },
                  { name: 'Bitflow', logo: '/marketing/home/provider-bitflow.png', yield: '5.1%' },
                ],
              },
            ]}
          />
          <YieldCard
            href="/staking"
            title="Staking"
            icon="/marketing/home/icon-stx.png"
            cta="Start Staking"
            rate="6–10%"
            groups={[
              {
                title: 'Pooled staking',
                description:
                  'Stake with others to earn BTC. Your STX stay locked for each cycle, and you earn steady rewards.',
                providers: [
                  {
                    name: 'Stacking DAO',
                    logo: '/marketing/home/provider-stacking-dao.png',
                    yield: '9.27%',
                  },
                  {
                    name: 'Fast pool',
                    logo: '/marketing/home/provider-fast-pool.png',
                    yield: '8.59%',
                  },
                  {
                    name: 'PlanBetter',
                    logo: '/marketing/home/provider-planbetter.png',
                    yield: '8.57%',
                  },
                ],
              },
              {
                title: 'Liquid Staking',
                description:
                  'Keep your STX flexible and still earn BTC. Get a liquid token that lets you trade or use your staked STX anytime.',
                providers: [
                  {
                    name: 'Stacking DAO',
                    logo: '/marketing/home/provider-stacking-dao.png',
                    yield: '8.72%',
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
