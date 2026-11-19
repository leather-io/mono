import { type ReactElement } from 'react';

import { Box, Flex, type GridProps, styled } from 'leather-styles/jsx';
import { BasicPageHoverCard } from '~/components/basic-page/basic-page-hover-card';
import { SbtcLogo } from '~/components/icons/sbtc-logo';
import { ValueDisplayer } from '~/components/value-displayer/default-value-displayer';
import { LearnMoreLink } from '~/layouts/page/page';
import { type SbtcPool, rewardsTokenConcept } from '~/pages/sbtc/sbtc.data';

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
  return (
    <Flex flex={1} justifyContent="space-between" flexDir="column" p="space.05" minH="246px">
      <styled.img width="32px" height="32px" src={pool.logo} alt="Sbtc Logo" />
      <Box>
        <styled.h3 textStyle="heading.05" mt="space.05">
          {pool.title}
        </styled.h3>
        <styled.div textStyle="caption.01" mt="space.01">
          {pool.description}
          <LearnMoreLink destination={pool.learnMoreSlug} />
        </styled.div>
        <Box mt="space.04">{action}</Box>
      </Box>
    </Flex>
  );
}

function VariableYieldCell(): ReactElement {
  return <ValueDisplayer name="Yield" value="Variable" textAlign="left" />;
}

function ProviderFeesCell(): ReactElement {
  return <ValueDisplayer name="Fees" value="See provider" textAlign="left" />;
}

function MinimumCommitmentCell(): ReactElement {
  return <ValueDisplayer name="Minimum commitment" value="See provider" textAlign="left" />;
}

function PayoutTokenCell({ pool }: RewardProtocolCellProps): ReactElement {
  const payoutTokens = ensureArray(pool.payoutToken);
  return (
    <ValueDisplayer
      name={
        <BasicPageHoverCard
          title={rewardsTokenConcept.name}
          slug={rewardsTokenConcept.slug}
          description={rewardsTokenConcept.description}
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
        <VariableYieldCell key={`${pool.id}-yield`} />,
        <ProviderFeesCell key={`${pool.id}-fees`} />,
        <MinimumCommitmentCell key={`${pool.id}-minCommitment`} />,
        <PayoutTokenCell key={`${pool.id}-token`} pool={pool} />,
      ]}
      {...props}
    />
  );
}
