import { Box, Flex, styled } from 'leather-styles/jsx';
import { AlexLogo } from '~/components/icons/alex-logo';
import { BitflowLogo } from '~/components/icons/bitflow-logo';
import { SbtcLogo } from '~/components/icons/sbtc-logo';
import { VelarLogo } from '~/components/icons/velar-logo';
import { ZestLogo } from '~/components/icons/zest-logo';
import { Page } from '~/features/page/page';

import { Hr } from '@leather.io/ui';

import { AcquireSbtcGrid } from './components/acquire-sbtc-grid';
import { SbtcRewardHeroCard } from './components/sbtc-hero-card';
import { SbtcProtocolRewardGrid } from './components/sbtc-protocol-reward-grid';

export interface RewardProtocolInfo {
  id: string;
  logo: JSX.Element;
  title: string;
  description: string;
  tvl: string;
  tvlUsd: string;
  minCommitment: string;
  minCommitmentUsd: string;
  apr: string;
  payoutToken: string;
}

const pools: RewardProtocolInfo[] = [
  {
    id: 'basic',
    logo: <SbtcLogo size="32px" />,
    title: 'Basic sBTC rewards',
    description: 'Hold sBTC in your wallet to earn more sBTC passively, compounding over time',
    tvl: '40,000,000 BTC',
    tvlUsd: '$40,000,000',
    minCommitment: '0.01 BTC',
    minCommitmentUsd: '$1,000.00',
    apr: '5%',
    payoutToken: 'sBTC',
  },
  {
    id: 'alex',
    logo: <AlexLogo size="32px" />,
    title: 'ALEX',
    description:
      'Commit sBTC to liquidity pools to earn fees and LP tokens in addition to basic sBTC rewards',
    tvl: '40,000,000 BTC',
    tvlUsd: '$40,000,000',
    minCommitment: '0.01 BTC',
    minCommitmentUsd: '$1,000.00',
    apr: '5%',
    payoutToken: 'sBTC',
  },
  {
    id: 'bitflow',
    logo: <BitflowLogo size="32px" />,
    title: 'Bitflow',
    description:
      'Commit sBTC to liquidity pools to earn fees and LP tokens in addition to basic sBTC rewards',
    tvl: '40,000,000 BTC',
    tvlUsd: '$40,000,000',
    minCommitment: '0.01 BTC',
    minCommitmentUsd: '$1,000.00',
    apr: '5%',
    payoutToken: 'sBTC',
  },
  {
    id: 'velar',
    logo: <VelarLogo size="32px" />,
    title: 'Velar',
    description:
      'Commit sBTC to liquidity pools to earn fees and LP tokens in addition to basic sBTC rewards',
    tvl: '40,000,000 BTC',
    tvlUsd: '$40,000,000',
    minCommitment: '0.01 BTC',
    minCommitmentUsd: '$1,000.00',
    apr: '5%',
    payoutToken: 'sBTC',
  },
  {
    id: 'zest',
    logo: <ZestLogo size="32px" />,
    title: 'Zest',
    description:
      'Commit sBTC to liquidity pools to earn fees and LP tokens in addition to basic sBTC rewards',
    tvl: '40,000,000 BTC',
    tvlUsd: '$40,000,000',
    minCommitment: '0.01 BTC',
    minCommitmentUsd: '$1,000.00',
    apr: '5%',
    payoutToken: 'sBTC',
  },
];

export function SbtcRewards() {
  return (
    <Page>
      <Page.Header title="sBTC Rewards" />

      <Flex mt="space.05" flexDir={['column', 'column', 'row']} gap={[null, null, 'space.08']}>
        <Box flex={1}>
          <styled.h2 textStyle="heading.03" maxW="400px">
            Earn yield with bitcoin on stacks
          </styled.h2>
        </Box>
        <Box flex={1}>
          <styled.p textStyle="label.01" mt={['space.03', 'space.03', 0]}>
            Acquire BTC in the form of sBTC on Stacks—the leading L2 for Bitcoin—to earn yield from
            a variety of reward protocols without sacrificing Bitcoin’s underlying security and
            self-sovereignty.
          </styled.p>
        </Box>
      </Flex>

      <SbtcRewardHeroCard apyRange="5–8%" mt="space.05" />

      <styled.section mt="space.09">
        <styled.h3 textStyle="heading.04">1. Acquire sBTC</styled.h3>
        <AcquireSbtcGrid mt="space.03" />
      </styled.section>

      <styled.section mt="space.08">
        <styled.h3 textStyle="heading.04">2. Choose rewards protocol</styled.h3>

        {pools.map(pool => (
          <SbtcProtocolRewardGrid key={pool.id} mt="space.03" rewardProtocol={pool} />
        ))}
      </styled.section>

      <Page.Inset>
        <Hr my="space.09" />
      </Page.Inset>
    </Page>
  );
}
