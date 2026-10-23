import { type ReactNode, isValidElement } from 'react';

import { Box, Flex, Stack, styled } from 'leather-styles/jsx';

import { Avatar, ChevronRightIcon, UserIcon } from '@leather.io/ui';

import type {
  ApprovalAssetDirection,
  DirectionAssetRowProps,
  DirectionFeeRowProps,
  DirectionRecipientRowProps,
} from '../pattern/approval-direction';
import { ApprovalEstimateSource, ApproxAmount } from '../pattern/approval-estimate';
import { ApprovalFeeIcon } from '../pattern/approval-fee-speed';
import { truncateMiddle } from '../pattern/approval-format';
import { AccountAvatar } from '../pattern/approval-identity';
import { ApprovalRecipientNameBlock } from '../pattern/approval-recipient-name';
import { ApprovalLinesText, ExactAmount } from '../pattern/approval-rows';
import type { ApprovalAccount } from '../pattern/approval-types';

const outgoingLabelPattern = /^(You send|You pay|Leaves)/;
const digitPattern = /\d/;

const directionSign: Record<ApprovalAssetDirection, string> = {
  out: '−',
  in: '+',
  neutral: '',
};

function resolveDirection(direction: ApprovalAssetDirection, label: string) {
  if (direction !== 'neutral') return direction;
  if (outgoingLabelPattern.test(label)) return 'out';
  return direction;
}

interface QuantityElementProps {
  value?: unknown;
}

function isQuantity(amount: ReactNode) {
  if (typeof amount === 'string') return digitPattern.test(amount);
  return isValidElement<QuantityElementProps>(amount) && typeof amount.props.value === 'string';
}

interface ActionLabelProps {
  label?: unknown;
}

function readActionLabel(action: ReactNode) {
  if (isValidElement<ActionLabelProps>(action) && typeof action.props.label === 'string') {
    return action.props.label;
  }
  return undefined;
}

interface IconLaneProps {
  children: ReactNode;
}

function IconLane({ children }: IconLaneProps) {
  return (
    <Flex width="32px" flexShrink={0} justifyContent="center" lineHeight={0}>
      {children}
    </Flex>
  );
}

interface SubtleProps {
  children: ReactNode;
}

function Subtle({ children }: SubtleProps) {
  return (
    <styled.span textStyle="caption.01" color="ink.text-subdued" minWidth={0}>
      {children}
    </styled.span>
  );
}

export function PhantomAssetRow({
  icon,
  label,
  qualifier,
  amount,
  fiat,
  direction,
  estimateSource,
}: DirectionAssetRowProps) {
  const resolved = resolveDirection(direction, label);
  const sign = isQuantity(amount) ? directionSign[resolved] : '';
  const signedAmount = (
    <>
      {sign && <styled.span pr="2px">{sign}</styled.span>}
      {amount}
    </>
  );
  const row = (
    <Flex
      alignItems="center"
      gap="space.03"
      py="space.02"
      minHeight="56px"
      data-approval-zone="asset"
    >
      <IconLane>{icon}</IconLane>
      <Stack gap="0" flex="1" minWidth={0}>
        <styled.span textStyle="label.02">{label}</styled.span>
        {qualifier && <Subtle>{qualifier}</Subtle>}
      </Stack>
      <Stack gap="0" alignItems="flex-end" textAlign="right" flexShrink={0} maxWidth="66%">
        <styled.span
          textStyle="label.01"
          color={resolved === 'in' ? 'green.action-primary-default' : 'ink.text-primary'}
          whiteSpace="nowrap"
        >
          {estimateSource ? <ApproxAmount>{signedAmount}</ApproxAmount> : signedAmount}
        </styled.span>
        {fiat && <Subtle>{fiat}</Subtle>}
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

function FallbackRecipientAvatar() {
  return (
    <Avatar
      size="md"
      icon={<UserIcon variant="small" />}
      bg="ink.background-primary"
      flexShrink={0}
    />
  );
}

export function PhantomRecipientRow({
  address,
  label,
  name,
  caption,
  avatar,
}: DirectionRecipientRowProps) {
  return (
    <Flex alignItems="flex-start" gap="space.03" py="space.02" data-approval-zone="recipient">
      <IconLane>{avatar ?? <FallbackRecipientAvatar />}</IconLane>
      <Stack gap="space.01" flex="1" minWidth={0}>
        <Flex alignItems="center" minHeight="32px">
          <styled.span textStyle="label.02">{label}</styled.span>
        </Flex>
        {name && <ApprovalRecipientNameBlock name={name} />}
        <Box textStyle="label.02" minWidth={0}>
          {address}
        </Box>
        {caption && (
          <Subtle>
            <ApprovalLinesText lines={caption} />
          </Subtle>
        )}
      </Stack>
    </Flex>
  );
}

interface FeeActionProps {
  action: ReactNode;
}

function FeeAction({ action }: FeeActionProps) {
  const label = readActionLabel(action);
  if (!label) return action;
  return (
    <Flex
      alignItems="center"
      gap="1px"
      color="ink.text-subdued"
      cursor="pointer"
      flexShrink={0}
      _hover={{ color: 'ink.text-primary' }}
    >
      <styled.span textStyle="label.03">{label}</styled.span>
      <ChevronRightIcon variant="small" />
    </Flex>
  );
}

export function PhantomFeeRow({
  label,
  icon,
  speed,
  amount,
  fiat,
  caption,
  action,
}: DirectionFeeRowProps) {
  return (
    <Flex alignItems="flex-start" gap="space.03" py="space.02" data-approval-zone="fee">
      <IconLane>
        <Flex
          width="32px"
          height="32px"
          alignItems="center"
          justifyContent="center"
          borderRadius="round"
          bg="ink.background-primary"
        >
          <ApprovalFeeIcon icon={icon} speed={speed} />
        </Flex>
      </IconLane>
      <Stack gap="0" flex="1" minWidth={0}>
        <Flex alignItems="center" justifyContent="space-between" gap="space.03" minHeight="32px">
          <styled.span textStyle="label.02" color="ink.text-subdued" flexShrink={0}>
            {label}
          </styled.span>
          <Flex alignItems="center" gap="space.02" minWidth={0}>
            <styled.span textStyle="label.02" whiteSpace="nowrap">
              {amount}
            </styled.span>
            {action && <FeeAction action={action} />}
          </Flex>
        </Flex>
        {(caption || fiat) && (
          <Flex justifyContent="space-between" alignItems="flex-start" gap="space.03">
            <Subtle>{caption && <ApprovalLinesText lines={caption} />}</Subtle>
            {fiat && (
              <styled.span
                textStyle="caption.01"
                color="ink.text-subdued"
                flexShrink={0}
                whiteSpace="nowrap"
              >
                {fiat}
              </styled.span>
            )}
          </Flex>
        )}
      </Stack>
    </Flex>
  );
}

interface PhantomAccountRowProps {
  account: ApprovalAccount;
}

export function PhantomAccountRow({ account }: PhantomAccountRowProps) {
  const identity = account.vault ? `as ${account.name}` : truncateMiddle(account.address, 4);
  const caption = account.signer === 'ledger' ? `${identity} · Ledger` : identity;
  return (
    <Flex alignItems="center" gap="space.03" py="space.02" data-approval-zone="account">
      <IconLane>
        <AccountAvatar account={account} size="md" />
      </IconLane>
      <Stack gap="0" flex="1" minWidth={0}>
        <styled.span textStyle="label.02" truncate>
          {account.vault ? account.vault.name : account.name}
        </styled.span>
        <styled.span textStyle="caption.01" color="ink.text-subdued" truncate>
          {caption}
        </styled.span>
      </Stack>
      {account.balance && (
        <Stack gap="0" alignItems="flex-end" textAlign="right" flexShrink={0}>
          <styled.span textStyle="label.02" whiteSpace="nowrap">
            <ExactAmount value={account.balance.amount} symbol={account.balance.symbol} />
          </styled.span>
          <styled.span textStyle="caption.01" color="ink.text-subdued" whiteSpace="nowrap">
            {account.balance.fiat ? `Balance · ${account.balance.fiat}` : 'Balance'}
          </styled.span>
        </Stack>
      )}
    </Flex>
  );
}
