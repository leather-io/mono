import type { ReactNode } from 'react';

import { Box, Flex, Stack, styled } from 'leather-styles/jsx';

import {
  ArrowRotateClockwiseIcon,
  Callout,
  CheckmarkCircleIcon,
  CheckmarkIcon,
  ErrorTriangleIcon,
  InfoCircleIcon,
  NumberedListIcon,
  ShieldIcon,
  UnlockIcon,
} from '@leather.io/ui';

import {
  type ApprovalGuaranteeKind,
  type ApprovalPermissionKind,
  type DirectionCheckRowProps,
  type DirectionGuaranteeProps,
  type DirectionPermissionProps,
  useApprovalDirection,
} from './approval-direction';

const guaranteeLabel: Record<ApprovalGuaranteeKind, string> = {
  strict: 'Strict',
  'account-only': 'Your account only',
  unrestricted: 'Unrestricted',
  final: 'Outputs final',
  open: 'Outputs can change',
  staking: 'Staking action',
};

interface ApprovalGuaranteeIconProps {
  kind: ApprovalGuaranteeKind;
  isWeak: boolean;
}

export function ApprovalGuaranteeIcon({ kind, isWeak }: ApprovalGuaranteeIconProps) {
  if (isWeak) return <UnlockIcon variant="small" color="yellow.action-primary-default" />;
  if (kind === 'staking') {
    return <ArrowRotateClockwiseIcon variant="small" color="ink.text-subdued" />;
  }
  return <NumberedListIcon variant="small" color="ink.text-subdued" />;
}

function BaselineGuarantee({ kind, label, isWeak, children }: DirectionGuaranteeProps) {
  if (isWeak) {
    return (
      <Flex gap="space.03" alignItems="flex-start" py="space.02" data-approval-zone="guarantee">
        <Flex
          width="32px"
          height="32px"
          flexShrink={0}
          alignItems="center"
          justifyContent="center"
          borderRadius="round"
          bg="yellow.background-secondary"
        >
          <ApprovalGuaranteeIcon kind={kind} isWeak />
        </Flex>
        <styled.p textStyle="caption.01" color="ink.text-subdued" pt="1px">
          <styled.span textStyle="label.03" color="ink.text-primary">
            {label}.
          </styled.span>{' '}
          {children}
        </styled.p>
      </Flex>
    );
  }
  return (
    <Flex gap="space.03" alignItems="flex-start" py="space.01" data-approval-zone="guarantee">
      <Flex width="32px" justifyContent="center" flexShrink={0} pt="2px">
        <ApprovalGuaranteeIcon kind={kind} isWeak={false} />
      </Flex>
      <styled.p textStyle="caption.01" color="ink.text-subdued">
        <styled.span color="ink.text-primary">{label}.</styled.span> {children}
      </styled.p>
    </Flex>
  );
}

interface ApprovalGuaranteeProps {
  kind: ApprovalGuaranteeKind;
  children: ReactNode;
}

export function ApprovalGuarantee({ kind, children }: ApprovalGuaranteeProps) {
  const override = useApprovalDirection()?.Guarantee;
  const Guarantee = override ?? BaselineGuarantee;
  return (
    <Guarantee
      kind={kind}
      label={guaranteeLabel[kind]}
      isWeak={kind === 'unrestricted' || kind === 'open'}
    >
      {children}
    </Guarantee>
  );
}

export function BaselineCheckRow({ icon, title, caption }: DirectionCheckRowProps) {
  return (
    <Flex gap="space.03" alignItems="flex-start" py="space.02">
      <Flex width="32px" justifyContent="center" pt="2px" flexShrink={0} lineHeight={0}>
        {icon}
      </Flex>
      <Stack gap="0" minWidth={0}>
        <styled.span textStyle="label.02">{title}</styled.span>
        {caption && (
          <styled.span textStyle="caption.01" color="ink.text-subdued">
            {caption}
          </styled.span>
        )}
      </Stack>
    </Flex>
  );
}

interface ApprovalCheckProps {
  title: string;
  caption?: ReactNode;
}

export function ApprovalCheck({ title, caption }: ApprovalCheckProps) {
  const Row = useApprovalDirection()?.CheckRow ?? BaselineCheckRow;
  return (
    <Row
      icon={<CheckmarkCircleIcon variant="small" color="green.action-primary-default" />}
      title={title}
      caption={caption}
    />
  );
}

function BaselinePermission({ children, kind }: DirectionPermissionProps) {
  return (
    <Flex gap="space.03" alignItems="flex-start" py="space.02">
      <Box flexShrink={0} pt="2px" lineHeight={0}>
        {kind === 'can' ? (
          <CheckmarkIcon variant="small" color="ink.text-primary" />
        ) : (
          <ShieldIcon variant="small" color="ink.text-primary" />
        )}
      </Box>
      <styled.span textStyle="body.02">{children}</styled.span>
    </Flex>
  );
}

interface ApprovalPermissionProps {
  children: string;
  kind?: ApprovalPermissionKind;
}

export function ApprovalPermission({ children, kind = 'can' }: ApprovalPermissionProps) {
  const Permission = useApprovalDirection()?.Permission ?? BaselinePermission;
  return <Permission kind={kind}>{children}</Permission>;
}

interface ApprovalNoteProps {
  children: ReactNode;
  icon?: 'info' | 'shield';
}

export function ApprovalNote({ children, icon = 'info' }: ApprovalNoteProps) {
  return (
    <Flex gap="space.02" alignItems="flex-start" px="space.05" py="space.02">
      <Box pt="2px" flexShrink={0} lineHeight={0}>
        {icon === 'shield' ? (
          <ShieldIcon variant="small" color="ink.text-subdued" />
        ) : (
          <InfoCircleIcon variant="small" color="ink.text-subdued" />
        )}
      </Box>
      <styled.span textStyle="caption.01" color="ink.text-subdued">
        {children}
      </styled.span>
    </Flex>
  );
}

interface ApprovalCautionProps {
  title: string;
  children?: ReactNode;
  source?: string;
  tone?: 'caution' | 'blocking';
}

export function ApprovalCaution({
  title,
  children,
  source,
  tone = 'caution',
}: ApprovalCautionProps) {
  return (
    <Callout
      data-approval-zone="caution"
      variant={tone === 'blocking' ? 'error' : 'warning'}
      title={title}
      icon={<ErrorTriangleIcon variant="small" />}
    >
      {children}
      {source && (
        <styled.span display="block" mt="space.01" color="ink.text-primary" opacity={0.8}>
          Source: {source}
        </styled.span>
      )}
    </Callout>
  );
}
