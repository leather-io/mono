import { ReactElement, ReactNode } from 'react';

import { css } from 'leather-styles/css';
import { Box, VStack, styled } from 'leather-styles/jsx';
import { InfoGrid } from '~/components/info-grid/info-grid';
import { ValueDisplayer } from '~/components/value-displayer/default-value-displayer';
import { PostLabelHoverCard } from '~/components/post-label-hover-card';
import { CopyAddress } from '~/features/stacking/components/address';
import { ProtocolInfo } from '~/queries/protocols/use-protocol-info';
import { Protocol } from '~/features/stacking/start-liquid-stacking/utils/types-preset-protocols';
import { getLearnMoreLink } from '~/features/page/page';
import { usePost, getPosts } from '~/utils/post-utils';
import { getPostSlugForProvider } from '~/data/data';
import {
  toHumanReadableDays,
  toHumanReadablePercent,
  toHumanReadableStx,
} from '~/utils/unit-convert';

import { Flag } from '@leather.io/ui';

interface RewardTokenCellProps {
  icon: ReactNode;
  symbol: string;
}
function RewardTokenCell({ icon, symbol }: RewardTokenCellProps): ReactElement {
  const posts = getPosts();
  const post = posts.stackingRewardsTokens;
  
  return (
    <ValueDisplayer
      name={<PostLabelHoverCard post={post} label="Rewards token" textStyle="label.02" />}
      value={
        <Flag spacing="space.02" img={icon}>
          {symbol}
        </Flag>
      }
    />
  );
}

interface LockupPeriodCellProps {
  lockupPeriod?: string;
}
function LockupPeriodCell({ lockupPeriod = '1 Cycle' }: LockupPeriodCellProps): ReactElement {
  const posts = getPosts();
  const post = posts.stackingMinimumLockupPeriod;
  
  return <ValueDisplayer 
    name={<PostLabelHoverCard post={post} label="Minimum lockup period" textStyle="label.02" />} 
    value={lockupPeriod} 
  />;
}

interface DaysUntilNextCycleCellProps {
  daysUntilNextCycle: number;
  nextCycleNumber: number;
  nextCycleBlocks: number;
}
function DaysUntilNextCycleCell({
  daysUntilNextCycle,
  nextCycleBlocks,
  nextCycleNumber,
}: DaysUntilNextCycleCellProps): ReactElement {
  const posts = getPosts();
  const post = posts.stackingUpcomingCycle;
  
  return (
    <ValueDisplayer
      name={<PostLabelHoverCard post={post} label="Days until next cycle" textStyle="label.02" />}
      value={
        <>
          {toHumanReadableDays(daysUntilNextCycle)}{' '}
          <Box textStyle="label.03">
            Cycle {nextCycleNumber} - {nextCycleBlocks} blocks
          </Box>
        </>
      }
    />
  );
}

interface MinimumCommitmentCellProps {
  minimumCommitment?: number;
  minimumCommitmentUsd?: string;
}
function MinimumCommitmentCell({
  minimumCommitment,
  minimumCommitmentUsd,
}: MinimumCommitmentCellProps): ReactElement {
  const posts = getPosts();
  const post = posts.stackingMinimumCommitment;
  
  return (
    <ValueDisplayer
      name={<PostLabelHoverCard post={post} label="Minimum commitment" textStyle="label.02" />}
      value={
        <>
          {toHumanReadableStx(minimumCommitment || 0)}{' '}
          <Box textStyle="label.03">{minimumCommitmentUsd}</Box>
        </>
      }
    />
  );
}

interface HistoricalAprCellProps {
  apr?: number;
}
function HistoricalAprCell({ apr }: HistoricalAprCellProps): ReactElement {
  const posts = getPosts();
  const post = posts.historicalYield;
  
  return <ValueDisplayer 
    name={<PostLabelHoverCard post={post} label="Historical yield" textStyle="label.02" />} 
    value={toHumanReadablePercent(apr || 0)} 
  />;
}

interface TotalValueLockedCellProps {
  totalValueLocked?: number;
  totalValueLockedUsd?: string;
}
function TotalValueLockedCell({
  totalValueLocked,
  totalValueLockedUsd,
}: TotalValueLockedCellProps): ReactElement {
  const posts = getPosts();
  const post = posts.totalLockedValueTvl;
  
  return (
    <ValueDisplayer
      name={<PostLabelHoverCard post={post} label="Total value locked" textStyle="label.02" />}
      value={
        <>
          {toHumanReadableStx(totalValueLocked || 0)}{' '}
          <Box textStyle="label.03">{totalValueLockedUsd}</Box>
        </>
      }
    />
  );
}

interface ProtocolCellProps {
  icon: ReactNode;
  name: string;
  description: string;
  postSlug?: string;
}
function ProtocolCell({ description, icon, name, postSlug }: ProtocolCellProps): ReactElement {
  const post = usePost(postSlug || '');
  const hasValidPost = !!postSlug && !!post;
  
  return (
    <VStack gap="space.05" alignItems="left" p="space.05">
      {icon}
      <styled.h4 textDecoration="underline" textStyle="label.01">
        {name}
      </styled.h4>
      {hasValidPost ? (
        <styled.p textStyle="caption.01">
          {post?.sentence || ''}
          {post?.slug && post?.sentence ? getLearnMoreLink(post.slug, post.sentence) : <></>}
        </styled.p>
      ) : (
        <styled.p textStyle="caption.01">{description}</styled.p>
      )}
    </VStack>
  );
}

interface ProtocolStatusProps {
  status: string;
}
function ProtocolStatusCell({ status }: ProtocolStatusProps): ReactElement {
  return (
    <ValueDisplayer
      gap="space.04"
      name="Status"
      value={
        <Box textStyle="label.03" color="green.action-primary-default">
          {status}
        </Box>
      }
    />
  );
}

interface ContractAddressCellProps {
  address: string;
}
function ContractAddressCell({ address }: ContractAddressCellProps): ReactElement {
  return (
    <ValueDisplayer
      gap="space.04"
      name="Contract address"
      value={<CopyAddress address={address} />}
    />
  );
}

export interface ProtocolOverviewProps {
  info?: ProtocolInfo;
  protocol?: Protocol;
  protocolSlug?: string;
  isStackingPage?: boolean;
}

export function ProtocolOverview({ isStackingPage, info, protocol, protocolSlug }: ProtocolOverviewProps): ReactElement {
  const isStackingPageOrUndefined = isStackingPage ? true : undefined;
  const posts = getPosts();
  
  // Handle case where we have a protocol object from the new interface
  if (protocol && protocolSlug) {
    return (
      <InfoGrid
        width="100%"
        gridTemplateColumns={['repeat(1, 1fr)', 'repeat(1, 1fr)', 'repeat(3, 1fr)']}
        gridTemplateRows={['auto', 'auto', 'auto', 'auto', 'auto', 'auto', 'auto']}
        height="fit-content"
        className={css({ '& > *:not(:first-child)': { height: ['120px', null, 'unset'] } })}
        borderTop="0px"
        borderLeft="0px"
        borderRight="0px"
        borderRadius="0px"
      >
        <InfoGrid.Cell gridColumn={['span 1', 'span 1', 'auto']} gridRow={['1', '1', 'span 2']}>
          <ProtocolCell 
            icon={protocol.icon} 
            name={protocol.name} 
            description={protocol.description || ''}
            postSlug={getPostSlugForProvider(protocolSlug)} 
          />
        </InfoGrid.Cell>
        <InfoGrid.Cell gridColumn={['1', '1', '2']} gridRow={['2', '2', '1']}>
          <ValueDisplayer
            name={<PostLabelHoverCard post={posts.historicalYield} label="Historical yield" textStyle="label.02" />}
            value={(protocol as any).estApr || "—"}
          />
        </InfoGrid.Cell>
        <InfoGrid.Cell gridColumn={['1', '1', '3']} gridRow={['3', '3', '1']}>
          <ValueDisplayer
            name={<PostLabelHoverCard post={posts.totalLockedValueTvl} label="Total value locked" textStyle="label.02" />}
            value={(protocol as any).tvl || "—"}
          />
        </InfoGrid.Cell>
        <InfoGrid.Cell gridColumn={['1', '1', '2']} gridRow={['4', '4', '2']}>
          <ValueDisplayer
            name={<PostLabelHoverCard post={posts.stackingRewardsTokens} label="Rewards token" textStyle="label.02" />}
            value={
              <>
                {protocol.liquidToken}
                <Box textStyle="label.03">{"-"}</Box>
              </>
            }
          />
        </InfoGrid.Cell>
        <InfoGrid.Cell gridColumn={['1', '1', '3']} gridRow={['5', '5', '2']}>
          <ValueDisplayer
            name={<PostLabelHoverCard post={posts.stackingMinimumCommitment} label="Minimum commitment" textStyle="label.02" />}
            value={typeof protocol.minimumDelegationAmount === 'number' ? 
              toHumanReadableStx(protocol.minimumDelegationAmount) : 
              String(protocol.minimumDelegationAmount || '')}
          />
        </InfoGrid.Cell>
      </InfoGrid>
    );
  }

  // Handle legacy case where we have the info object
  if (!info) return <></>;

  return (
    <VStack gap="0">
      <InfoGrid
        width="100%"
        gridTemplateColumns={['repeat(2, 1fr)', 'repeat(2, 1fr)', 'repeat(4, 1fr)']}
        gridTemplateRows={['auto', 'auto', 'auto', 'auto', 'auto', 'auto', 'auto']}
        height="fit-content"
        className={css({ '& > *:not(:first-child)': { height: ['120px', null, 'unset'] } })}
        borderTop={isStackingPageOrUndefined && '0px'}
        borderLeft={isStackingPageOrUndefined && '0px'}
        borderRight={isStackingPageOrUndefined && '0px'}
        borderRadius={isStackingPageOrUndefined && '0px'}
      >
        <InfoGrid.Cell gridColumn={['span 2', 'span 2', 'auto']} gridRow={['1', '1', 'span 2']}>
          {isStackingPageOrUndefined ? (
            <ProtocolCell icon={info.logo} name={info.name} description={info.description} />
          ) : (
            <ProtocolStatusCell status="Active" />
          )}
        </InfoGrid.Cell>
        <InfoGrid.Cell gridColumn={['1', '1', '2']} gridRow={['2', '2', '1']}>
          <HistoricalAprCell apr={info.apr} />
        </InfoGrid.Cell>
        <InfoGrid.Cell gridColumn={['2', '2', '2']} gridRow={['2', '2', '2']}>
          <LockupPeriodCell />
        </InfoGrid.Cell>
        <InfoGrid.Cell gridColumn={['1', '1', '3']} gridRow={['3', '3', '1']}>
          <TotalValueLockedCell totalValueLocked={info.tvl} totalValueLockedUsd={info.tvlUsd} />
        </InfoGrid.Cell>
        <InfoGrid.Cell gridColumn={['2', '2', '3']} gridRow={['3', '3', '2']}>
          <DaysUntilNextCycleCell
            daysUntilNextCycle={info.nextCycleDays}
            nextCycleBlocks={info.nextCycleBlocks}
            nextCycleNumber={info.nextCycleNumber}
          />
        </InfoGrid.Cell>
        <InfoGrid.Cell gridColumn={['1', '1', '4']} gridRow={['4', '4', '1']}>
          <RewardTokenCell icon={info.payoutIcon} symbol={info.payout} />
        </InfoGrid.Cell>
        <InfoGrid.Cell gridColumn={['2', '2', '4']} gridRow={['4', '4', '2']}>
          <MinimumCommitmentCell
            minimumCommitment={info.minimumCommitment}
            minimumCommitmentUsd={info.minimumCommitmentUsd}
          />
        </InfoGrid.Cell>
      </InfoGrid>
      {!isStackingPageOrUndefined && (
        <InfoGrid
          borderTop="none"
          borderTopRadius="0"
          mt="0"
          width="100%"
          display={['none', 'none', 'grid']}
          gridTemplateColumns="repeat(2, 1fr)"
          gridTemplateRows="auto"
          height="fit-content"
        >
          <InfoGrid.Cell>
            <ContractAddressCell address={info.contractAddress} />
          </InfoGrid.Cell>
        </InfoGrid>
      )}
    </VStack>
  );
}
