import { type ReactNode, isValidElement } from 'react';

import { Box, Flex, Stack, styled } from 'leather-styles/jsx';

import { UnlockIcon } from '@leather.io/ui';

import type {
  DirectionAssetRowProps,
  DirectionFeeRowProps,
  DirectionGuaranteeProps,
  DirectionRecipientRowProps,
} from '../pattern/approval-direction';
import { ApprovalEstimateSource, ApproxAmount } from '../pattern/approval-estimate';
import { truncateMiddle } from '../pattern/approval-format';
import { AccountAvatar, RecipientAvatar } from '../pattern/approval-identity';
import { ApprovalGuaranteeIcon } from '../pattern/approval-notices';
import { ApprovalRecipientNameBlock } from '../pattern/approval-recipient-name';
import { ApprovalLinesText, ExactAmount } from '../pattern/approval-rows';
import { approvalInteractiveRow, approvalSurface } from '../pattern/approval-surface';
import type { ApprovalAccount } from '../pattern/approval-types';
import { tactilePress } from './tactile-motion';

interface ActionLabelProps {
  label?: unknown;
}

function readActionLabel(action: ReactNode) {
  if (isValidElement<ActionLabelProps>(action) && typeof action.props.label === 'string') {
    return action.props.label;
  }
  return undefined;
}

interface TactilePillActionProps {
  action: ReactNode;
}

function TactilePillAction({ action }: TactilePillActionProps) {
  const label = readActionLabel(action);
  if (!label) return action;
  return (
    <styled.span
      display="inline-flex"
      alignItems="center"
      height="28px"
      px="space.03"
      borderRadius="round"
      bg="ink.background-primary"
      textStyle="label.03"
      color="ink.text-primary"
      cursor="pointer"
      flexShrink={0}
      whiteSpace="nowrap"
      className={tactilePress}
    >
      {label}
    </styled.span>
  );
}

export function TactileAssetRow({
  icon,
  label,
  qualifier,
  amount,
  fiat,
  direction,
  estimateSource,
}: DirectionAssetRowProps) {
  return (
    <Stack gap="space.02" minWidth={0} data-approval-zone="asset">
      <Flex alignItems="center" justifyContent="space-between" gap="space.03">
        <styled.span textStyle="label.03" color="ink.text-subdued" flexShrink={0}>
          {label}
        </styled.span>
        {fiat && (
          <styled.span textStyle="caption.01" color="ink.text-subdued" truncate>
            {fiat}
          </styled.span>
        )}
      </Flex>
      <Flex alignItems="center" gap="space.03" minWidth={0}>
        <Box flexShrink={0} lineHeight={0}>
          {icon}
        </Box>
        <styled.span
          textStyle="heading.05"
          color={direction === 'in' ? 'green.action-primary-default' : 'ink.text-primary'}
          whiteSpace="nowrap"
          minWidth={0}
        >
          {estimateSource ? <ApproxAmount>{amount}</ApproxAmount> : amount}
        </styled.span>
      </Flex>
      {(qualifier || estimateSource) && (
        <Stack gap="0">
          {qualifier && (
            <styled.span textStyle="caption.01" color="ink.text-subdued">
              {qualifier}
            </styled.span>
          )}
          {estimateSource && <ApprovalEstimateSource source={estimateSource} />}
        </Stack>
      )}
    </Stack>
  );
}

export function TactileRecipientRow({
  address,
  label,
  name,
  caption,
  avatar,
}: DirectionRecipientRowProps) {
  return (
    <Flex gap="space.03" alignItems="flex-start" minWidth={0} data-approval-zone="recipient">
      <Box flexShrink={0} lineHeight={0}>
        {avatar ?? <RecipientAvatar />}
      </Box>
      <Stack gap="space.01" flex="1" minWidth={0}>
        <Flex alignItems="center" minHeight="32px">
          <styled.span textStyle="label.03" color="ink.text-subdued">
            {label}
          </styled.span>
        </Flex>
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
  );
}

export function TactileFeeRow({ label, amount, fiat, caption, action }: DirectionFeeRowProps) {
  return (
    <Flex
      alignItems="center"
      gap="space.03"
      py="space.02"
      minHeight="48px"
      className={action ? approvalInteractiveRow : undefined}
      data-approval-zone="fee"
    >
      <Stack gap="0" flex="1" minWidth={0}>
        <Flex justifyContent="space-between" alignItems="baseline" gap="space.03">
          <styled.span textStyle="label.02" flexShrink={0}>
            {label}
          </styled.span>
          <styled.span textStyle="label.02" whiteSpace="nowrap">
            {amount}
          </styled.span>
        </Flex>
        {(caption || fiat) && (
          <Flex justifyContent="space-between" alignItems="flex-start" gap="space.03">
            <styled.span textStyle="caption.01" color="ink.text-subdued" minWidth={0}>
              {caption && <ApprovalLinesText lines={caption} />}
            </styled.span>
            {fiat && (
              <styled.span
                textStyle="caption.01"
                color="ink.text-subdued"
                whiteSpace="nowrap"
                flexShrink={0}
              >
                {fiat}
              </styled.span>
            )}
          </Flex>
        )}
      </Stack>
      {action && <TactilePillAction action={action} />}
    </Flex>
  );
}

interface TactileAccountRowProps {
  account: ApprovalAccount;
}

export function TactileAccountRow({ account }: TactileAccountRowProps) {
  const identity = account.vault ? `as ${account.name}` : truncateMiddle(account.address, 4);
  return (
    <Flex
      alignItems="center"
      gap="space.03"
      py="space.02"
      minHeight="48px"
      data-approval-zone="account"
    >
      <AccountAvatar account={account} size="md" />
      <Stack gap="0" flex="1" minWidth={0}>
        <styled.span textStyle="label.02" truncate>
          {account.vault ? account.vault.name : account.name}
        </styled.span>
        <styled.span textStyle="caption.01" color="ink.text-subdued" truncate>
          {account.signer === 'ledger' ? `${identity} · Ledger` : identity}
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

export function TactileGuarantee({ kind, label, isWeak, children }: DirectionGuaranteeProps) {
  if (isWeak) {
    return (
      <Flex
        gap="space.03"
        alignItems="flex-start"
        px="space.04"
        py="space.03"
        className={approvalSurface.notice}
        data-approval-zone="guarantee"
      >
        <Box flexShrink={0} pt="2px" lineHeight={0}>
          <UnlockIcon variant="small" color="yellow.action-primary-default" />
        </Box>
        <styled.p textStyle="caption.01" color="ink.text-primary">
          <styled.span textStyle="label.03">{label}.</styled.span> {children}
        </styled.p>
      </Flex>
    );
  }
  return (
    <Stack gap="space.02" alignItems="flex-start" data-approval-zone="guarantee">
      <Flex
        alignItems="center"
        gap="space.01"
        height="24px"
        pl="space.02"
        pr="space.03"
        borderRadius="round"
        bg="ink.component-background-default"
      >
        <Box lineHeight={0}>
          <ApprovalGuaranteeIcon kind={kind} isWeak={false} />
        </Box>
        <styled.span textStyle="label.03">{label}</styled.span>
      </Flex>
      <styled.p textStyle="caption.01" color="ink.text-subdued">
        {children}
      </styled.p>
    </Stack>
  );
}
