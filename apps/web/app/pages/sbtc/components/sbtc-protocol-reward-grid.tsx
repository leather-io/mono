import { ReactElement } from 'react';
import { useLoaderData } from 'react-router';

import { Box, Flex, GridProps, styled } from 'leather-styles/jsx';
import { BasicPageHoverCard } from '~/components/basic-page/basic-page-hover-card';
import { SbtcLogo } from '~/components/icons/sbtc-logo';
import { ValueDisplayer } from '~/components/value-displayer/default-value-displayer';
import { urlFor } from '~/constants/cms-client';
import { LearnMoreLink } from '~/layouts/page/page';
import { loader } from '~/pages/sbtc/sbtc.route';

import { SbtcPool } from '@leather.io/cms';
import { Flag } from '@leather.io/ui';
import { ensureArray } from '@leather.io/utils';

import { SbtcProtocolRewardGridLayout } from './sbtc-protocol-reward-grid.layout';

interface RewardProtocolCellProps {
  pool: SbtcPool;
}

function RewardProtocolEnrollCell({
  pool,
  action,
}: RewardProtocolCellProps & { action: React.ReactElement }): ReactElement {
  /**
   * @deprecated All links and posts should be migrated to Sanity content. This is ok to keep around for a long time to come
   * but should eventually be removed in favor of Sanity based
   */
  const legacyPostSlug: Record<string, string> = {
    basic: 'sbtc-rewards-basic',
    alex: 'alex-sbtc-pools',
    bitflow: 'bitflow-sbtc-pools',
    velar: 'velar-sbtc-pools',
    zest: 'zest-sbtc-pools',
  };

  return (
    <Flex flex={1} justifyContent="space-between" flexDir="column" p="space.05" minH="246px">
      <styled.img
        width="32px"
        height="32px"
        src={urlFor(pool.logo).width(32).height(32).url()}
        alt="Sbtc Logo"
      />
      <Box>
        <styled.h3 textStyle="heading.05" mt="space.05">
          {pool.title}
        </styled.h3>
        <styled.div textStyle="caption.01" mt="space.01">
          {pool.description}
          <LearnMoreLink destination={legacyPostSlug[pool.id]} />
        </styled.div>
        <Box mt="space.04">{action}</Box>
      </Box>
    </Flex>
  );
}

function TotalValueLockedCell({ pool }: RewardProtocolCellProps): ReactElement {
  const {
    concepts: { tvlConcept },
  } = useLoaderData<typeof loader>();
  if (!tvlConcept) return <></>;
  return (
    <ValueDisplayer
      name={
        <BasicPageHoverCard
          title={tvlConcept?.name ?? 'Total Value Locked (TVL)'}
          slug={tvlConcept?.relatedLegacyPost?.slug.current ?? ''}
          description={tvlConcept?.description ?? ''}
          label="Total Value Locked (TVL)"
          textStyle="label.03"
        />
      }
      value={
        <>
          {pool.tvl}
          <Box textStyle="label.03">{pool.tvlUsd}</Box>
        </>
      }
      textAlign="left"
    />
  );
}

function HistoricalAprCell({ pool }: RewardProtocolCellProps): ReactElement {
  const {
    concepts: { historicalYieldConcept },
  } = useLoaderData<typeof loader>();
  if (!historicalYieldConcept) return <></>;
  return (
    <ValueDisplayer
      name={
        <BasicPageHoverCard
          title={historicalYieldConcept?.name ?? 'Historical yield'}
          slug={historicalYieldConcept?.relatedLegacyPost?.slug.current ?? ''}
          description={historicalYieldConcept?.description ?? ''}
          label="Historical yield"
          textStyle="label.03"
        />
      }
      value={pool.apr}
      textAlign="left"
    />
  );
}

function MinimumCommitmentCell({ pool }: RewardProtocolCellProps) {
  const {
    concepts: { minimumCommitmentConcept },
  } = useLoaderData<typeof loader>();
  if (!minimumCommitmentConcept) return <></>;
  return (
    <ValueDisplayer
      name={
        <BasicPageHoverCard
          title={minimumCommitmentConcept?.name ?? 'Minimum commitment'}
          slug={minimumCommitmentConcept?.relatedLegacyPost?.slug.current ?? ''}
          description={minimumCommitmentConcept?.description ?? ''}
          label="Minimum commitment"
          textStyle="label.03"
        />
      }
      value={
        <>
          {pool.minCommitment}
          <Box textStyle="label.03">{pool.minCommitmentUsd}</Box>
        </>
      }
      textAlign="left"
    />
  );
}

function PayoutTokenCell({ pool }: RewardProtocolCellProps): ReactElement {
  const payoutTokens = ensureArray(pool.payoutToken);
  const {
    concepts: { rewardsTokenConcept },
  } = useLoaderData<typeof loader>();
  if (!rewardsTokenConcept) return <></>;
  return (
    <ValueDisplayer
      name={
        <BasicPageHoverCard
          title={rewardsTokenConcept?.name ?? 'Rewards token'}
          slug={rewardsTokenConcept?.relatedLegacyPost?.slug.current ?? ''}
          description={rewardsTokenConcept?.description ?? ''}
          label="Rewards token"
          textStyle="label.03"
        />
      }
      value={
        <Flex gap="space.02">
          {payoutTokens.map(token =>
            token === 'sBTC' ? (
              <Flag key={token} spacing="space.02" img={<SbtcLogo size={24} />}>
                {token}
              </Flag>
            ) : (
              <Box key={token}>{token}</Box>
            )
          )}
        </Flex>
      }
      textAlign="left"
    />
  );
}

interface SbtcProtocolRewardGridProps extends GridProps {
  pool: SbtcPool;
  enrollAction: React.ReactElement;
}
export function SbtcProtocolRewardGrid({
  pool,
  enrollAction,
  ...props
}: SbtcProtocolRewardGridProps): ReactElement {
  return (
    <SbtcProtocolRewardGridLayout
      primaryCell={<RewardProtocolEnrollCell pool={pool} action={enrollAction} />}
      cells={[
        <TotalValueLockedCell key={`${pool.id}-tvl`} pool={pool} />,
        <HistoricalAprCell key={`${pool.id}-apr`} pool={pool} />,
        <MinimumCommitmentCell key={`${pool.id}-minCommitment`} pool={pool} />,
        <PayoutTokenCell key={`${pool.id}-token`} pool={pool} />,
      ]}
      {...props}
    />
  );
}
