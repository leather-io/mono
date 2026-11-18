import {
  Children,
  Fragment,
  type ReactNode,
  cloneElement,
  createContext,
  isValidElement,
  useContext,
} from 'react';

import { css } from 'leather-styles/css';
import { Box, Flex, Stack, styled } from 'leather-styles/jsx';

import {
  BlockchainActivityIndicatorIcon,
  ChevronDownIcon,
  ChevronUpIcon,
  UnlockIcon,
  UserIcon,
} from '@leather.io/ui';

import {
  type ApprovalHistoryState,
  type ApprovalRecipientName,
  type DirectionAccountBlockProps,
  type DirectionAssetRowProps,
  type DirectionFeeRowProps,
  type DirectionGuaranteeProps,
  type DirectionHistoryStatusProps,
  type DirectionRecipientRowProps,
  type DirectionSectionProps,
  isWhatMovesLabel,
} from '../pattern/approval-direction';
import { ApprovalEstimateSource, ApproxAmount } from '../pattern/approval-estimate';
import { truncateMiddle } from '../pattern/approval-format';
import { historyStatusText } from '../pattern/approval-history';
import { useApprovalHistoryState } from '../pattern/approval-history-state';
import { AccountAvatar, RecipientAvatar } from '../pattern/approval-identity';
import { ApprovalGuaranteeIcon } from '../pattern/approval-notices';
import { ApprovalRecipientNameBlock } from '../pattern/approval-recipient-name';
import { ApprovalLinesText, ApprovalRecipientRow, ExactAmount } from '../pattern/approval-rows';
import {
  approvalInteractiveRow,
  approvalInteractiveTrigger,
  approvalSurface,
} from '../pattern/approval-surface';

const headingIndicatorSize = 16;
const chipIconSize = 14;
const chipGlyphSize = 10;
const addressPattern = /^[A-Za-z0-9]{20,}$/;

const assetNames: Record<string, string> = {
  STX: 'Stacks',
  BTC: 'Bitcoin',
  sBTC: 'sBTC',
};

interface ActivityCounterparty {
  label: string;
  avatar?: ReactNode;
}

const ActivityCounterpartyContext = createContext<ActivityCounterparty | undefined>(undefined);

function readAddress(node: ReactNode) {
  if (typeof node === 'string') return node;
  if (isValidElement<{ address?: unknown }>(node) && typeof node.props.address === 'string') {
    return node.props.address;
  }
  return undefined;
}

function shortenCounterparty(value: string) {
  return addressPattern.test(value) ? truncateMiddle(value, 4) : value;
}

interface CounterpartyElementProps {
  address?: ReactNode;
  name?: ApprovalRecipientName;
  avatar?: ReactNode;
  children?: ReactNode;
}

function findCounterparty(children: ReactNode): ActivityCounterparty | undefined {
  for (const child of Children.toArray(children)) {
    if (!isValidElement<CounterpartyElementProps>(child)) continue;
    if (child.type === ApprovalRecipientRow) {
      const { avatar } = child.props;
      if (child.props.name) return { label: child.props.name.value, avatar };
      const address = readAddress(child.props.address);
      if (address) return { label: shortenCounterparty(address), avatar };
    }
    if (child.type === Fragment) {
      const nested = findCounterparty(child.props.children);
      if (nested) return nested;
    }
  }
  return undefined;
}

function readSymbol(amount: ReactNode) {
  if (
    isValidElement<{ symbol?: unknown }>(amount) &&
    amount.type === ExactAmount &&
    typeof amount.props.symbol === 'string'
  ) {
    return amount.props.symbol;
  }
  return undefined;
}

type OutcomeKind = 'sent' | 'received' | 'held';

function resolveOutcomeKind({ direction, label }: DirectionAssetRowProps): OutcomeKind {
  if (direction === 'in') return 'received';
  if (direction === 'out') return 'sent';
  if (/lock/i.test(label)) return 'held';
  return 'sent';
}

function resolveIndicator(kind: OutcomeKind) {
  if (kind === 'received') return 'received';
  if (kind === 'held') return 'function';
  return 'sent';
}

const outcomeSign: Record<OutcomeKind, string> = {
  sent: '− ',
  received: '+ ',
  held: '',
};

interface OutcomeLaneProps {
  children: ReactNode;
}

function OutcomeLane({ children }: OutcomeLaneProps) {
  return (
    <Flex
      width="36px"
      height="36px"
      flexShrink={0}
      alignItems="center"
      justifyContent="center"
      lineHeight={0}
    >
      <Box transform="scale(1.125)" lineHeight={0}>
        {children}
      </Box>
    </Flex>
  );
}

interface OutcomeItemProps {
  leading?: ReactNode;
  title: ReactNode;
  caption?: ReactNode;
  trailing?: ReactNode;
  trailingCaption?: ReactNode;
  trailingStyle?: 'label.01' | 'label.02';
}

function OutcomeItem({
  leading,
  title,
  caption,
  trailing,
  trailingCaption,
  trailingStyle = 'label.01',
}: OutcomeItemProps) {
  return (
    <Flex alignItems="center" gap="space.03" minHeight="36px">
      {leading && <OutcomeLane>{leading}</OutcomeLane>}
      <Stack gap="0" flex="1" minWidth={0}>
        <Flex justifyContent="space-between" alignItems="baseline" gap="space.04">
          <styled.span textStyle="label.01" minWidth={0}>
            {title}
          </styled.span>
          {trailing && (
            <styled.span textStyle={trailingStyle} whiteSpace="nowrap" flexShrink={0}>
              {trailing}
            </styled.span>
          )}
        </Flex>
        {(caption || trailingCaption) && (
          <Flex
            justifyContent="space-between"
            alignItems="baseline"
            gap="space.04"
            textStyle="caption.01"
            color="ink.text-subdued"
          >
            <Box minWidth={0}>{caption}</Box>
            {trailingCaption && (
              <styled.span whiteSpace="nowrap" flexShrink={0}>
                {trailingCaption}
              </styled.span>
            )}
          </Flex>
        )}
      </Stack>
    </Flex>
  );
}

interface CounterpartyReferenceProps {
  children: ReactNode;
}

function CounterpartyReference({ children }: CounterpartyReferenceProps) {
  return (
    <styled.span
      textDecoration="underline"
      textDecorationColor="ink.border-default"
      textDecorationThickness="1px"
      textUnderlineOffset="3px"
      whiteSpace="nowrap"
    >
      {children}
    </styled.span>
  );
}

function shrinkAvatar(avatar: ReactNode) {
  if (isValidElement<{ size?: unknown }>(avatar) && avatar.props.size) {
    return cloneElement(avatar, { size: 'xs' });
  }
  return undefined;
}

function RecipientGlyph() {
  return (
    <Flex
      alignItems="center"
      justifyContent="center"
      borderRadius="round"
      bg="ink.text-primary"
      flexShrink={0}
      lineHeight={0}
      style={{ width: chipIconSize, height: chipIconSize }}
      aria-hidden
    >
      <UserIcon
        variant="small"
        color="ink.background-primary"
        width={chipGlyphSize}
        height={chipGlyphSize}
      />
    </Flex>
  );
}

interface CounterpartyChipProps {
  counterparty: ActivityCounterparty;
}

function CounterpartyChip({ counterparty }: CounterpartyChipProps) {
  return (
    <styled.span
      display="inline-flex"
      alignItems="center"
      gap="space.01"
      verticalAlign="bottom"
      maxWidth="100%"
      pl="2px"
      pr="space.02"
      py="1px"
      borderRadius="round"
      bg="ink.component-background-default"
      color="ink.text-primary"
    >
      {shrinkAvatar(counterparty.avatar) ?? <RecipientGlyph />}
      <styled.span truncate>{counterparty.label}</styled.span>
    </styled.span>
  );
}

interface OutcomeCaptionProps {
  qualifier?: string;
  counterparty?: ActivityCounterparty;
}

function OutcomeCaption({ qualifier, counterparty }: OutcomeCaptionProps) {
  if (!qualifier && !counterparty) return null;
  return (
    <>
      {qualifier}
      {qualifier && counterparty && ' · '}
      {counterparty && (
        <>
          {qualifier ? 'to' : 'To'} <CounterpartyChip counterparty={counterparty} />
        </>
      )}
    </>
  );
}

const outcomeAmountStyles = {
  received: css({ color: 'green.action-primary-default' }),
  default: css({ color: 'ink.text-primary' }),
  settling: css({ color: 'ink.text-subdued' }),
};

function outcomeAmountClass(kind: OutcomeKind, historyState?: ApprovalHistoryState) {
  if (historyState === 'pending' || historyState === 'failed') return outcomeAmountStyles.settling;
  if (kind === 'received') return outcomeAmountStyles.received;
  return outcomeAmountStyles.default;
}

export function ActivityAssetRow(props: DirectionAssetRowProps) {
  const { icon, label, qualifier, amount, fiat, estimateSource } = props;
  const counterparty = useContext(ActivityCounterpartyContext);
  const historyState = useApprovalHistoryState();
  const kind = resolveOutcomeKind(props);
  const symbol = readSymbol(amount);
  const title = symbol ? (assetNames[symbol] ?? symbol) : amount;
  return (
    <Stack gap="space.03" mt="space.05" _first={{ mt: '0' }} data-approval-zone="outcome">
      <Flex gap="space.02" alignItems="center">
        <Box
          lineHeight={0}
          borderRadius="round"
          boxShadow="0 0 0 1px token(colors.ink.border-default)"
          flexShrink={0}
        >
          <BlockchainActivityIndicatorIcon
            indicator={resolveIndicator(kind)}
            size={headingIndicatorSize}
          />
        </Box>
        <styled.span textStyle="label.02">{label}</styled.span>
      </Flex>
      <OutcomeItem
        leading={icon}
        title={title}
        caption={
          <>
            <OutcomeCaption
              qualifier={qualifier}
              counterparty={kind === 'sent' ? counterparty : undefined}
            />
            {estimateSource && <ApprovalEstimateSource source={estimateSource} />}
          </>
        }
        trailing={
          symbol && (
            <styled.span className={outcomeAmountClass(kind, historyState)}>
              {estimateSource ? (
                <ApproxAmount>{amount}</ApproxAmount>
              ) : (
                <>
                  {outcomeSign[kind]}
                  {amount}
                </>
              )}
            </styled.span>
          )
        }
        trailingCaption={fiat}
      />
    </Stack>
  );
}

export function ActivityRecipientRow({
  address,
  label,
  name,
  caption,
  avatar,
}: DirectionRecipientRowProps) {
  const fullAddress = readAddress(address);
  if (fullAddress && !addressPattern.test(fullAddress)) {
    return (
      <Box mt="space.03" data-approval-zone="recipient">
        <OutcomeItem
          leading={avatar}
          title={address}
          caption={caption && <ApprovalLinesText lines={caption} />}
        />
      </Box>
    );
  }
  return (
    <Stack gap="space.03" mt="space.05" data-approval-zone="recipient">
      <styled.span textStyle="label.02">{label}</styled.span>
      <Flex gap="space.03" alignItems="flex-start">
        <OutcomeLane>{avatar ?? <RecipientAvatar size="md" />}</OutcomeLane>
        <Stack gap="space.01" flex="1" minWidth={0} pt="space.01">
          {name && <ApprovalRecipientNameBlock name={name} />}
          <Box textStyle="label.02" minWidth={0}>
            {address}
          </Box>
          {caption && (
            <styled.span textStyle="caption.01" color="ink.text-subdued">
              <ApprovalLinesText lines={caption} />
            </styled.span>
          )}
        </Stack>
      </Flex>
    </Stack>
  );
}

function resolveFeeLabel(label: string) {
  return label === 'Network fee' ? 'Fee' : label;
}

export function ActivityFeeRow({ label, amount, fiat, caption, action }: DirectionFeeRowProps) {
  return (
    <Flex
      justifyContent="space-between"
      alignItems="flex-start"
      gap="space.04"
      mt="space.05"
      _first={{ mt: '0' }}
      py="space.01"
      minHeight="30px"
      className={action ? approvalInteractiveRow : undefined}
      data-approval-zone="fee"
    >
      <styled.span textStyle="label.03" color="ink.text-subdued" flexShrink={0} pt="2px">
        {resolveFeeLabel(label)}
      </styled.span>
      <Stack gap="0" alignItems="flex-end" textAlign="right" minWidth={0}>
        <Flex alignItems="center" gap="space.02">
          <styled.span textStyle="caption.01" color="ink.text-primary" whiteSpace="nowrap">
            {amount}
            {fiat && <styled.span color="ink.text-subdued"> · {fiat}</styled.span>}
          </styled.span>
          {action}
        </Flex>
        {caption && (
          <styled.span textStyle="caption.01" color="ink.text-subdued">
            <ApprovalLinesText lines={caption} />
          </styled.span>
        )}
      </Stack>
    </Flex>
  );
}

export function ActivityGuarantee({ kind, label, isWeak, children }: DirectionGuaranteeProps) {
  if (isWeak) {
    return (
      <Flex
        gap="space.02"
        alignItems="flex-start"
        mt="space.03"
        px="space.03"
        py="space.02"
        className={approvalSurface.notice}
        data-approval-zone="guarantee"
      >
        <Box pt="2px" flexShrink={0} lineHeight={0}>
          <UnlockIcon variant="small" color="yellow.action-primary-default" />
        </Box>
        <styled.p textStyle="caption.01" color="ink.text-primary">
          <styled.span textStyle="label.03">{label}.</styled.span> {children}
        </styled.p>
      </Flex>
    );
  }
  return (
    <Flex gap="space.02" alignItems="flex-start" mt="space.02" data-approval-zone="guarantee">
      <Box pt="2px" flexShrink={0} lineHeight={0}>
        <ApprovalGuaranteeIcon kind={kind} isWeak={false} />
      </Box>
      <styled.p textStyle="caption.01" color="ink.text-subdued">
        {label}. {children}
      </styled.p>
    </Flex>
  );
}

const historyStripTint: Record<ApprovalHistoryState, string> = {
  confirmed: css({ bg: 'green.background-primary' }),
  pending: css({ bg: 'yellow.background-primary' }),
  failed: css({ bg: 'red.background-primary' }),
};

const historyStripLine: Record<ApprovalHistoryState, string> = {
  confirmed: css({ bg: 'green.action-primary-default' }),
  pending: css({
    backgroundImage:
      'repeating-linear-gradient(135deg, token(colors.orange.action-primary-default) 0 6px, token(colors.yellow.background-primary) 6px 12px)',
  }),
  failed: css({ bg: 'red.action-primary-default' }),
};

export function ActivityHistoryStatus({
  state,
  label,
  preposition,
  date,
  note,
  actions,
}: DirectionHistoryStatusProps) {
  return (
    <Stack gap="0" mt="-space.01" data-approval-zone="status" data-history-state={state}>
      <Box height="3px" className={historyStripLine[state]} />
      <Stack gap="space.02" px="space.05" py="space.03" className={historyStripTint[state]}>
        <styled.p textStyle="label.03">
          <styled.span className={historyStatusText[state]}>{label}</styled.span>
          <styled.span color="ink.text-primary">{` ${preposition} ${date}`}</styled.span>
        </styled.p>
        {note && (
          <styled.p textStyle="caption.01" color="ink.text-subdued">
            {note}
          </styled.p>
        )}
        {actions}
      </Stack>
    </Stack>
  );
}

function balanceCaption(fiat?: string) {
  return fiat ? `Balance · ${fiat}` : 'Balance';
}

export function ActivityAccountBlock({ account }: DirectionAccountBlockProps) {
  const signingVerb = useApprovalHistoryState() ? 'signed' : 'signing';
  const reference = account.vault
    ? `${signingVerb} as ${account.name}`
    : truncateMiddle(account.address, 4);
  return (
    <styled.section px="space.05" py="space.04" data-approval-zone="account">
      <styled.h2 textStyle="label.02" pb="space.03">
        With account
      </styled.h2>
      <OutcomeItem
        leading={<AccountAvatar account={account} size="md" />}
        title={account.vault ? account.vault.name : account.name}
        caption={
          <>
            {account.vault ? reference : <CounterpartyReference>{reference}</CounterpartyReference>}
            {account.signer === 'ledger' && ' · Ledger'}
          </>
        }
        trailing={
          account.balance && (
            <ExactAmount value={account.balance.amount} symbol={account.balance.symbol} />
          )
        }
        trailingCaption={account.balance && balanceCaption(account.balance.fiat)}
        trailingStyle="label.02"
      />
    </styled.section>
  );
}

interface SectionHeadingProps {
  label: string;
  trailing?: ReactNode;
}

function SectionHeading({ label, trailing }: SectionHeadingProps) {
  return (
    <Flex alignItems="center" justifyContent="space-between" gap="space.02" pb="space.03">
      <styled.h2 textStyle="label.02">{label}</styled.h2>
      {trailing}
    </Flex>
  );
}

interface CollapsibleHeadingProps {
  label: string;
  summary?: ReactNode;
  isOpen: boolean;
  onToggle(): void;
}

function CollapsibleHeading({ label, summary, isOpen, onToggle }: CollapsibleHeadingProps) {
  return (
    <styled.button
      type="button"
      display="flex"
      width="100%"
      alignItems="center"
      justifyContent="space-between"
      gap="space.03"
      minHeight="30px"
      pb={isOpen ? 'space.02' : '0'}
      cursor="pointer"
      textAlign="left"
      aria-expanded={isOpen}
      onClick={onToggle}
      className={approvalInteractiveTrigger}
    >
      <styled.h2 textStyle="label.02" flexShrink={0}>
        {label}
      </styled.h2>
      <Flex alignItems="center" gap="space.02" minWidth={0}>
        {!isOpen && summary && (
          <styled.span textStyle="caption.01" color="ink.text-subdued" truncate>
            {summary}
          </styled.span>
        )}
        {isOpen ? (
          <ChevronUpIcon variant="small" color="ink.text-subdued" />
        ) : (
          <ChevronDownIcon variant="small" color="ink.text-subdued" />
        )}
      </Flex>
    </styled.button>
  );
}

function resolveHeading({
  label,
  trailing,
  collapsible,
  summary,
  isOpen,
  onToggle,
}: DirectionSectionProps) {
  if (!label || isWhatMovesLabel(label)) return null;
  if (collapsible) {
    return (
      <CollapsibleHeading label={label} summary={summary} isOpen={isOpen} onToggle={onToggle} />
    );
  }
  return <SectionHeading label={label} trailing={trailing} />;
}

export function ActivitySection(props: DirectionSectionProps) {
  const { label, isOpen, children } = props;
  return (
    <ActivityCounterpartyContext.Provider value={findCounterparty(children)}>
      <styled.section data-approval-section={label} px="space.05" py="space.04">
        {resolveHeading(props)}
        {isOpen && <Stack gap="0">{children}</Stack>}
      </styled.section>
    </ActivityCounterpartyContext.Provider>
  );
}
