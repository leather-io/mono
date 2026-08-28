import { Link as RouterLink, useNavigate } from 'react-router';

import { css, cx } from 'leather-styles/css';
import { styled } from 'leather-styles/jsx';
import { link as linkRecipe } from 'leather-styles/recipes';
import { HTMLStyledProps } from 'leather-styles/types';
import { ChainLogoIcon } from '~/components/icons/chain-logo';
import { InfoTooltipIcon } from '~/components/info-tooltip-icon';
import { LearnHoverCard } from '~/components/learn-hover-card';
import {
  ForceRowHeight,
  Table,
  hoverableRow,
  rowPadding,
  theadBorderBottom,
} from '~/components/table';
import { bitcoinStakingContent, bitcoinStakingLabels } from '~/content/bitcoin-staking-content';
import { learnArticles } from '~/content/learn-content';
import {
  BitcoinStakingPool,
  bitcoinStakingPoolList,
  getSignerManagerContracts,
  getStakingPoolFromSlug,
  isPoolAvailableOnNetwork,
  stakingProviderIdToSlug,
} from '~/data/bitcoin-staking-data';
import { pox5NetworkConfig } from '~/data/pox5-network-config';
import { PoolFeeValue } from '~/features/bitcoin-staking/components/pool-fee-value';
import { PoolTvlValue } from '~/features/bitcoin-staking/components/pool-tvl-value';
import { stakingPaths } from '~/pages/bitcoin-staking/bitcoin-staking.constants';

import { ArrowLeftIcon, Flag } from '@leather.io/ui';

import { StakingPoolAvatar } from './staking-pool-avatar';
import { StartStakingButton } from './start-staking-button';
import { useStakingPoolLink } from './use-staking-pool-link';

// Column widths live in one colgroup so the header and body always agree,
// regardless of what any individual cell happens to contain.
const columnWidths = ['32%', '17%', '15%', '16%', '20%'];

interface StakingProviderRowProps {
  pool: BitcoinStakingPool;
}

function StakingProviderRow({ pool }: StakingProviderRowProps) {
  const navigate = useNavigate();
  const slug = stakingProviderIdToSlug(pool.providerId);
  const { to } = useStakingPoolLink(slug);

  return (
    <Table.Row
      height="64px"
      className={to ? cx(rowPadding, hoverableRow) : rowPadding}
      onClick={to ? () => void navigate(to) : undefined}
    >
      <styled.td px="space.04" textAlign="left" color="black">
        <Flag
          img={<StakingPoolAvatar providerId={pool.providerId} size="sm" />}
          color="ink.text-primary"
        >
          {pool.name}
          {pool.requiresSelfClaim && (
            <styled.span display="block" textStyle="label.03" color="ink.text-subdued">
              {bitcoinStakingLabels.selfClaimOnly}
              <InfoTooltipIcon
                title={bitcoinStakingLabels.selfClaimOnly}
                explanation={bitcoinStakingContent.selfClaim.explanation}
                ariaLabel={`About ${bitcoinStakingLabels.selfClaimOnly}`}
                size={12}
              />
            </styled.span>
          )}
        </Flag>
      </styled.td>
      <styled.td px="space.04" textAlign="left" color="black">
        <Flag spacing="space.02" img={<ChainLogoIcon symbol="sBTC" />}>
          {pool.supportsBtcPayout ? 'sBTC / BTC' : 'sBTC'}
        </Flag>
      </styled.td>
      <styled.td px="space.04" textAlign="right" color="black">
        <PoolTvlValue
          signerManagerContractIds={getSignerManagerContracts(
            pool.providerId,
            pox5NetworkConfig.contractNetworkMode
          )}
          testId={`pool-tvl-${slug}`}
        />
      </styled.td>
      <styled.td px="space.04" textAlign="right" color="black">
        <PoolFeeValue pool={pool} />
      </styled.td>
      <styled.td px="space.04" textAlign="right" onClick={event => event.stopPropagation()}>
        <StartStakingButton slug={slug} />
      </styled.td>
    </Table.Row>
  );
}

// TVL is read from pox-5 directly; other pool stats (realized yield) have no
// data source yet — the stacking-tracker API only covers pox-4 pools. Only
// pools we hold a signer-manager contract id for are displayed.
export function StakingProviderTable(props: HTMLStyledProps<'div'>) {
  const availablePools = bitcoinStakingPoolList.filter(pool =>
    isPoolAvailableOnNetwork(pool, pox5NetworkConfig.contractNetworkMode)
  );
  const byosmPool = getStakingPoolFromSlug('byosm');

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
                article={learnArticles.totalLockedValueTvl}
                label={bitcoinStakingLabels.tvl}
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
          {availablePools.map(pool => (
            <StakingProviderRow key={pool.providerId} pool={pool} />
          ))}
        </Table.Body>
        <styled.tfoot>
          <Table.Row height="40px">
            <styled.td colSpan={columnWidths.length} textAlign="center" borderTop="default">
              <RouterLink
                to={stakingPaths.pool('byosm')}
                data-testid="byosm-entry-link"
                className={cx(
                  linkRecipe({ size: 'sm' }),
                  css({
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 'space.01',
                    color: 'ink.text-primary',
                  })
                )}
              >
                {byosmPool.name}
                <ArrowLeftIcon
                  variant="small"
                  color="ink.text-primary"
                  className={css({ transform: 'rotate(180deg)' })}
                />
              </RouterLink>
            </styled.td>
          </Table.Row>
        </styled.tfoot>
      </Table.Table>
    </Table.Root>
  );
}
