import { type ReactNode, isValidElement } from 'react';

import { Box, Flex, Stack, styled } from 'leather-styles/jsx';

import {
  Badge,
  CheckmarkIcon,
  ChevronRightIcon,
  ExternalLinkIcon,
  ShieldIcon,
  Switch,
  UnlockIcon,
  UserIcon,
} from '@leather.io/ui';

import { ChoiceIndicator } from '../pattern/approval-choice';
import type {
  DirectionAccountPickerProps,
  DirectionAssetRowProps,
  DirectionCheckRowProps,
  DirectionChoiceProps,
  DirectionDisclosureRowProps,
  DirectionFeeRowProps,
  DirectionGuaranteeProps,
  DirectionPermissionProps,
  DirectionRecipientRowProps,
  DirectionRowProps,
  DirectionSwitchRowProps,
} from '../pattern/approval-direction';
import { ApproxAmount } from '../pattern/approval-estimate';
import { ApprovalFeeIcon } from '../pattern/approval-fee-speed';
import { truncateMiddle } from '../pattern/approval-format';
import { AccountAvatar } from '../pattern/approval-identity';
import { ApprovalIdentityContextBadge } from '../pattern/approval-identity-context';
import { ApprovalGuaranteeIcon } from '../pattern/approval-notices';
import { ApprovalRecipientNameBlock } from '../pattern/approval-recipient-name';
import { ApprovalCopyAction, ApprovalLinesText, ApprovalRowAction } from '../pattern/approval-rows';
import { approvalSurface } from '../pattern/approval-surface';
import {
  HandshakeActionCue,
  HandshakeAddress,
  HandshakeLabelRow,
  HandshakeTile,
  HandshakeValueRow,
  handshakeFilledRow,
  handshakeOutline,
} from './handshake-primitives';

export { handshakeInteractiveSurface, handshakeOutline } from './handshake-primitives';

interface StatementLaneProps {
  children: ReactNode;
}

function StatementLane({ children }: StatementLaneProps) {
  return (
    <Box width="16px" flexShrink={0} pt="2px" lineHeight={0}>
      {children}
    </Box>
  );
}

interface ActionLabelProps {
  label?: unknown;
}

interface CopyActionProps {
  caption?: unknown;
}

export function isHandshakeAction(action: ReactNode) {
  return (
    isValidElement(action) &&
    (action.type === ApprovalRowAction || action.type === ApprovalCopyAction)
  );
}

interface HandshakeActionProps {
  action: ReactNode;
}

export function HandshakeAction({ action }: HandshakeActionProps) {
  if (isValidElement<ActionLabelProps>(action) && action.type === ApprovalRowAction) {
    const { label } = action.props;
    if (typeof label !== 'string') return action;
    return <HandshakeActionCue label={label} />;
  }
  if (isValidElement<CopyActionProps>(action) && action.type === ApprovalCopyAction) {
    const { caption } = action.props;
    return (
      <Flex alignItems="center" gap="space.02" flexShrink={0}>
        {typeof caption === 'string' && (
          <styled.span textStyle="caption.01" color="ink.text-subdued" whiteSpace="nowrap">
            {caption}
          </styled.span>
        )}
        <HandshakeActionCue label="Copy" kind="copy" />
      </Flex>
    );
  }
  return action;
}

const qualifierHeads = [
  'Exactly this item',
  'Exactly',
  'At least',
  'Everything',
  'Only once approved',
];

function capitalize(text: string) {
  return `${text.charAt(0).toUpperCase()}${text.slice(1)}`;
}

interface SplitQualifier {
  meta?: string;
  caption?: string;
}

function splitQualifier(qualifier?: string): SplitQualifier {
  if (!qualifier) return {};
  const head = qualifierHeads.find(item => qualifier === item || qualifier.startsWith(`${item}, `));
  if (!head) return { caption: qualifier };
  const rest = qualifier.slice(head.length + 2);
  return { meta: head, caption: rest ? capitalize(rest) : undefined };
}

function estimateLine(fiat: string | undefined, source: string) {
  return fiat ? `${fiat} · from ${source}` : `From ${source}`;
}

export function HandshakeAssetRow({
  icon,
  label,
  qualifier,
  amount,
  fiat,
  direction,
  estimateSource,
}: DirectionAssetRowProps) {
  const { meta, caption } = splitQualifier(qualifier);
  const fiatLine = estimateSource ? estimateLine(fiat, estimateSource) : fiat;
  return (
    <Stack gap="space.03" minWidth={0} data-approval-zone="asset">
      <HandshakeLabelRow
        label={label}
        trailing={
          estimateSource ? <Badge label="Estimate" variant="info" outlined flexShrink={0} /> : meta
        }
      />
      <HandshakeValueRow icon={icon}>
        <Stack gap="0" flex="1" minWidth={0}>
          <styled.span
            textStyle="label.02"
            color={direction === 'in' ? 'green.action-primary-default' : 'ink.text-primary'}
            overflowWrap="anywhere"
            minWidth={0}
          >
            {estimateSource ? <ApproxAmount>{amount}</ApproxAmount> : amount}
          </styled.span>
          {fiatLine && (
            <styled.span textStyle="caption.02" color="ink.text-subdued">
              {fiatLine}
            </styled.span>
          )}
          {caption && (
            <styled.span textStyle="caption.01" color="ink.text-subdued" textWrapStyle="pretty">
              {caption}
            </styled.span>
          )}
        </Stack>
      </HandshakeValueRow>
    </Stack>
  );
}

interface HandshakeRecipientRowProps extends DirectionRecipientRowProps {
  metadata?: string;
}

export function HandshakeRecipientRow({
  address,
  label,
  name,
  caption,
  avatar,
  metadata,
  context,
}: HandshakeRecipientRowProps) {
  return (
    <Stack gap="space.03" minWidth={0} data-approval-zone="recipient">
      <HandshakeLabelRow
        label={label === 'To' ? 'Recipient' : label}
        trailing={context ? <ApprovalIdentityContextBadge context={context} /> : metadata}
      />
      <HandshakeValueRow
        icon={
          avatar ?? (
            <HandshakeTile>
              <UserIcon variant="small" />
            </HandshakeTile>
          )
        }
      >
        <Stack gap="space.01" flex="1" minWidth={0}>
          {name && <ApprovalRecipientNameBlock name={name} showKind={!context} />}
          <Box textStyle="label.02" minWidth={0}>
            <HandshakeAddress>{address}</HandshakeAddress>
          </Box>
          {caption && (
            <styled.span textStyle="caption.01" color="ink.text-subdued">
              <ApprovalLinesText lines={caption} />
            </styled.span>
          )}
        </Stack>
      </HandshakeValueRow>
    </Stack>
  );
}

function compactFeeCaption(caption: ReactNode) {
  if (typeof caption !== 'string') return caption;
  return caption.replace(/ · about (\d+) min(?:utes)?\b/g, ' (≈$1m)');
}

export function HandshakeFeeRow({
  label,
  amount,
  fiat,
  caption,
  action,
  icon,
  speed,
}: DirectionFeeRowProps) {
  const isInteractive = isHandshakeAction(action);
  const [summary, ...notes] = Array.isArray(caption) ? caption : [caption];
  return (
    <Stack
      gap="space.03"
      py={isInteractive ? 'space.03' : 'space.02'}
      px={isInteractive ? 'space.04' : '0'}
      className={isInteractive ? handshakeFilledRow : undefined}
      minWidth={0}
      data-approval-zone="fee"
    >
      <HandshakeLabelRow label={label} trailing={action && <HandshakeAction action={action} />} />
      <HandshakeValueRow
        icon={
          <HandshakeTile>
            <ApprovalFeeIcon icon={icon} speed={speed} size={24} />
          </HandshakeTile>
        }
      >
        <Stack gap="0" flex="1" minWidth={0}>
          <styled.span textStyle="label.02" overflowWrap="anywhere">
            {amount}
          </styled.span>
          {(fiat || summary) && (
            <styled.span textStyle="caption.02" color="ink.text-subdued">
              {fiat}
              {fiat && summary ? ' · ' : null}
              {compactFeeCaption(summary)}
            </styled.span>
          )}
          {notes.length > 0 && (
            <styled.span textStyle="caption.02" color="ink.text-subdued">
              <ApprovalLinesText lines={notes} />
            </styled.span>
          )}
        </Stack>
      </HandshakeValueRow>
    </Stack>
  );
}

export function HandshakeRow({ label, value, caption, action }: DirectionRowProps) {
  const isInteractive = isHandshakeAction(action);
  return (
    <Stack
      gap="space.01"
      px={isInteractive ? 'space.04' : '0'}
      py={isInteractive ? 'space.03' : 'space.02'}
      minHeight="36px"
      minWidth={0}
      className={isInteractive ? handshakeFilledRow : undefined}
    >
      <HandshakeLabelRow
        label={label === 'To' ? 'Recipient' : label}
        trailing={isInteractive ? <HandshakeAction action={action} /> : action}
      />
      <Box textStyle="label.02" minWidth={0} overflowWrap="anywhere">
        <HandshakeAddress>{value}</HandshakeAddress>
      </Box>
      {caption && (
        <styled.span textStyle="caption.01" color="ink.text-subdued" textWrapStyle="pretty">
          <ApprovalLinesText lines={caption} />
        </styled.span>
      )}
    </Stack>
  );
}

interface CheckTextProps {
  title: string;
  caption?: ReactNode;
}

function CheckText({ title, caption }: CheckTextProps) {
  return (
    <Stack gap="0" minWidth={0}>
      <styled.span textStyle="label.02">{title}</styled.span>
      {caption && (
        <styled.span textStyle="caption.02" color="ink.text-subdued">
          {caption}
        </styled.span>
      )}
    </Stack>
  );
}

export function HandshakeCheckRow({ icon, title, caption }: DirectionCheckRowProps) {
  return (
    <Flex gap="space.02" alignItems="flex-start" py="space.02">
      <StatementLane>{icon}</StatementLane>
      <CheckText title={title} caption={caption} />
    </Flex>
  );
}

export function HandshakePermission({ kind, children }: DirectionPermissionProps) {
  return (
    <Flex gap="space.02" alignItems="flex-start" py="space.02">
      <StatementLane>
        {kind === 'can' ? (
          <CheckmarkIcon variant="small" color="ink.text-primary" />
        ) : (
          <ShieldIcon variant="small" color="ink.text-primary" />
        )}
      </StatementLane>
      <styled.span textStyle="body.02" minWidth={0}>
        {children}
      </styled.span>
    </Flex>
  );
}

export function HandshakeAccountPicker({
  account,
  caption,
  isConnected,
}: DirectionAccountPickerProps) {
  return (
    <Stack
      gap="space.03"
      px="space.04"
      py="space.03"
      className={handshakeFilledRow}
      minWidth={0}
      data-approval-zone="account-picker"
    >
      <HandshakeLabelRow label="Account" trailing={<HandshakeActionCue label="Change" />} />
      <HandshakeValueRow icon={<AccountAvatar account={account} size="md" hasTile />}>
        <Stack gap="0" flex="1" minWidth={0}>
          <Flex alignItems="center" gap="space.02" flexWrap="wrap">
            <styled.span textStyle="label.02">{account.name}</styled.span>
            {isConnected && <Badge label="Connected" variant="success" />}
          </Flex>
          <styled.span
            textStyle="code"
            color="ink.text-subdued"
            overflowWrap="anywhere"
            title={account.address}
          >
            {caption === account.address ? truncateMiddle(account.address) : caption}
          </styled.span>
        </Stack>
      </HandshakeValueRow>
    </Stack>
  );
}

export function HandshakeDisclosureRow({
  label,
  caption,
  isExternal,
}: DirectionDisclosureRowProps) {
  return (
    <Flex
      alignItems="center"
      justifyContent="space-between"
      gap="space.03"
      px="space.04"
      py="space.03"
      minHeight="44px"
      className={handshakeFilledRow}
    >
      <Stack gap="0" minWidth={0}>
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

export function HandshakeSwitchRow({
  switchId,
  title,
  caption,
  icon,
  isChecked,
  onCheckedChange,
}: DirectionSwitchRowProps) {
  return (
    <Flex
      alignItems="center"
      gap="space.03"
      px="space.04"
      py="space.03"
      className={handshakeFilledRow}
    >
      {icon && (
        <Box flexShrink={0} lineHeight={0}>
          {icon}
        </Box>
      )}
      <Stack gap="0" flex="1" minWidth={0}>
        <styled.label
          htmlFor={switchId}
          display="flex"
          minWidth={0}
          textStyle="label.02"
          cursor="pointer"
        >
          {title}
        </styled.label>
        {caption && (
          <styled.span textStyle="caption.01" color="ink.text-subdued">
            {caption}
          </styled.span>
        )}
      </Stack>
      <Box flexShrink={0} lineHeight={0}>
        <Switch.Root id={switchId} checked={isChecked} onCheckedChange={onCheckedChange}>
          <Switch.Thumb />
        </Switch.Root>
      </Box>
    </Flex>
  );
}

export function HandshakeChoice({
  label,
  icon,
  caption,
  badge,
  value,
  valueCaption,
  isSelected,
  isDisabled,
  children,
  onSelect,
}: DirectionChoiceProps) {
  const textColor = isDisabled ? 'ink.text-non-interactive' : 'ink.text-primary';
  return (
    <Stack gap="0" className={isDisabled ? handshakeOutline : handshakeFilledRow}>
      <styled.button
        type="button"
        role="radio"
        aria-checked={isSelected}
        disabled={isDisabled}
        display="flex"
        width="100%"
        alignItems="flex-start"
        gap="space.03"
        px="space.04"
        py="space.03"
        textAlign="left"
        cursor={isDisabled ? 'not-allowed' : 'pointer'}
        onClick={onSelect}
      >
        <Stack gap={icon || value ? 'space.03' : 'space.01'} flex="1" minWidth={0}>
          <HandshakeLabelRow
            label={
              <Flex alignItems="center" gap="space.02" flexWrap="wrap">
                <styled.span textStyle="label.02" color={textColor}>
                  {label}
                </styled.span>
                {badge}
              </Flex>
            }
            trailing={<ChoiceIndicator isSelected={isSelected} isDisabled={isDisabled} />}
          />
          {(icon || value || caption) && (
            <HandshakeValueRow icon={icon && <HandshakeTile>{icon}</HandshakeTile>}>
              <Stack gap="0" flex="1" minWidth={0}>
                {value && (
                  <styled.span textStyle="label.02" color={textColor} overflowWrap="anywhere">
                    {value}
                  </styled.span>
                )}
                {valueCaption && (
                  <styled.span textStyle="caption.02" color="ink.text-subdued">
                    {valueCaption}
                  </styled.span>
                )}
                {caption && (
                  <styled.span textStyle="caption.01" color="ink.text-subdued">
                    <ApprovalLinesText lines={caption} />
                  </styled.span>
                )}
              </Stack>
            </HandshakeValueRow>
          )}
        </Stack>
      </styled.button>
      {isSelected && children && (
        <Box px="space.04" pb="space.03" style={{ paddingLeft: icon ? '60px' : undefined }}>
          {children}
        </Box>
      )}
    </Stack>
  );
}

export function HandshakeGuarantee({ kind, label, isWeak, children }: DirectionGuaranteeProps) {
  if (isWeak) {
    return (
      <Flex
        gap="space.02"
        alignItems="flex-start"
        px="space.04"
        py="space.03"
        className={approvalSurface.notice}
        data-approval-zone="guarantee"
      >
        <StatementLane>
          <UnlockIcon variant="small" color="yellow.action-primary-default" />
        </StatementLane>
        <styled.p textStyle="caption.01" color="ink.text-primary">
          <styled.span textStyle="label.03">{label}.</styled.span> {children}
        </styled.p>
      </Flex>
    );
  }
  return (
    <Flex gap="space.02" alignItems="flex-start" data-approval-zone="guarantee">
      <StatementLane>
        <ApprovalGuaranteeIcon kind={kind} isWeak={false} />
      </StatementLane>
      <styled.p textStyle="caption.01" color="ink.text-subdued" textWrapStyle="pretty">
        <styled.span textStyle="label.03" color="ink.text-primary">
          {label}.
        </styled.span>{' '}
        {children}
      </styled.p>
    </Flex>
  );
}
