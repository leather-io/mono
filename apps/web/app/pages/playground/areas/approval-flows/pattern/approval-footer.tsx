import { type ReactNode, useState } from 'react';

import { css } from 'leather-styles/css';
import { Box, Flex, Stack, styled } from 'leather-styles/jsx';

import {
  ArrowRotateClockwiseIcon,
  Button,
  ErrorTriangleIcon,
  InfoCircleIcon,
  NoteTextIcon,
  PencilIcon,
  SettingsGearIcon,
} from '@leather.io/ui';

import {
  type ApprovalConfirmation,
  ApprovalConfirmationField,
  ApprovalPrimaryButton,
  needsConfirmationField,
} from './approval-confirm';
import { type ApprovalLines, useApprovalDirection } from './approval-direction';
import { AccountAvatar, AccountLine } from './approval-identity';
import { type ApprovalFooterEdge, useApprovalOptions } from './approval-options';
import { ApprovalLinesText } from './approval-rows';
import { useApprovalAccountSlot, useApprovalSigner } from './approval-shell';

interface ApprovalTotal {
  label?: string;
  amount: ApprovalLines;
  fiat?: string;
  priced?: string;
}

type ApprovalReversibility =
  | 'permanent'
  | 'once-confirmed'
  | 'replaceable'
  | 'removable'
  | 'signed-copy'
  | 'proposal'
  | 'cycle-end';

const reversibilityCopy: Record<ApprovalReversibility, string> = {
  permanent: 'Can’t be undone',
  'once-confirmed': 'Can’t be undone once confirmed',
  replaceable: 'Can be sped up or replaced while pending',
  removable: 'Can be removed in Settings',
  'signed-copy': 'Once signed, it stays valid until it’s used',
  proposal: 'Can be replaced by a newer proposal until it’s sent',
  'cycle-end': 'Can be ended from Leather, at the end of any cycle',
};

const defaultPriced = 'Priced 1 min ago';

function hasPrice(fiat?: string) {
  return Boolean(fiat?.includes('$'));
}

interface ReversibilityIconProps {
  reversibility: ApprovalReversibility;
}

function ReversibilityIcon({ reversibility }: ReversibilityIconProps) {
  if (reversibility === 'replaceable') {
    return <ArrowRotateClockwiseIcon variant="small" color="ink.text-subdued" />;
  }
  if (reversibility === 'removable' || reversibility === 'cycle-end') {
    return <SettingsGearIcon variant="small" color="ink.text-subdued" />;
  }
  if (reversibility === 'proposal') return <PencilIcon variant="small" color="ink.text-subdued" />;
  if (reversibility === 'signed-copy') {
    return <NoteTextIcon variant="small" color="ink.text-subdued" />;
  }
  return <InfoCircleIcon variant="small" color="ink.text-subdued" />;
}

interface ReversibilityLineProps {
  reversibility: ApprovalReversibility;
}

function ReversibilityLine({ reversibility }: ReversibilityLineProps) {
  return (
    <Flex gap="space.02" alignItems="center" data-approval-zone="reversibility">
      <Box flexShrink={0} lineHeight={0}>
        <ReversibilityIcon reversibility={reversibility} />
      </Box>
      <styled.span textStyle="caption.01" color="ink.text-subdued">
        {reversibilityCopy[reversibility]}
      </styled.span>
    </Flex>
  );
}

interface ApprovalSecondaryTotal {
  label: string;
  amount: ReactNode;
  caption?: string;
}

interface ApprovalFooterProps {
  primaryLabel: string;
  secondaryLabel?: string;
  total?: ApprovalTotal;
  secondaryTotal?: ApprovalSecondaryTotal;
  blockedReason?: ReactNode;
  isPrimaryDisabled?: boolean;
  isBusy?: boolean;
  primaryIntent?: 'default' | 'danger';
  hint?: ReactNode;
  single?: boolean;
  signerLabel?: string;
  confirmation?: ApprovalConfirmation;
  reversibility?: ApprovalReversibility;
}

const footerEdgeStyles: Record<ApprovalFooterEdge, string> = {
  line: css({
    borderTopWidth: 1,
    borderColor: 'ink.border-default',
    '[data-approval-containers=interactive] &': { borderTopWidth: 0 },
  }),
  gradient: css({
    _before: {
      content: '""',
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      height: '1px',
      backgroundImage:
        'linear-gradient(90deg, token(colors.ink.background-primary) 0%, token(colors.ink.border-default) 40%, token(colors.ink.border-default) 60%, token(colors.ink.background-primary) 100%)',
    },
    '[data-approval-containers=interactive] &': { '&::before': { display: 'none' } },
  }),
  fade: css({
    _before: {
      content: '""',
      position: 'absolute',
      left: 0,
      right: 0,
      bottom: '100%',
      height: '32px',
      pointerEvents: 'none',
      backgroundImage:
        'linear-gradient(to bottom, rgb(from token(colors.ink.background-primary) r g b / 0), token(colors.ink.background-primary))',
    },
  }),
};

export function ApprovalFooter({
  primaryLabel,
  secondaryLabel = 'Cancel',
  total,
  secondaryTotal,
  blockedReason,
  isPrimaryDisabled,
  isBusy,
  primaryIntent = 'default',
  hint,
  single,
  signerLabel = 'Signing with',
  confirmation,
  reversibility,
}: ApprovalFooterProps) {
  const { accountPlacement, footerEdge } = useApprovalOptions();
  const direction = useApprovalDirection();
  const resolvedFooterEdge =
    direction?.id === 'handshake' && footerEdge === 'gradient' ? 'fade' : footerEdge;
  const signer = useApprovalSigner();
  const hasAccountSlot = useApprovalAccountSlot();
  const showSigner =
    accountPlacement === 'footer' || (accountPlacement === 'body' && !hasAccountSlot);
  const [isConfirmed, setIsConfirmed] = useState(false);
  const isAwaitingConfirmation = needsConfirmationField(confirmation) && !isConfirmed;
  const isDisabled = Boolean(blockedReason) || Boolean(isPrimaryDisabled) || isAwaitingConfirmation;
  const armKey = [primaryLabel, total?.label, total?.fiat, secondaryTotal?.label].join('|');
  return (
    <styled.footer
      data-approval-zone="footer"
      data-footer-edge={resolvedFooterEdge}
      className={footerEdgeStyles[resolvedFooterEdge]}
      position="relative"
      px="space.05"
      pt="space.03"
      pb="space.05"
      bg="ink.background-primary"
    >
      <Stack gap="space.03">
        {total && (
          <Flex justifyContent="space-between" alignItems="flex-start" gap="space.04">
            <Stack gap="0" minWidth={0}>
              <styled.span textStyle="label.02">{total.label ?? 'Total'}</styled.span>
              {hasPrice(total.fiat) && (
                <styled.span
                  textStyle="caption.01"
                  color="ink.text-subdued"
                  data-approval-zone="priced"
                >
                  {total.priced ?? defaultPriced}
                </styled.span>
              )}
            </Stack>
            <Stack gap="0" alignItems="flex-end" textAlign="right">
              <styled.span textStyle="label.02">
                <ApprovalLinesText lines={total.amount} />
              </styled.span>
              {total.fiat && (
                <styled.span textStyle="caption.01" color="ink.text-subdued">
                  {total.fiat}
                </styled.span>
              )}
            </Stack>
          </Flex>
        )}
        {secondaryTotal && (
          <Flex justifyContent="space-between" alignItems="baseline" gap="space.04">
            <styled.span textStyle="caption.01" color="ink.text-subdued">
              {secondaryTotal.label}
            </styled.span>
            <Stack gap="0" alignItems="flex-end" textAlign="right">
              <styled.span textStyle="caption.01" color="ink.text-subdued">
                {secondaryTotal.amount}
              </styled.span>
              {secondaryTotal.caption && (
                <styled.span textStyle="caption.01" color="ink.text-subdued">
                  {secondaryTotal.caption}
                </styled.span>
              )}
            </Stack>
          </Flex>
        )}
        {blockedReason && (
          <Flex gap="space.02" alignItems="flex-start">
            <Box flexShrink={0} pt="2px" lineHeight={0}>
              <ErrorTriangleIcon variant="small" color="red.action-primary-default" />
            </Box>
            <styled.p textStyle="caption.01" color="red.text-primary">
              {blockedReason}
            </styled.p>
          </Flex>
        )}
        {hint}
        {signer && showSigner && (
          <Flex alignItems="center" gap="space.02" data-approval-zone="account">
            <styled.span textStyle="caption.01" color="ink.text-subdued" flexShrink={0}>
              {signerLabel}
            </styled.span>
            <AccountAvatar account={signer} size="xs" />
            <AccountLine account={signer} compact />
          </Flex>
        )}
        {reversibility && !blockedReason && <ReversibilityLine reversibility={reversibility} />}
        {single && isBusy && (
          <Button variant="outline" size="lg" fullWidth>
            {secondaryLabel}
          </Button>
        )}
        {!blockedReason && (
          <ApprovalConfirmationField
            confirmation={confirmation}
            onConfirmedChange={setIsConfirmed}
          />
        )}
        {single && !isBusy && (
          <ApprovalPrimaryButton
            label={primaryLabel}
            intent={primaryIntent}
            isDisabled={isDisabled}
            isFullWidth
            armKey={armKey}
            confirmation={confirmation}
          />
        )}
        {!single && (
          <Flex gap="space.03">
            <Button variant="outline" size="lg" flex="1">
              {secondaryLabel}
            </Button>
            <ApprovalPrimaryButton
              label={primaryLabel}
              intent={primaryIntent}
              isDisabled={isDisabled}
              isBusy={isBusy}
              isFullWidth={false}
              armKey={armKey}
              confirmation={confirmation}
            />
          </Flex>
        )}
      </Stack>
    </styled.footer>
  );
}
