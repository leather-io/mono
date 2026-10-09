import type { ReactNode } from 'react';

import { Box, Flex, Stack, styled } from 'leather-styles/jsx';

import { CheckmarkCircleIcon, CircleIcon, ErrorCircleIcon, PencilIcon } from '@leather.io/ui';

import { AccountAvatar, RecipientAvatar } from './approval-identity';
import { useApprovalOptions } from './approval-options';
import { approvalDivider, approvalInteractiveRow, approvalSurface } from './approval-surface';
import type { ApprovalAccount } from './approval-types';

type ApprovalSignerStatus = 'signed' | 'waiting' | 'declined' | 'signing' | 'not-needed';

type ApprovalSignerDevice = 'extension' | 'ledger' | 'mobile';

export interface ApprovalSignerEntry {
  name: string;
  device: ApprovalSignerDevice;
  status: ApprovalSignerStatus;
  account?: ApprovalAccount;
  detail?: string;
}

const deviceLabel: Record<ApprovalSignerDevice, string> = {
  extension: 'Leather extension',
  ledger: 'Ledger',
  mobile: 'Leather mobile',
};

const statusLabel: Record<ApprovalSignerStatus, string> = {
  signed: 'Signed',
  waiting: 'Waiting',
  declined: 'Declined',
  signing: 'Signing now',
  'not-needed': 'Not needed',
};

interface SignerStatusProps {
  status: ApprovalSignerStatus;
}

function SignerStatusIcon({ status }: SignerStatusProps) {
  if (status === 'signed') {
    return <CheckmarkCircleIcon variant="small" color="green.action-primary-default" />;
  }
  if (status === 'declined') {
    return <ErrorCircleIcon variant="small" color="red.action-primary-default" />;
  }
  if (status === 'signing') return <PencilIcon variant="small" color="ink.text-primary" />;
  return <CircleIcon variant="small" color="ink.text-non-interactive" />;
}

function SignerStatus({ status }: SignerStatusProps) {
  return (
    <Flex alignItems="center" gap="space.01" flexShrink={0} data-signer-status={status}>
      <Box lineHeight={0}>
        <SignerStatusIcon status={status} />
      </Box>
      <styled.span
        textStyle="label.03"
        color={
          status === 'waiting' || status === 'not-needed' ? 'ink.text-subdued' : 'ink.text-primary'
        }
      >
        {statusLabel[status]}
      </styled.span>
    </Flex>
  );
}

interface SignerRowProps {
  signer: ApprovalSignerEntry;
}

function SignerRow({ signer }: SignerRowProps) {
  const caption = signer.detail
    ? `${deviceLabel[signer.device]} · ${signer.detail}`
    : deviceLabel[signer.device];
  return (
    <Flex alignItems="center" gap="space.03" py="space.02" minHeight="48px">
      {signer.account ? (
        <AccountAvatar account={signer.account} size="md" />
      ) : (
        <RecipientAvatar size="md" />
      )}
      <Stack gap="0" flex="1" minWidth={0}>
        <styled.span textStyle="label.02" truncate>
          {signer.name}
        </styled.span>
        <styled.span textStyle="caption.01" color="ink.text-subdued" truncate>
          {caption}
        </styled.span>
      </Stack>
      <SignerStatus status={signer.status} />
    </Flex>
  );
}

interface ThresholdMeterProps {
  required: number;
  signed: number;
}

function ThresholdMeter({ required, signed }: ThresholdMeterProps) {
  return (
    <Flex gap="3px" width="64px" flexShrink={0} aria-hidden="true">
      {Array.from({ length: required }, (_, index) => (
        <Box
          key={index}
          flex="1"
          height="6px"
          borderRadius="round"
          bg={index < signed ? 'green.action-primary-default' : 'ink.border-default'}
        />
      ))}
    </Flex>
  );
}

function countStatus(signers: ApprovalSignerEntry[], status: ApprovalSignerStatus) {
  return signers.filter(signer => signer.status === status).length;
}

function thresholdCaption(required: number, total: number, declined: number) {
  const rule = `${required} of ${total} signers must sign`;
  if (total - declined < required) return `${rule} · can no longer pass`;
  if (declined > 0) return `${rule} · ${declined} declined`;
  return rule;
}

interface SignersDeclineProps {
  label: string;
  caption?: string;
  isFilled?: boolean;
}

function SignersDecline({ label, caption, isFilled }: SignersDeclineProps) {
  return (
    <Flex
      className={isFilled ? approvalInteractiveRow : approvalDivider}
      alignItems="center"
      justifyContent="space-between"
      gap="space.03"
      py="space.03"
    >
      <styled.button
        type="button"
        textStyle="label.03"
        color="ink.text-primary"
        textDecoration={isFilled ? 'none' : 'underline'}
        textUnderlineOffset="3px"
        textDecorationColor="ink.border-default"
        cursor="pointer"
        whiteSpace="nowrap"
        flexShrink={0}
      >
        {label}
      </styled.button>
      {caption && (
        <styled.span textStyle="caption.01" color="ink.text-subdued" textAlign="right" minWidth={0}>
          {caption}
        </styled.span>
      )}
    </Flex>
  );
}

interface ApprovalSignersProps {
  required: number;
  signers: ApprovalSignerEntry[];
  caption?: ReactNode;
  declineLabel?: string;
  declineCaption?: string;
}

export function ApprovalSigners({
  required,
  signers,
  caption,
  declineLabel,
  declineCaption,
}: ApprovalSignersProps) {
  const isFilled = useApprovalOptions().containers === 'interactive';
  const signed = Math.min(countStatus(signers, 'signed'), required);
  const declined = countStatus(signers, 'declined');
  return (
    <Stack gap="space.02" data-approval-zone="signers">
      <Box className={approvalSurface.group} px="space.04">
        <Flex alignItems="center" justifyContent="space-between" gap="space.03" py="space.03">
          <Stack gap="0" minWidth={0}>
            <styled.span textStyle="label.02">
              {signed} of {required} signatures
            </styled.span>
            <styled.span textStyle="caption.01" color="ink.text-subdued">
              {thresholdCaption(required, signers.length, declined)}
            </styled.span>
          </Stack>
          <ThresholdMeter required={required} signed={signed} />
        </Flex>
        {signers.map(signer => (
          <Box key={signer.name} className={approvalDivider}>
            <SignerRow signer={signer} />
          </Box>
        ))}
        {declineLabel && !isFilled && (
          <SignersDecline label={declineLabel} caption={declineCaption} />
        )}
      </Box>
      {declineLabel && isFilled && (
        <SignersDecline label={declineLabel} caption={declineCaption} isFilled />
      )}
      {caption && (
        <styled.p textStyle="caption.01" color="ink.text-subdued" px="space.01">
          {caption}
        </styled.p>
      )}
    </Stack>
  );
}
