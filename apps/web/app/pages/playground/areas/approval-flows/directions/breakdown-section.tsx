import { Children, Fragment, type ReactNode, isValidElement } from 'react';

import { Box, Flex, Stack, styled } from 'leather-styles/jsx';

import { ChevronDownIcon, ChevronUpIcon } from '@leather.io/ui';

import {
  type ApprovalAssetDirection,
  type ApprovalFeeSpeed,
  type ApprovalGuaranteeKind,
  type ApprovalLines,
  type ApprovalRecipientName,
  type DirectionSectionProps,
  isWhatMovesLabel,
} from '../pattern/approval-direction';
import { ApprovalCaution, ApprovalGuarantee, ApprovalNote } from '../pattern/approval-notices';
import { useApprovalOptions } from '../pattern/approval-options';
import {
  ApprovalAssetRow,
  ApprovalFeeRow,
  ApprovalRecipientRow,
  ApprovalRow,
} from '../pattern/approval-rows';
import { useApprovalAccountSlot, useApprovalSigner } from '../pattern/approval-shell';
import { approvalDivider, approvalInteractiveTrigger } from '../pattern/approval-surface';
import type { ApprovalAccount } from '../pattern/approval-types';
import {
  BreakdownFromLine,
  BreakdownMetaLine,
  BreakdownRecipientStop,
  LedgerFeeMark,
  type LedgerNode,
  type LedgerOperator,
  LedgerOperatorProvider,
  LedgerRecipientMark,
  LedgerStep,
} from './breakdown-rows';

const defaultRecipientLabel = 'To';
const arrivalLabel = 'Should confirm';
const weakKinds: ApprovalGuaranteeKind[] = ['unrestricted', 'open'];
const outgoingLabelPattern = /^(You send|You sent|You pay|You paid|You lock|Leaves|Left)/;
const sendLabelPattern = /^You sen[dt]/;
const includedFeePattern = /part of|included/i;
const coveredFeePattern = /paid by|paid from|pays the/i;
const arrivalPattern = /about \d+ (min|mins|minutes|hour|hours)\b/i;
const looseTypes: unknown[] = [ApprovalNote, ApprovalCaution];

interface FragmentElementProps {
  children?: ReactNode;
}

interface AssetElementProps {
  icon?: ReactNode;
  label?: string;
  qualifier?: string;
  amount?: ReactNode;
  fiat?: string;
  direction?: ApprovalAssetDirection;
}

interface FeeElementProps {
  caption?: ApprovalLines;
  icon?: ReactNode;
  speed?: ApprovalFeeSpeed;
}

interface RecipientElementProps {
  address?: ReactNode;
  label?: string;
  name?: ApprovalRecipientName;
  caption?: ApprovalLines;
  avatar?: ReactNode;
}

interface OtherElementProps {
  recipient?: unknown;
  amount?: unknown;
  label?: unknown;
  value?: unknown;
  caption?: unknown;
}

interface GuaranteeElementProps {
  kind?: unknown;
}

function flatten(children: ReactNode): ReactNode[] {
  return Children.toArray(children).flatMap(child => {
    if (isValidElement<FragmentElementProps>(child) && child.type === Fragment) {
      return flatten(child.props.children);
    }
    return [child];
  });
}

function assetProps(child: ReactNode) {
  if (isValidElement<AssetElementProps>(child) && child.type === ApprovalAssetRow) {
    return child.props;
  }
  return undefined;
}

function feeProps(child: ReactNode) {
  if (isValidElement<FeeElementProps>(child) && child.type === ApprovalFeeRow) return child.props;
  return undefined;
}

function isRecipient(child: ReactNode) {
  return isValidElement(child) && child.type === ApprovalRecipientRow;
}

function recipientProps(child: ReactNode) {
  if (isValidElement<RecipientElementProps>(child) && child.type === ApprovalRecipientRow) {
    return child.props;
  }
  return undefined;
}

function otherNode(child: ReactNode): LedgerNode {
  if (!isValidElement<OtherElementProps>(child)) return 'step';
  const { recipient, amount, label, value, caption } = child.props;
  if (recipient !== undefined || amount !== undefined) return 'step';
  if (child.type === ApprovalRow || label !== undefined || value !== undefined) return 'none';
  return caption === undefined ? 'step' : 'none';
}

function isGuarantee(child: ReactNode) {
  return isValidElement(child) && child.type === ApprovalGuarantee;
}

function isWeakGuarantee(child: ReactNode) {
  return (
    isValidElement<GuaranteeElementProps>(child) &&
    child.type === ApprovalGuarantee &&
    weakKinds.some(kind => kind === child.props.kind)
  );
}

function isLoose(child: ReactNode) {
  return isValidElement(child) && looseTypes.includes(child.type);
}

function isOutgoing(props: AssetElementProps) {
  if (props.direction === 'out') return true;
  if (props.direction === 'in') return false;
  return outgoingLabelPattern.test(props.label ?? '');
}

function linesText(lines: ApprovalLines | undefined): string {
  if (typeof lines === 'string') return lines;
  if (Array.isArray(lines)) return lines.filter(line => typeof line === 'string').join(' · ');
  return '';
}

function feeNode(props: FeeElementProps): LedgerNode {
  const caption = linesText(props.caption);
  if (includedFeePattern.test(caption)) return 'minus';
  if (coveredFeePattern.test(caption)) return 'covered';
  return 'plus';
}

function readArrival(fees: FeeElementProps[]) {
  const match = fees
    .map(props => linesText(props.caption).match(arrivalPattern))
    .find(result => result !== null);
  return match ? `In ${match[0]}` : undefined;
}

function feeOperator(node: LedgerNode): LedgerOperator | undefined {
  if (node === 'plus' || node === 'minus') return node;
  return undefined;
}

interface LedgerEntry {
  key: string;
  node: LedgerNode;
  content: ReactNode;
  account?: ApprovalAccount;
  mark?: ReactNode;
  operator?: LedgerOperator;
}

interface LedgerParts {
  entries: LedgerEntry[];
  recipients: ReactNode[];
  strong: ReactNode[];
  weak: ReactNode[];
  loose: ReactNode[];
  arrival?: string;
}

function buildLedger(
  items: ReactNode[],
  account: ApprovalAccount | undefined,
  isWorkedSum: boolean
): LedgerParts {
  const outs = items.filter(child => {
    const props = assetProps(child);
    return props !== undefined && isOutgoing(props);
  });
  const ins = items.filter(child => {
    const props = assetProps(child);
    return props !== undefined && !isOutgoing(props);
  });
  const fees = items.filter(child => feeProps(child) !== undefined);
  const recipients = items.filter(isRecipient);
  const others = items.filter(
    child =>
      assetProps(child) === undefined &&
      feeProps(child) === undefined &&
      !isRecipient(child) &&
      !isGuarantee(child) &&
      !isLoose(child)
  );
  const sendProps = outs.length === 1 ? assetProps(outs[0]) : undefined;
  const feeNodes = fees.map((child, index): LedgerNode => {
    const props = feeProps(child);
    if (!isWorkedSum || !props) return 'step';
    if (outs.length === 0 && index === 0) return 'start';
    return feeNode(props);
  });
  const foldedRecipient =
    outs.length > 0 && recipients.length === 1 ? recipientProps(recipients[0]) : undefined;
  const isSameAmount =
    sendProps !== undefined &&
    sendLabelPattern.test(sendProps.label ?? '') &&
    ins.length === 0 &&
    !feeNodes.includes('minus');
  const extraOutNode: LedgerNode = isWorkedSum ? 'plus' : 'step';
  const fromEntries: LedgerEntry[] = account
    ? [{ key: 'from', node: 'account', account, content: <BreakdownFromLine account={account} /> }]
    : [];
  const recipientEntries: LedgerEntry[] = foldedRecipient
    ? [
        {
          key: 'recipient',
          node: 'result',
          mark: <LedgerRecipientMark avatar={foldedRecipient.avatar} />,
          content: (
            <BreakdownRecipientStop
              address={foldedRecipient.address}
              label={foldedRecipient.label ?? defaultRecipientLabel}
              name={foldedRecipient.name}
              caption={foldedRecipient.caption}
              isSameAmount={isSameAmount}
            />
          ),
        },
      ]
    : [];
  const entries: LedgerEntry[] = [
    ...fromEntries,
    ...outs.map(
      (child, index): LedgerEntry => ({
        key: `out-${index}`,
        node: index === 0 ? 'start' : extraOutNode,
        content: child,
      })
    ),
    ...others.map(
      (child, index): LedgerEntry => ({
        key: `other-${index}`,
        node: otherNode(child),
        content: child,
      })
    ),
    ...fees.map((child, index): LedgerEntry => {
      const props = feeProps(child);
      const node = feeNodes[index] ?? 'step';
      return {
        key: `fee-${index}`,
        node,
        content: child,
        mark: (
          <LedgerFeeMark icon={props?.icon} speed={props?.speed} isCovered={node === 'covered'} />
        ),
        operator: feeOperator(node),
      };
    }),
    ...recipientEntries,
    ...ins.map(
      (child, index): LedgerEntry => ({ key: `in-${index}`, node: 'result', content: child })
    ),
  ];
  return {
    entries,
    recipients: foldedRecipient ? [] : recipients,
    strong: items.filter(child => isGuarantee(child) && !isWeakGuarantee(child)),
    weak: items.filter(isWeakGuarantee),
    loose: items.filter(isLoose),
    arrival: readArrival(fees.flatMap(child => feeProps(child) ?? [])),
  };
}

interface HeadingProps {
  label?: string;
  trailing?: ReactNode;
}

function Heading({ label, trailing }: HeadingProps) {
  if (!label && !trailing) return null;
  return (
    <Flex alignItems="center" justifyContent="space-between" gap="space.02" pb="space.02">
      {label && <styled.h2 textStyle="label.02">{label}</styled.h2>}
      {trailing}
    </Flex>
  );
}

function hasLedgerRows(items: ReactNode[]) {
  return items.some(
    child => assetProps(child) !== undefined || feeProps(child) !== undefined || isRecipient(child)
  );
}

interface LedgerSectionProps extends DirectionSectionProps {
  account?: ApprovalAccount;
}

function LedgerSection({ label, trailing, divided, children, account }: LedgerSectionProps) {
  const parts = buildLedger(flatten(children), account, isWhatMovesLabel(label));
  const hasMeta = parts.arrival !== undefined || parts.strong.length > 0;
  return (
    <styled.section
      data-approval-section={label}
      px="space.05"
      py="space.03"
      className={divided ? approvalDivider : undefined}
    >
      <Heading label={label} trailing={trailing} />
      <Stack gap="0">
        {parts.entries.map((entry, index) => (
          <LedgerStep
            key={entry.key}
            node={entry.node}
            mark={entry.mark}
            account={entry.account}
            isFirst={index === 0}
            isLast={index === parts.entries.length - 1}
          >
            <LedgerOperatorProvider operator={entry.operator}>
              {entry.content}
            </LedgerOperatorProvider>
          </LedgerStep>
        ))}
      </Stack>
      {hasMeta && (
        <Stack gap="0" mt="space.02" pt="space.01" className={approvalDivider}>
          {parts.arrival && <BreakdownMetaLine label={arrivalLabel} value={parts.arrival} />}
          {parts.strong}
        </Stack>
      )}
      {parts.weak.length > 0 && (
        <Stack gap="space.02" mt="space.02">
          {parts.weak}
        </Stack>
      )}
      {parts.recipients.length > 0 && (
        <Stack gap="0" mt="space.03" pt="space.02" className={approvalDivider}>
          {parts.recipients}
        </Stack>
      )}
      {parts.loose.length > 0 && (
        <Stack gap="space.02" mt="space.03">
          {parts.loose}
        </Stack>
      )}
    </styled.section>
  );
}

function CollapsibleSection({
  label,
  summary,
  divided,
  isOpen,
  onToggle,
  children,
}: DirectionSectionProps) {
  return (
    <styled.section
      data-approval-section={label}
      px="space.05"
      py="space.03"
      className={divided ? approvalDivider : undefined}
    >
      <styled.button
        type="button"
        display="flex"
        width="100%"
        alignItems="flex-start"
        justifyContent="space-between"
        gap="space.03"
        minHeight="32px"
        cursor="pointer"
        textAlign="left"
        aria-expanded={isOpen}
        onClick={onToggle}
        className={approvalInteractiveTrigger}
      >
        <Stack gap="0" minWidth={0}>
          <styled.h2 textStyle="label.02">{label}</styled.h2>
          {!isOpen && summary && (
            <styled.span textStyle="caption.01" color="ink.text-subdued" truncate>
              {summary}
            </styled.span>
          )}
        </Stack>
        <Flex alignItems="center" gap="space.01" flexShrink={0} pt="2px">
          <styled.span
            textStyle="label.03"
            textDecoration="underline"
            textUnderlineOffset="3px"
            textDecorationColor="ink.border-default"
          >
            {isOpen ? 'Hide' : 'Show'}
          </styled.span>
          {isOpen ? <ChevronUpIcon variant="small" /> : <ChevronDownIcon variant="small" />}
        </Flex>
      </styled.button>
      {isOpen && (
        <Box pt="space.02">
          <Stack gap="0">{children}</Stack>
        </Box>
      )}
    </styled.section>
  );
}

function PlainSection({ label, trailing, divided, children }: DirectionSectionProps) {
  return (
    <styled.section
      data-approval-section={label}
      px="space.05"
      py="space.03"
      className={divided ? approvalDivider : undefined}
    >
      <Heading label={label} trailing={trailing} />
      <Stack gap="0">{children}</Stack>
    </styled.section>
  );
}

function WhatMovesSection(props: DirectionSectionProps) {
  const signer = useApprovalSigner();
  const hasAccountSlot = useApprovalAccountSlot();
  const { accountPlacement } = useApprovalOptions();
  const account = accountPlacement === 'body' && hasAccountSlot ? signer : undefined;
  return <LedgerSection {...props} account={account} />;
}

export function BreakdownSection(props: DirectionSectionProps) {
  if (isWhatMovesLabel(props.label)) return <WhatMovesSection {...props} />;
  if (props.collapsible && props.label) return <CollapsibleSection {...props} />;
  if (hasLedgerRows(flatten(props.children))) return <LedgerSection {...props} />;
  return <PlainSection {...props} />;
}
