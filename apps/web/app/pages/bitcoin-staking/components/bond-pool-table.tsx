import { css, cx } from 'leather-styles/css';
import { styled } from 'leather-styles/jsx';
import { link as linkRecipe } from 'leather-styles/recipes';
import { HTMLStyledProps } from 'leather-styles/types';
import { BasicHoverCard } from '~/components/basic-hover-card';
import { ChainLogoIcon } from '~/components/icons/chain-logo';
import { ChainLogoGroup } from '~/components/icons/chain-logo-group';
import {
  ForceRowHeight,
  Table,
  hoverableRow,
  rowPadding,
  theadBorderBottom,
} from '~/components/table';
import { bitcoinStakingContent, bitcoinStakingLabels } from '~/content/bitcoin-staking-content';
import { BondPool, bondPoolList } from '~/data/bond-pool-data';
import { usePox5CycleClock } from '~/features/bitcoin-staking/hooks/use-pox5-cycle-clock';
import { LearnMoreLink } from '~/layouts/page/page';
import { openExternalLink } from '~/utils/external-links';

import { Button, ExternalLinkIcon, Flag, InfoCircleIcon } from '@leather.io/ui';

import { StakingPoolAvatar } from './staking-pool-avatar';

// Column widths live in one colgroup so the header and body always agree,
// regardless of what any individual cell happens to contain.
const columnWidths = ['24%', '18%', '15%', '13%', '12%', '18%'];

const { bondPools } = bitcoinStakingContent;

interface HeaderLabelProps {
  label: string;
  explanation: string;
  learnMoreUrl?: string;
}

// The learn articles the sibling tables hover are all written for STX pooling,
// so they describe the wrong product here. These explanations are local to the
// section, and hand off to whichever page actually documents the concept
// instead of a support post that contradicts it.
function HeaderLabel({ label, explanation, learnMoreUrl }: HeaderLabelProps) {
  const content = learnMoreUrl ? (
    <>
      {explanation}
      <LearnMoreLink destination={learnMoreUrl} />
    </>
  ) : (
    explanation
  );

  return (
    <BasicHoverCard title={label} content={content}>
      <styled.span textStyle="label.03" whiteSpace="nowrap" cursor="help">
        {label}
        <styled.span
          display="inline-flex"
          alignItems="center"
          height="1lh"
          verticalAlign="top"
          ml="space.01"
          aria-label={`About ${label}`}
        >
          <InfoCircleIcon variant="small" width={12} height={12} color="ink.text-subdued" />
        </styled.span>
      </styled.span>
    </BasicHoverCard>
  );
}

interface AccessLabelArgs {
  isOpen: boolean;
  isClosedForBond: boolean;
}

function getAccessLabel({ isOpen, isClosedForBond }: AccessLabelArgs): string {
  if (isClosedForBond) return bondPools.access.closedLabel;
  if (isOpen) return bondPools.access.openLabel;
  return bondPools.access.waitlistLabel;
}

interface BondPoolRowProps {
  pool: BondPool;
  isStakingClosed: boolean;
}

function BondPoolRow({ pool, isStakingClosed }: BondPoolRowProps) {
  // A pool that is open on the operator's side still cannot reach the bond
  // being prepared, so the prepare phase closes the deposit route here too.
  const isOpen = pool.access === 'open' && !isStakingClosed;
  const isClosedForBond = pool.access === 'open' && isStakingClosed;

  return (
    <Table.Row
      height="64px"
      className={isClosedForBond ? rowPadding : cx(rowPadding, hoverableRow)}
      onClick={isClosedForBond ? undefined : () => openExternalLink(pool.url)}
    >
      <styled.td px="space.04" textAlign="left" color="black">
        <Flag
          img={<StakingPoolAvatar providerId={pool.providerId} size="sm" />}
          color="ink.text-primary"
        >
          {pool.name}
          <styled.span display="block" textStyle="label.03" color="ink.text-subdued">
            {pool.offering}
          </styled.span>
        </Flag>
      </styled.td>
      <styled.td px="space.04" textAlign="left" color="black">
        <Flag spacing="space.02" img={<ChainLogoGroup symbols={pool.locked} />}>
          {pool.locked.join(' + ')}
        </Flag>
      </styled.td>
      <styled.td px="space.04" textAlign="left" color="black">
        <Flag spacing="space.02" img={<ChainLogoIcon symbol="sBTC" />}>
          {pool.rewards}
        </Flag>
      </styled.td>
      <styled.td px="space.04" textAlign="right" color="black">
        {pool.capacity}
      </styled.td>
      <styled.td px="space.04" textAlign="right" color="black">
        {pool.fee}
      </styled.td>
      <styled.td px="space.04" textAlign="right" onClick={event => event.stopPropagation()}>
        <Button
          size="sm"
          variant={isOpen ? 'solid' : 'outline'}
          whiteSpace="nowrap"
          minW="fit-content"
          disabled={isClosedForBond}
          iconEnd={isClosedForBond ? undefined : ExternalLinkIcon}
          onClick={isClosedForBond ? undefined : () => openExternalLink(pool.url)}
          data-testid={`bond-pool-${isClosedForBond ? 'closed' : pool.access}-${pool.slug}`}
        >
          {getAccessLabel({ isOpen, isClosedForBond })}
        </Button>
      </styled.td>
    </Table.Row>
  );
}

// Every row leaves Leather: pox-5 exposes no pooling interface, so joining a
// bond pool happens in the operator's own app against their own contract. An
// open pool links to that flow, a full one to the operator's waitlist. The
// footer routes the institutional path, which the Endowment brokers rather
// than any pool.
export function BondPoolTable(props: HTMLStyledProps<'div'>) {
  const { cycleClock } = usePox5CycleClock();
  // Absent clock data leaves the row as the registry describes it, so a failed
  // pox-info fetch cannot silently present an open pool as closed.
  const isStakingClosed = cycleClock?.clock.isInPreparePhase ?? false;

  return (
    <Table.Root width="100%" overflowX="auto" {...props}>
      <Table.Table tableLayout="fixed" minWidth="820px">
        <colgroup>
          {columnWidths.map((width, index) => (
            <col key={index} style={{ width }} />
          ))}
        </colgroup>
        <Table.Head className={theadBorderBottom}>
          <Table.Row className={rowPadding}>
            <Table.Header px="space.04" textAlign="left">
              <ForceRowHeight>
                <HeaderLabel
                  label={bitcoinStakingLabels.provider}
                  explanation={bondPools.providerInfo}
                  learnMoreUrl={bondPools.providerInfoUrl}
                />
              </ForceRowHeight>
            </Table.Header>
            <Table.Header px="space.04" textAlign="left">
              <HeaderLabel
                label={bitcoinStakingLabels.lockedTokens}
                explanation={bondPools.lockedInfo}
                learnMoreUrl={bondPools.lockedInfoUrl}
              />
            </Table.Header>
            <Table.Header px="space.04" textAlign="left">
              <HeaderLabel
                label={bitcoinStakingLabels.rewardsToken}
                explanation={bondPools.rewardsInfo}
                learnMoreUrl={bondPools.rewardsInfoUrl}
              />
            </Table.Header>
            <Table.Header px="space.04" textAlign="right">
              <HeaderLabel
                label={bitcoinStakingLabels.capacity}
                explanation={bondPools.capacityInfo}
                learnMoreUrl={bondPools.capacityInfoUrl}
              />
            </Table.Header>
            <Table.Header px="space.04" textAlign="right">
              <HeaderLabel label={bitcoinStakingLabels.fee} explanation={bondPools.feeInfo} />
            </Table.Header>
            <Table.Header px="space.04" textAlign="right">
              <HeaderLabel
                label={bitcoinStakingLabels.access}
                explanation={bondPools.access.info}
                learnMoreUrl={bondPools.access.infoUrl}
              />
            </Table.Header>
          </Table.Row>
        </Table.Head>
        <Table.Body>
          {bondPoolList.map(pool => (
            <BondPoolRow key={pool.slug} pool={pool} isStakingClosed={isStakingClosed} />
          ))}
        </Table.Body>
        <styled.tfoot>
          <Table.Row height="40px">
            <styled.td colSpan={columnWidths.length} textAlign="center" borderTop="default">
              <styled.button
                onClick={() => openExternalLink(bondPools.directBond.url)}
                data-testid="direct-bond-entry-link"
                className={cx(
                  linkRecipe({ size: 'sm' }),
                  css({
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 'space.01',
                    color: 'ink.text-primary',
                    cursor: 'pointer',
                  })
                )}
              >
                {bondPools.directBond.label}
                <ExternalLinkIcon variant="small" color="ink.text-primary" />
              </styled.button>
            </styled.td>
          </Table.Row>
        </styled.tfoot>
      </Table.Table>
    </Table.Root>
  );
}
