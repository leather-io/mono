import { HStack, styled } from 'leather-styles/jsx';
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
import { pox5NetworkConfig } from '~/data/pox5-network-config';
import { PoolFeeValue } from '~/features/bitcoin-staking/components/pool-fee-value';

import { Flag } from '@leather.io/ui';

import { ClaimRewardsButton } from './claim-rewards-button';
import { StartStakingButton } from './start-staking-button';

// Column widths live in one colgroup so the header and body always agree,
// regardless of what any individual cell happens to contain.
const columnWidths = ['44%', '20%', '16%', '20%'];

// Static-config table: pox-5 pool stats (TVL, realized yield) have no external
// data source yet — the stacking-tracker API only covers pox-4 pools. Only
// pools we hold a signer-manager contract id for are displayed.
export function StakingProviderTable(props: HTMLStyledProps<'div'>) {
  const availablePools = bitcoinStakingPoolList.filter(pool =>
    isPoolAvailableOnNetwork(pool, pox5NetworkConfig.contractNetworkMode)
  );

  return (
    <Table.Root width="100%" overflowX="auto" {...props}>
      <Table.Table tableLayout="fixed" minWidth="720px">
        <colgroup>
          {columnWidths.map((width, index) => (
            <col key={index} style={{ width }} />
          ))}
        </colgroup>
        <Table.Head className={theadBorderBottom}>
          <Table.Row className={rowPadding}>
            <Table.Header px="space.04" textAlign="left">
              <ForceRowHeight>
                <LearnHoverCard
                  article={learnArticles.stackingProviders}
                  label={bitcoinStakingLabels.provider}
                  textStyle="label.03"
                />
              </ForceRowHeight>
            </Table.Header>
            <Table.Header px="space.04" textAlign="left">
              <LearnHoverCard
                article={learnArticles.stackingRewardsTokens}
                label={bitcoinStakingLabels.rewardsToken}
                textStyle="label.03"
              />
            </Table.Header>
            <Table.Header px="space.04" textAlign="right">
              <LearnHoverCard
                article={learnArticles.stackingPoolFees}
                label={bitcoinStakingLabels.fee}
                textStyle="label.03"
              />
            </Table.Header>
            <Table.Header px="space.04" textAlign="right" />
          </Table.Row>
        </Table.Head>
        <Table.Body>
          {availablePools.map(pool => {
            const slug = stakingProviderIdToSlug(pool.providerId);
            return (
              <Table.Row key={pool.providerId} height="64px" className={rowPadding}>
                <styled.td px="space.04" textAlign="left" color="black">
                  <Flag
                    img={<ProviderIcon providerId={pool.providerId} />}
                    color="ink.text-primary"
                  >
                    {pool.name}
                  </Flag>
                </styled.td>
                <styled.td px="space.04" textAlign="left" color="black">
                  <Flag spacing="space.02" img={<ChainLogoIcon symbol="sBTC" />}>
                    sBTC
                  </Flag>
                </styled.td>
                <styled.td px="space.04" textAlign="right" color="black">
                  <PoolFeeValue pool={pool} />
                </styled.td>
                <styled.td px="space.04" textAlign="right">
                  <HStack gap="space.02" justifyContent="flex-end">
                    <ClaimRewardsButton slug={slug} />
                    <StartStakingButton slug={slug} />
                  </HStack>
                </styled.td>
              </Table.Row>
            );
          })}
        </Table.Body>
      </Table.Table>
    </Table.Root>
  );
}
