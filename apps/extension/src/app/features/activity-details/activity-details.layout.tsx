import { ActivitySelectors } from '@tests/selectors/activity.selectors';
import { Flex, Stack, styled } from 'leather-styles/jsx';

import {
  type BlockchainActivityDirection,
  type BlockchainActivityItem,
  buildBlockchainActivityHeroLines,
  interpolateActivityTemplate,
} from '@leather.io/features';
import type { BlockchainActivityBalanceChange, CryptoAsset, Money } from '@leather.io/models';
import {
  BlockchainActivityAvatarIcon,
  BlockchainActivityIndicatorIcon,
  Button,
  ExternalLinkIcon,
  ListItemBox,
} from '@leather.io/ui';
import { truncateMiddle } from '@leather.io/utils';

import { formatCurrency } from '@app/common/currency-formatter';
import { useStacksExplorerLink } from '@app/common/hooks/use-stacks-explorer-link';
import { Balance } from '@app/components/balance/balance';
import { DetailsCopyValue } from '@app/components/details/details-copy-value';
import { DetailsLinkValue } from '@app/components/details/details-link-value';
import { DetailsRow } from '@app/components/details/details-row';
import { DetailsScreen } from '@app/components/details/details-screen';
import { DetailsSection } from '@app/components/details/details-section';

import type { SbtcDepositOverlay } from '../activity-list/sbtc-deposit-overlay';
import { ActivityDetailsActions } from './activity-details-actions';
import { ActivityDetailsHeader } from './activity-details-header';
import { useOpenActivityInExplorer } from './use-open-activity-in-explorer';

const heroAvatarSize = 48;
const heroIndicatorSize = 16;
const transferAvatarSize = 32;
const transferIndicatorSize = 12;

const dateTimeFormat = new Intl.DateTimeFormat(undefined, {
  dateStyle: 'medium',
  timeStyle: 'short',
});

function assetLabel(asset: CryptoAsset) {
  return asset.category === 'fungible' ? asset.symbol : asset.protocol;
}

function resolveOperator(direction: BlockchainActivityDirection) {
  return direction === 'received' ? '+' : '−';
}

function sortReceivedFirst(changes: BlockchainActivityBalanceChange[]) {
  return [
    ...changes.filter(change => change.direction === 'received'),
    ...changes.filter(change => change.direction === 'sent'),
  ];
}

function formatContractId(contractId: string) {
  const [address, name] = contractId.split('.');
  return name ? `${truncateMiddle(address)}.${name}` : truncateMiddle(contractId);
}

function formatFee(fee: Money, quote?: Money) {
  return quote ? `${formatCurrency(fee)} (${formatCurrency(quote)})` : formatCurrency(fee);
}

interface BalanceChangeRowProps {
  change: BlockchainActivityBalanceChange;
}

function BalanceChangeRow({ change }: BalanceChangeRowProps) {
  const received = change.direction === 'received';
  return (
    <Flex px="space.05" py="space.01">
      <ListItemBox
        variant="plain"
        leading={
          <BlockchainActivityAvatarIcon
            avatar={{ kind: 'single', asset: change.asset }}
            size={transferAvatarSize}
            indicator={
              <BlockchainActivityIndicatorIcon
                indicator={change.direction}
                size={transferIndicatorSize}
              />
            }
          />
        }
        title={<styled.span textStyle="label.02">{assetLabel(change.asset)}</styled.span>}
        caption={received ? 'Received' : 'Sent'}
        trailing={
          <Balance
            balance={change.amount.crypto}
            operator={resolveOperator(change.direction)}
            formattingOptions={{ showCurrency: false }}
            color={received ? 'green.action-primary-default' : 'ink.text-primary'}
            textStyle="label.02"
            whiteSpace="nowrap"
            formatCurrency={formatCurrency}
          />
        }
        trailingCaption={
          <Balance
            balance={change.amount.quote}
            color="ink.text-subdued"
            textStyle="caption.01"
            whiteSpace="nowrap"
            formatCurrency={formatCurrency}
          />
        }
      />
    </Flex>
  );
}

interface ActivityDetailsHeroProps {
  item: BlockchainActivityItem;
  overlay?: SbtcDepositOverlay;
}

function ActivityDetailsHero({ item, overlay }: ActivityDetailsHeroProps) {
  const { view } = item;
  const hero = buildBlockchainActivityHeroLines(view, interpolateActivityTemplate);
  const openInExplorer = useOpenActivityInExplorer();
  return (
    <Stack
      bg="ink.background-primary"
      alignItems="center"
      justifyContent="center"
      px="space.05"
      pt="space.03"
      pb="space.05"
      gap="space.03"
    >
      <BlockchainActivityAvatarIcon
        avatar={view.avatar}
        size={heroAvatarSize}
        indicator={
          <BlockchainActivityIndicatorIcon indicator={view.indicator} size={heroIndicatorSize} />
        }
      />
      <Stack gap="space.00" alignItems="center">
        <styled.span textStyle="heading.03" textAlign="center">
          {overlay?.title ?? hero.title}
        </styled.span>
        {overlay ? (
          <styled.span textStyle="label.01" color={overlay.statusColor} textAlign="center">
            {overlay.statusLabel}
          </styled.span>
        ) : null}
        {!overlay && hero.subtitle ? (
          <styled.span textStyle="label.01" color="ink.text-subdued" textAlign="center">
            {hero.subtitle}
          </styled.span>
        ) : null}
      </Stack>
      <ActivityDetailsActions item={item} reclaimUrl={overlay?.reclaimUrl} />
      <Button
        mt={'space.02'}
        px={'space.07'}
        variant="outline"
        iconEnd={ExternalLinkIcon}
        onClick={() => openInExplorer(view.chain, view.txid)}
        data-testid={ActivitySelectors.ActivityDetailsExplorer}
      >
        View in explorer
      </Button>
    </Stack>
  );
}

interface ActivityDetailsLayoutProps {
  item: BlockchainActivityItem;
  overlay?: SbtcDepositOverlay;
  feeQuote?: Money;
  onBack(): void;
}

export function ActivityDetailsLayout({
  item,
  overlay,
  feeQuote,
  onBack,
}: ActivityDetailsLayoutProps) {
  const { activity, view } = item;
  const { getStacksAddressLink } = useStacksExplorerLink();
  const { contract } = activity;

  return (
    <DetailsScreen
      header={<ActivityDetailsHeader onBack={onBack} />}
      testId={ActivitySelectors.ActivityDetails}
      overview={<ActivityDetailsHero item={item} overlay={overlay} />}
    >
      <DetailsSection title="Transaction details">
        <DetailsRow label="Date" value={dateTimeFormat.format(new Date(view.timestamp * 1000))} />
        {activity.counterparty ? (
          <DetailsRow
            label={activity.initiatedByUser ? 'To' : 'From'}
            value={<DetailsCopyValue value={activity.counterparty} />}
          />
        ) : null}
        {contract ? (
          <DetailsRow
            label="Contract"
            value={
              <DetailsLinkValue href={getStacksAddressLink(contract.contractId)}>
                {formatContractId(contract.contractId)}
              </DetailsLinkValue>
            }
          />
        ) : null}
        {activity.contract?.type === 'call' ? (
          <DetailsRow label="Function" value={activity.contract.functionName} />
        ) : null}
        {activity.protocolName ? (
          <DetailsRow label="Protocol" value={activity.protocolName} />
        ) : null}
        {activity.fee ? <DetailsRow label="Fee" value={formatFee(activity.fee, feeQuote)} /> : null}
        {view.chain === 'stacks' && activity.nonce !== undefined ? (
          <DetailsRow label="Nonce" value={String(activity.nonce)} />
        ) : null}
        {activity.blockHeight !== undefined ? (
          <DetailsRow label="Block" value={activity.blockHeight.toLocaleString()} />
        ) : null}
        <DetailsRow label="Transaction ID" value={<DetailsCopyValue value={view.txid} />} />
      </DetailsSection>

      {activity.balanceChanges.length > 0 ? (
        <DetailsSection title="Balance changes">
          {sortReceivedFirst(activity.balanceChanges).map(change => (
            <BalanceChangeRow
              key={`${change.direction}-${assetLabel(change.asset)}`}
              change={change}
            />
          ))}
        </DetailsSection>
      ) : null}
    </DetailsScreen>
  );
}
