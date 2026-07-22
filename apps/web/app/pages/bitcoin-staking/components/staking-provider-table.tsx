import { styled } from 'leather-styles/jsx';
import { HTMLStyledProps } from 'leather-styles/types';
import { ChainLogoIcon } from '~/components/icons/chain-logo';
import { ProviderIcon } from '~/components/icons/provider-icon';
import { LearnHoverCard } from '~/components/learn-hover-card';
import { ForceRowHeight, Table, rowPadding, theadBorderBottom } from '~/components/table';
import { bitcoinStakingLabels } from '~/content/bitcoin-staking-content';
import { learnArticles } from '~/content/learn-content';
import {
  bitcoinStakingPoolList,
  isPoolAvailableOnNetwork,
  stakingProviderIdToSlug,
} from '~/data/bitcoin-staking-data';
import { useStacksNetwork } from '~/store/stacks-network';
import { toHumanReadableMicroStx } from '~/utils/unit-convert';

import { Flag } from '@leather.io/ui';

import { StartStakingButton } from './start-staking-button';

// Static-config table: pox-5 pool stats (TVL, realized yield) have no external
// data source yet — the stacking-tracker API only covers pox-4 pools.
export function StakingProviderTable(props: HTMLStyledProps<'div'>) {
  const { networkInstance } = useStacksNetwork();

  return (
    <Table.Root width="100%" overflowX="auto" {...props}>
      <Table.Table>
        <Table.Head className={theadBorderBottom}>
          <Table.Row className={rowPadding}>
            <Table.Header px="space.04" align="left" style={{ width: '40%' }}>
              <ForceRowHeight>
                <LearnHoverCard
                  article={learnArticles.stackingProviders}
                  label={bitcoinStakingLabels.provider}
                  textStyle="label.03"
                />
              </ForceRowHeight>
            </Table.Header>
            <Table.Header px="space.04" align="left" style={{ width: '16%' }}>
              <LearnHoverCard
                article={learnArticles.stackingRewardsTokens}
                label={bitcoinStakingLabels.rewardsToken}
                textStyle="label.03"
              />
            </Table.Header>
            <Table.Header px="space.04" align="right" style={{ width: '16%' }}>
              <LearnHoverCard
                article={learnArticles.stackingMinimumCommitment}
                label={bitcoinStakingLabels.minimumCommitment}
                textStyle="label.03"
              />
            </Table.Header>
            <Table.Header px="space.04" align="right" style={{ width: '12%' }}>
              <LearnHoverCard
                article={learnArticles.stackingPoolFees}
                label={bitcoinStakingLabels.fee}
                textStyle="label.03"
              />
            </Table.Header>
            <Table.Header px="space.04" align="right" style={{ width: '16%' }} />
          </Table.Row>
        </Table.Head>
        <Table.Body>
          {bitcoinStakingPoolList.map(pool => {
            const available = isPoolAvailableOnNetwork(pool, networkInstance);
            const slug = stakingProviderIdToSlug(pool.providerId);
            return (
              <Table.Row
                key={pool.providerId}
                height="64px"
                className={rowPadding}
                opacity={available ? undefined : 0.5}
              >
                <styled.td px="space.04" align="left" color="black">
                  <Flag
                    img={<ProviderIcon providerId={pool.providerId} />}
                    color="ink.text-primary"
                  >
                    {pool.name}
                  </Flag>
                </styled.td>
                <styled.td px="space.04" align="left" color="black">
                  <Flag
                    display={['none', 'none', 'flex']}
                    spacing="space.02"
                    img={<ChainLogoIcon symbol="sBTC" />}
                  >
                    sBTC
                  </Flag>
                </styled.td>
                <styled.td px="space.04" align="right" color="black" style={{ textAlign: 'right' }}>
                  {toHumanReadableMicroStx(pool.minimumStakeAmount)}
                </styled.td>
                <styled.td px="space.04" align="right" color="black" style={{ textAlign: 'right' }}>
                  {pool.fee}
                </styled.td>
                <styled.td px="space.04" align="right" style={{ textAlign: 'right' }}>
                  <StartStakingButton slug={slug} available={available} />
                </styled.td>
              </Table.Row>
            );
          })}
        </Table.Body>
      </Table.Table>
    </Table.Root>
  );
}
