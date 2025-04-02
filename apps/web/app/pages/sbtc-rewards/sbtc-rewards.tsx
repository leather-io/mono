import { ReactNode } from 'react';

import { Box, Flex, FlexProps, styled } from 'leather-styles/jsx';
import { DummyIcon } from '~/components/dummy';
import { PrimaryCellFiveGridLayout } from '~/components/layouts/primary-cell-five-grid.layout';
import { Page } from '~/features/page/page';

import { Button, Hr } from '@leather.io/ui';

import { SbtcStep1AcquireGrid } from './components/sbtc-step-1-acquire';

interface ValueDisplayerProps extends FlexProps {
  name: ReactNode;
  value: ReactNode;
}
function ValueDisplayer({ name, value }: ValueDisplayerProps) {
  return (
    <Flex flex={1} flexDir="column" justifyContent="space-between" p="space.05">
      <styled.h4 color="ink.text-subdued" textStyle="label.03">
        {name}
      </styled.h4>
      <styled.span textStyle="label.01">{value}</styled.span>
    </Flex>
  );
}

const pools = [
  {
    id: 'basic',
    logo: '/path/to/sbtc-icon.png',
    title: 'Basic sBTC rewards',
    description: 'Hold sBTC in your wallet to earn more sBTC passively, compounding over time',
    tvl: '40,000,000 BTC',
    tvlUSD: '$40,000,000',
    minCommitment: '0.01 BTC',
    minCommitmentUsd: '$1,000.00',
    apr: '5%',
    payoutToken: 'sBTC',
  },
  {
    id: 'alex',
    logo: '/path/to/alex-icon.png',
    title: 'ALEX',
    description:
      'Commit sBTC to liquidity pools to earn fees and LP tokens in addition to basic sBTC rewards',
    tvl: '40,000,000 BTC',
    tvlUSD: '$40,000,000',
    minCommitment: '0.01 BTC',
    minCommitmentUsd: '$1,000.00',
    apr: '5%',
    payoutToken: 'sBTC',
  },
  {
    id: 'bitflow',
    logo: '/path/to/bitflow-icon.png',
    title: 'Bitflow',
    description:
      'Commit sBTC to liquidity pools to earn fees and LP tokens in addition to basic sBTC rewards',
    tvl: '40,000,000 BTC',
    tvlUSD: '$40,000,000',
    minCommitment: '0.01 BTC',
    minCommitmentUsd: '$1,000.00',
    apr: '5%',
    payoutToken: 'sBTC',
  },
  {
    id: 'velar',
    logo: '/path/to/velar-icon.png',
    title: 'Velar',
    description:
      'Commit sBTC to liquidity pools to earn fees and LP tokens in addition to basic sBTC rewards',
    tvl: '40,000,000 BTC',
    tvlUSD: '$40,000,000',
    minCommitment: '0.01 BTC',
    minCommitmentUsd: '$1,000.00',
    apr: '5%',
    payoutToken: 'sBTC',
  },
  {
    id: 'zest',
    logo: '/path/to/zest-icon.png',
    title: 'Zest',
    description:
      'Commit sBTC to liquidity pools to earn fees and LP tokens in addition to basic sBTC rewards',
    tvl: '40,000,000 BTC',
    tvlUSD: '$40,000,000',
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

      <Page.Inset pos="relative" bg="black" color="white" mt="space.05" h="260px">
        <Flex flexDir="column" pos="absolute" bottom={0} p={['space.04', 'space.05', 'space.07']}>
          <styled.span textStyle="label.01">Historical APY</styled.span>
          <styled.span textStyle="heading.02">5–8%</styled.span>
        </Flex>
      </Page.Inset>

      <styled.section mt="space.09">
        <styled.h3 textStyle="heading.04">1. Acquire sBTC</styled.h3>

        <SbtcStep1AcquireGrid mt="space.03" />
      </styled.section>

      <styled.section mt="space.08">
        <styled.h3 textStyle="heading.04">2. Choose rewards protocol</styled.h3>

        {pools.map(pool => (
          <styled.article
            key={pool.id}
            display="flex"
            flexDir={{ base: 'column', md: 'row' }}
            mt="space.03"
          >
            <PrimaryCellFiveGridLayout
              primaryCell={
                <Flex
                  flex={1}
                  justifyContent="space-between"
                  flexDir="column"
                  p="space.05"
                  minH="246px"
                >
                  <DummyIcon />
                  <Box>
                    <styled.h3 textStyle="heading.05" mt="space.05">
                      {pool.title}
                    </styled.h3>
                    <styled.p textStyle="caption.01" mt="space.01">
                      {pool.description}
                    </styled.p>
                    <Button size="xs" mt="space.04">
                      Enroll
                    </Button>
                  </Box>
                </Flex>
              }
              cells={[
                <ValueDisplayer
                  key={pool.id}
                  name="Total Value Locked (TVL)"
                  value={
                    <>
                      {pool.tvl}
                      <Box textStyle="label.03">{pool.tvlUSD}</Box>
                    </>
                  }
                />,
                <ValueDisplayer key={`${pool.id}-apr`} name="Historical APR" value={pool.apr} />,
                <ValueDisplayer
                  key={`${pool.id}-minCommitment`}
                  name="Minimum Commitment"
                  value={
                    <>
                      {pool.minCommitment}
                      <Box textStyle="label.03">{pool.minCommitmentUsd}</Box>
                    </>
                  }
                />,
                <ValueDisplayer
                  key={`${pool.id}-token`}
                  name="Payout token"
                  value={pool.payoutToken}
                />,
              ]}
            />
          </styled.article>
        ))}
      </styled.section>

      <Page.Inset>
        <Hr my="space.09" />
      </Page.Inset>
    </Page>
  );
}
