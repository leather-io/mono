import { type ReactNode, isValidElement, useState } from 'react';

import { cx } from 'leather-styles/css';
import { Box, Flex, Stack, styled } from 'leather-styles/jsx';

import { Badge, CheckmarkIcon, CopyIcon } from '@leather.io/ui';

import type {
  ApprovalAssetDirection,
  DirectionAccountBlockProps,
  DirectionAssetRowProps,
  DirectionFeeRowProps,
  DirectionRecipientRowProps,
} from '../pattern/approval-direction';
import { ApprovalEstimateSource, ApproxAmount } from '../pattern/approval-estimate';
import { ApprovalFeeIcon } from '../pattern/approval-fee-speed';
import { truncateMiddle } from '../pattern/approval-format';
import { useApprovalHistoryState } from '../pattern/approval-history-state';
import { AccountAvatar } from '../pattern/approval-identity';
import {
  ApprovalRecipientNameNotes,
  ApprovalRecipientNameValue,
} from '../pattern/approval-recipient-name';
import { ApprovalLinesText, ExactAmount } from '../pattern/approval-rows';
import { approvalDivider, approvalInteractiveRow } from '../pattern/approval-surface';

const exactPrefix = 'Exactly';
const minimumPrefix = 'At least';
const copiedResetMs = 1500;
const addressGroupPattern = /.{1,4}/g;

interface QualifierParts {
  tag?: string;
  note?: string;
}

function capitalize(text: string) {
  return text.charAt(0).toUpperCase() + text.slice(1);
}

function restAfter(qualifier: string, prefix: string) {
  const rest = qualifier.slice(prefix.length).replace(/^[,\s]+/, '');
  if (!rest || rest === 'this item') return undefined;
  return capitalize(rest);
}

function splitQualifier(qualifier?: string): QualifierParts {
  if (!qualifier) return {};
  if (qualifier.startsWith(exactPrefix))
    return { tag: 'Exact', note: restAfter(qualifier, exactPrefix) };
  if (qualifier.startsWith(minimumPrefix))
    return { tag: 'Minimum', note: restAfter(qualifier, minimumPrefix) };
  return { note: qualifier };
}

const outgoingLabelPattern = /^(You send|You pay|Leaves)/;

function resolveDirection(direction: ApprovalAssetDirection, label: string) {
  if (direction !== 'neutral') return direction;
  if (outgoingLabelPattern.test(label)) return 'out';
  return direction;
}

const digitPattern = /\d/;

interface QuantityElementProps {
  value?: unknown;
}

function isQuantity(amount: ReactNode) {
  if (typeof amount === 'string') return digitPattern.test(amount);
  return isValidElement<QuantityElementProps>(amount) && typeof amount.props.value === 'string';
}

const directionSign: Record<ApprovalAssetDirection, string> = {
  out: '−',
  in: '+',
  neutral: '',
};

interface CaptionLineProps {
  children: ReactNode;
}

function CaptionLine({ children }: CaptionLineProps) {
  return (
    <styled.span textStyle="caption.01" color="ink.text-subdued" minWidth={0}>
      {children}
    </styled.span>
  );
}

export function BalanceAssetRow({
  icon,
  label,
  qualifier,
  amount,
  fiat,
  direction,
  estimateSource,
}: DirectionAssetRowProps) {
  const { tag, note } = splitQualifier(qualifier);
  const resolvedDirection = resolveDirection(direction, label);
  const sign = isQuantity(amount) ? directionSign[resolvedDirection] : '';
  const signedAmount = (
    <>
      {sign && <styled.span pr="2px">{sign}</styled.span>}
      {amount}
    </>
  );
  return (
    <Flex alignItems="flex-start" gap="space.03" py="space.02" data-approval-zone="asset">
      <Box flexShrink={0} pt="2px">
        {icon}
      </Box>
      <Stack gap="0" flex="1" minWidth={0}>
        <styled.span
          textStyle="label.01"
          color={resolvedDirection === 'in' ? 'green.action-primary-default' : 'ink.text-primary'}
          overflowWrap="anywhere"
        >
          {estimateSource ? <ApproxAmount>{signedAmount}</ApproxAmount> : signedAmount}
        </styled.span>
        <Flex alignItems="center" justifyContent="space-between" gap="space.02" flexWrap="wrap">
          <Flex alignItems="center" gap="space.02" minWidth={0}>
            <CaptionLine>{label}</CaptionLine>
            {tag && <Badge label={tag} flexShrink={0} />}
          </Flex>
          {fiat && <CaptionLine>{fiat}</CaptionLine>}
        </Flex>
        {note && <CaptionLine>{note}</CaptionLine>}
        {estimateSource && <ApprovalEstimateSource source={estimateSource} />}
      </Stack>
    </Flex>
  );
}

interface AddressElementProps {
  address?: unknown;
}

function readAddress(node: ReactNode) {
  if (isValidElement<AddressElementProps>(node) && typeof node.props.address === 'string')
    return node.props.address;
  return undefined;
}

interface CopyAddressButtonProps {
  address: string;
}

function CopyAddressButton({ address }: CopyAddressButtonProps) {
  const [isCopied, setCopied] = useState(false);
  function copy() {
    void navigator.clipboard?.writeText(address);
    setCopied(true);
    window.setTimeout(() => setCopied(false), copiedResetMs);
  }
  return (
    <styled.button
      type="button"
      display="inline-flex"
      alignItems="center"
      justifyContent="center"
      width="24px"
      height="24px"
      flexShrink={0}
      borderRadius="sm"
      cursor="pointer"
      color="ink.text-subdued"
      _hover={{ bg: 'ink.component-background-hover', color: 'ink.text-primary' }}
      aria-label={isCopied ? 'Address copied' : 'Copy address'}
      onClick={copy}
    >
      {isCopied ? (
        <CheckmarkIcon variant="small" color="green.action-primary-default" />
      ) : (
        <CopyIcon variant="small" />
      )}
    </styled.button>
  );
}

interface FullAddressProps {
  address: string;
}

function FullAddress({ address }: FullAddressProps) {
  const groups = address.match(addressGroupPattern) ?? [address];
  return (
    <Flex columnGap="1ch" flexWrap="wrap" aria-label={address}>
      {groups.map((group, index) => (
        <styled.code
          key={index}
          textStyle="code"
          fontSize="12px"
          lineHeight="18px"
          color={index % 2 === 0 ? 'ink.text-primary' : 'ink.text-subdued'}
        >
          {group}
        </styled.code>
      ))}
    </Flex>
  );
}

export function BalanceRecipientRow({
  address,
  label,
  name,
  caption,
  avatar,
}: DirectionRecipientRowProps) {
  const fullAddress = readAddress(address);
  return (
    <Flex alignItems="flex-start" gap="space.03" pb="space.02" data-approval-zone="recipient">
      <Flex width="32px" flexShrink={0} justifyContent="center">
        {avatar}
      </Flex>
      <Stack gap="space.01" flex="1" minWidth={0}>
        <Flex alignItems="center" gap="space.02" minHeight="24px" minWidth={0}>
          <CaptionLine>{label}</CaptionLine>
          {name ? (
            <ApprovalRecipientNameValue name={name} />
          ) : (
            <styled.span textStyle="label.02" truncate>
              {fullAddress ? truncateMiddle(fullAddress, 4) : address}
            </styled.span>
          )}
          {fullAddress && <CopyAddressButton address={fullAddress} />}
        </Flex>
        {name && <ApprovalRecipientNameNotes name={name} />}
        {fullAddress && <FullAddress address={fullAddress} />}
        {caption && (
          <CaptionLine>
            <ApprovalLinesText lines={caption} />
          </CaptionLine>
        )}
      </Stack>
    </Flex>
  );
}

export function BalanceFeeRow({
  label,
  icon,
  speed,
  amount,
  fiat,
  caption,
  action,
}: DirectionFeeRowProps) {
  return (
    <Flex
      alignItems="flex-start"
      gap="space.03"
      mt="space.01"
      pt="space.03"
      pb="space.02"
      className={cx(approvalDivider, action ? approvalInteractiveRow : undefined)}
      data-approval-zone="fee"
    >
      <Flex width="32px" flexShrink={0} justifyContent="center" pt="2px">
        <ApprovalFeeIcon icon={icon} speed={speed} />
      </Flex>
      <Stack gap="0" flex="1" minWidth={0}>
        <Flex alignItems="center" gap="space.02">
          <styled.span textStyle="label.02" minWidth={0}>
            {amount}
          </styled.span>
          {action}
        </Flex>
        <Flex alignItems="center" justifyContent="space-between" gap="space.02" flexWrap="wrap">
          <CaptionLine>{label}</CaptionLine>
          {fiat && <CaptionLine>{fiat}</CaptionLine>}
        </Flex>
        {caption && (
          <CaptionLine>
            <ApprovalLinesText lines={caption} />
          </CaptionLine>
        )}
      </Stack>
    </Flex>
  );
}

export function BalanceAccountBlock({ account }: DirectionAccountBlockProps) {
  const signingVerb = useApprovalHistoryState() ? 'signed' : 'signing';
  const identity = account.vault
    ? `${signingVerb} as ${account.name}`
    : truncateMiddle(account.address, 4);
  const caption = account.signer === 'ledger' ? `${identity} · Ledger` : identity;
  return (
    <styled.section px="space.05" py="space.03" data-approval-zone="account">
      <styled.h2 textStyle="label.03" color="ink.text-subdued" pb="space.02">
        Account
      </styled.h2>
      <Flex alignItems="flex-start" gap="space.03" px="space.04" py="space.02">
        <AccountAvatar account={account} size="md" />
        <Stack gap="0" flex="1" minWidth={0}>
          <styled.span textStyle="label.02" truncate>
            {account.vault ? account.vault.name : account.name}
          </styled.span>
          <styled.span textStyle="caption.01" color="ink.text-subdued" truncate>
            {caption}
          </styled.span>
          {account.balance && (
            <Flex
              alignItems="flex-start"
              justifyContent="space-between"
              gap="space.03"
              mt="space.02"
            >
              <CaptionLine>Balance now</CaptionLine>
              <Stack gap="0" alignItems="flex-end" textAlign="right" minWidth={0}>
                <styled.span textStyle="label.02">
                  <ExactAmount value={account.balance.amount} symbol={account.balance.symbol} />
                </styled.span>
                {account.balance.fiat && <CaptionLine>{account.balance.fiat}</CaptionLine>}
              </Stack>
            </Flex>
          )}
        </Stack>
      </Flex>
    </styled.section>
  );
}
