import type { ReactNode } from 'react';

import { css } from 'leather-styles/css';
import { Box, Flex, Stack, styled } from 'leather-styles/jsx';

import { ArrowDownIcon, Badge, ChevronRightIcon, CopyIcon, ExternalLinkIcon } from '@leather.io/ui';

import { HandshakeActionCue } from '../directions/handshake-primitives';
import {
  type ApprovalAssetDirection,
  type ApprovalFeeSpeed,
  type ApprovalLines,
  type ApprovalRecipientName,
  type DirectionAssetRowProps,
  type DirectionDisclosureRowProps,
  type DirectionFeeRowProps,
  type DirectionRecipientRowProps,
  type DirectionRowProps,
  useApprovalDirection,
} from './approval-direction';
import { ApprovalEstimateSource, ApproxAmount } from './approval-estimate';
import { ApprovalFeeIcon } from './approval-fee-speed';
import { splitContractId, splitTrailingZeros, truncateMiddle } from './approval-format';
import { RecipientAvatar } from './approval-identity';
import type { ApprovalIdentityContext } from './approval-identity-context';
import { ApprovalRecipientNameBlock } from './approval-recipient-name';
import { approvalDimmedDigits, approvalInteractiveRow } from './approval-surface';

interface ExactAmountProps {
  value: string;
  symbol: string;
}

export function ExactAmount({ value, symbol }: ExactAmountProps) {
  const { significant, trailing } = splitTrailingZeros(value);
  return (
    <styled.span whiteSpace="nowrap">
      {significant}
      {trailing && <styled.span className={approvalDimmedDigits}>{trailing}</styled.span>} {symbol}
    </styled.span>
  );
}

interface ApprovalIdentifierProps {
  children: ReactNode;
  principal?: boolean;
}

export function ApprovalIdentifier({ children, principal }: ApprovalIdentifierProps) {
  if (principal && typeof children === 'string') {
    const { address, name } = splitContractId(children);
    return (
      <styled.code
        textStyle="code"
        fontSize="12px"
        color="ink.text-primary"
        overflowWrap="anywhere"
      >
        {address}
        {name && (
          <>
            <wbr />
            <styled.span whiteSpace="nowrap">.{name}</styled.span>
          </>
        )}
      </styled.code>
    );
  }
  return (
    <styled.code textStyle="code" fontSize="12px" color="ink.text-primary" wordBreak="break-all">
      {children}
    </styled.code>
  );
}

function isLineList(lines: ApprovalLines): lines is ReactNode[] {
  return Array.isArray(lines);
}

interface ApprovalLinesTextProps {
  lines: ApprovalLines;
}

export function ApprovalLinesText({ lines }: ApprovalLinesTextProps) {
  if (!isLineList(lines)) return lines;
  return lines.map((line, index) => (
    <styled.span key={index} display="block">
      {line}
    </styled.span>
  ));
}

function BaselineRow({ label, value, caption, action, stacked }: DirectionRowProps) {
  const captionText = caption && (
    <styled.span textStyle="caption.01" color="ink.text-subdued">
      <ApprovalLinesText lines={caption} />
    </styled.span>
  );
  if (stacked) {
    return (
      <Stack gap="space.01" py="space.02" minHeight="36px">
        <Flex justifyContent="space-between" gap="space.02">
          <styled.span textStyle="caption.01" color="ink.text-subdued">
            {label}
          </styled.span>
          {action}
        </Flex>
        <Box textStyle="label.02">{value}</Box>
        {captionText}
      </Stack>
    );
  }
  return (
    <Flex
      justifyContent="space-between"
      alignItems="flex-start"
      gap="space.04"
      py="space.02"
      minHeight="36px"
    >
      <styled.span textStyle="caption.01" color="ink.text-subdued" pt="1px" flexShrink={0}>
        {label}
      </styled.span>
      <Stack gap="0" alignItems="flex-end" textAlign="right" minWidth={0}>
        <Flex alignItems="center" gap="space.02">
          <Box textStyle="label.02" minWidth={0}>
            {value}
          </Box>
          {action}
        </Flex>
        {captionText}
      </Stack>
    </Flex>
  );
}

export function ApprovalRow(props: DirectionRowProps) {
  const Row = useApprovalDirection()?.Row ?? BaselineRow;
  return <Row {...props} />;
}

interface ApprovalContractRowProps {
  label: string;
  contractId: string;
  caption?: string;
}

export function ApprovalContractRow({ label, contractId, caption }: ApprovalContractRowProps) {
  const { address, name } = splitContractId(contractId);
  const deployer = truncateMiddle(address, 4);
  return (
    <ApprovalRow
      label={label}
      value={<ApprovalIdentifier>{name}</ApprovalIdentifier>}
      caption={caption ? `${deployer} · ${caption}` : deployer}
    />
  );
}

interface ApprovalRowActionProps {
  label: string;
}

export function ApprovalRowAction({ label }: ApprovalRowActionProps) {
  const direction = useApprovalDirection();
  if (direction?.id === 'handshake') return <HandshakeActionCue label={label} />;
  return (
    <styled.span
      textStyle="label.03"
      color="ink.text-primary"
      textDecoration="underline"
      textUnderlineOffset="3px"
      textDecorationColor="ink.border-default"
      cursor="pointer"
      whiteSpace="nowrap"
    >
      {label}
    </styled.span>
  );
}

interface ApprovalCopyActionProps {
  caption?: string;
}

export function ApprovalCopyAction({ caption }: ApprovalCopyActionProps) {
  return (
    <Flex alignItems="center" gap="space.03">
      {caption && (
        <styled.span textStyle="caption.01" color="ink.text-subdued">
          {caption}
        </styled.span>
      )}
      <styled.span
        display="inline-flex"
        alignItems="center"
        gap="space.01"
        textStyle="label.03"
        color="ink.text-primary"
        cursor="pointer"
      >
        <CopyIcon variant="small" />
        Copy
      </styled.span>
    </Flex>
  );
}

interface ApprovalUpdatedNoteProps {
  note: ReactNode;
}

function ApprovalUpdatedNote({ note }: ApprovalUpdatedNoteProps) {
  return (
    <Flex
      alignItems="center"
      gap="space.02"
      flexWrap="wrap"
      mt="-space.01"
      pb="space.02"
      style={{ paddingLeft: 'var(--approval-updated-inset, 44px)' }}
      data-approval-zone="updated"
    >
      <Badge label="Updated" variant="info" textColor="primary" flexShrink={0} />
      <styled.span textStyle="caption.01" color="ink.text-subdued">
        {note}
      </styled.span>
    </Flex>
  );
}

interface ApprovalAssetRowProps {
  icon: ReactNode;
  label: string;
  qualifier?: string;
  amount: ReactNode;
  fiat?: string;
  direction?: ApprovalAssetDirection;
  estimateSource?: string;
  updated?: ReactNode;
}

function BaselineAssetRow({
  icon,
  label,
  qualifier,
  amount,
  fiat,
  direction,
  estimateSource,
}: DirectionAssetRowProps) {
  const row = (
    <Flex alignItems="center" gap="space.03" py="space.02" minHeight="48px">
      <Box flexShrink={0}>{icon}</Box>
      <Stack gap="0" flex="1" minWidth={0}>
        <styled.span textStyle="label.02">{label}</styled.span>
        {qualifier && (
          <styled.span textStyle="caption.01" color="ink.text-subdued">
            {qualifier}
          </styled.span>
        )}
      </Stack>
      <Stack gap="0" alignItems="flex-end" textAlign="right" flexShrink={0} maxWidth="60%">
        <styled.span
          textStyle="label.02"
          color={direction === 'in' ? 'green.action-primary-default' : 'ink.text-primary'}
        >
          {estimateSource ? <ApproxAmount>{amount}</ApproxAmount> : amount}
        </styled.span>
        {fiat && (
          <styled.span textStyle="caption.01" color="ink.text-subdued">
            {fiat}
          </styled.span>
        )}
      </Stack>
    </Flex>
  );
  if (!estimateSource) return row;
  return (
    <Stack gap="0">
      {row}
      <Box pl="44px" mt="-space.02" pb="space.02">
        <ApprovalEstimateSource source={estimateSource} />
      </Box>
    </Stack>
  );
}

export function ApprovalAssetRow({
  direction = 'neutral',
  updated,
  ...props
}: ApprovalAssetRowProps) {
  const override = useApprovalDirection()?.AssetRow;
  const Row = override ?? BaselineAssetRow;
  if (!updated) return <Row direction={direction} {...props} />;
  return (
    <Stack gap="0">
      <Row direction={direction} {...props} />
      <ApprovalUpdatedNote note={updated} />
    </Stack>
  );
}

const interactiveFeeIcon = css({
  '[data-approval-containers=interactive] &': { bg: 'ink.background-primary' },
});

interface ApprovalFeeRowProps {
  amount: ReactNode;
  icon?: ReactNode;
  speed?: ApprovalFeeSpeed;
  label?: string;
  fiat?: string;
  caption?: ApprovalLines;
  action?: ReactNode;
  updated?: ReactNode;
}

function BaselineFeeRow({
  label,
  amount,
  fiat,
  caption,
  action,
  icon,
  speed,
}: DirectionFeeRowProps) {
  return (
    <Flex
      alignItems="flex-start"
      gap="space.03"
      py="space.02"
      className={action ? approvalInteractiveRow : undefined}
      data-approval-zone="fee"
    >
      <Flex
        width="32px"
        height="32px"
        flexShrink={0}
        alignItems="center"
        justifyContent="center"
        borderRadius="round"
        bg="ink.component-background-default"
        className={action ? interactiveFeeIcon : undefined}
      >
        <ApprovalFeeIcon icon={icon} speed={speed} />
      </Flex>
      <Stack gap="0" flex="1" minWidth={0}>
        <Flex justifyContent="space-between" alignItems="center" gap="space.03">
          <styled.span textStyle="label.02" flexShrink={0}>
            {label}
          </styled.span>
          <Flex alignItems="center" gap="space.02" minWidth={0}>
            <styled.span textStyle="label.02" whiteSpace="nowrap">
              {amount}
            </styled.span>
            {action}
          </Flex>
        </Flex>
        {(caption || fiat) && (
          <Flex justifyContent="space-between" alignItems="flex-start" gap="space.03">
            <styled.span textStyle="caption.01" color="ink.text-subdued" minWidth={0}>
              {caption && <ApprovalLinesText lines={caption} />}
            </styled.span>
            {fiat && (
              <styled.span textStyle="caption.01" color="ink.text-subdued" flexShrink={0}>
                {fiat}
              </styled.span>
            )}
          </Flex>
        )}
      </Stack>
    </Flex>
  );
}

export function ApprovalFeeRow({ label = 'Network fee', updated, ...props }: ApprovalFeeRowProps) {
  const override = useApprovalDirection()?.FeeRow;
  const Row = override ?? BaselineFeeRow;
  if (!updated) return <Row label={label} {...props} />;
  return (
    <Stack gap="0">
      <Row label={label} {...props} />
      <ApprovalUpdatedNote note={updated} />
    </Stack>
  );
}

interface ApprovalRecipientRowProps {
  context?: ApprovalIdentityContext;
  address: ReactNode;
  label?: string;
  name?: ApprovalRecipientName;
  caption?: ApprovalLines;
  avatar?: ReactNode;
}

function BaselineRecipientRow({
  address,
  label,
  name,
  caption,
  avatar,
}: DirectionRecipientRowProps) {
  return (
    <Stack gap="0" data-approval-zone="recipient">
      <Flex width="32px" justifyContent="center" aria-hidden>
        <ArrowDownIcon variant="small" color="ink.text-subdued" />
      </Flex>
      <Flex gap="space.03" alignItems="flex-start" py="space.02">
        {avatar ?? <RecipientAvatar />}
        <Stack gap="space.01" flex="1" minWidth={0}>
          <styled.span textStyle="label.02">{label}</styled.span>
          {name && <ApprovalRecipientNameBlock name={name} />}
          <Box textStyle="label.02">{address}</Box>
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

export function ApprovalRecipientRow({ label = 'To', ...props }: ApprovalRecipientRowProps) {
  const override = useApprovalDirection()?.RecipientRow;
  const Row = override ?? BaselineRecipientRow;
  return <Row label={label} {...props} />;
}

function BaselineDisclosureRow({ label, caption, isExternal }: DirectionDisclosureRowProps) {
  return (
    <Flex
      alignItems="center"
      justifyContent="space-between"
      gap="space.02"
      py="space.02"
      minHeight="36px"
      cursor="pointer"
      className={approvalInteractiveRow}
    >
      <Stack gap="0">
        <styled.span textStyle="label.02">{label}</styled.span>
        {caption && (
          <styled.span textStyle="caption.01" color="ink.text-subdued">
            {caption}
          </styled.span>
        )}
      </Stack>
      {isExternal ? (
        <ExternalLinkIcon variant="small" color="ink.text-subdued" />
      ) : (
        <ChevronRightIcon variant="small" color="ink.text-subdued" />
      )}
    </Flex>
  );
}

export function ApprovalDisclosureRow(props: DirectionDisclosureRowProps) {
  const Row = useApprovalDirection()?.DisclosureRow ?? BaselineDisclosureRow;
  return <Row {...props} />;
}
