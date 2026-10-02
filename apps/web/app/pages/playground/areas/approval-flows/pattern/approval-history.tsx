import type { ReactNode } from 'react';

import { css } from 'leather-styles/css';
import { Box, Flex, Stack, styled } from 'leather-styles/jsx';

import {
  ArrowLeftIcon,
  BlockchainActivityIndicatorIcon,
  Button,
  CheckmarkCircleIcon,
  ErrorCircleIcon,
  ExternalLinkIcon,
} from '@leather.io/ui';

import {
  type ApprovalHistoryState,
  type DirectionHistoryStatusProps,
  useApprovalDirection,
} from './approval-direction';
import { displayOrigin, truncateMiddle } from './approval-format';
import { ApprovalHistoryStateContext, useApprovalHistoryState } from './approval-history-state';
import { ApprovalOptionsOverride } from './approval-options';
import { ApprovalCopyAction, ApprovalIdentifier, ApprovalRow } from './approval-rows';
import {
  ApprovalIntent,
  ApprovalSection,
  ApprovalShell,
  useRegisterApprovalSigner,
} from './approval-shell';
import type { ApprovalAccount, ApprovalNetwork, ApprovalRequester } from './approval-types';

const pendingIndicatorSize = 16;
const refIdVisible = 6;

interface HistoryStatusCopy {
  label: string;
  preposition: string;
}

const historyStatusCopy: Record<ApprovalHistoryState, HistoryStatusCopy> = {
  confirmed: { label: 'Confirmed', preposition: 'on' },
  pending: { label: 'Pending', preposition: 'since' },
  failed: { label: 'Failed', preposition: 'on' },
};

export const historyStatusText: Record<ApprovalHistoryState, string> = {
  confirmed: css({ color: 'green.action-primary-default' }),
  pending: css({ color: 'orange.action-primary-default' }),
  failed: css({ color: 'red.action-primary-default' }),
};

const explorerFooter = css({
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
});

function ExplorerFooter() {
  return (
    <styled.footer
      data-approval-zone="footer"
      className={explorerFooter}
      position="relative"
      px="space.05"
      pt="space.01"
      pb="space.05"
      bg="ink.background-primary"
    >
      <Button variant="outline" size="lg" fullWidth iconEnd={ExternalLinkIcon}>
        View in explorer
      </Button>
    </styled.footer>
  );
}

interface ApprovalHistoryShellProps {
  state: ApprovalHistoryState;
  children: ReactNode;
}

export function ApprovalHistoryShell({ state, children }: ApprovalHistoryShellProps) {
  return (
    <ApprovalHistoryStateContext.Provider value={state}>
      <ApprovalOptionsOverride accountPlacement="body" launch="off">
        <ApprovalShell footer={<ExplorerFooter />}>{children}</ApprovalShell>
      </ApprovalOptionsOverride>
    </ApprovalHistoryStateContext.Provider>
  );
}

interface ApprovalHistoryHeaderProps {
  account: ApprovalAccount;
}

export function ApprovalHistoryHeader({ account }: ApprovalHistoryHeaderProps) {
  useRegisterApprovalSigner(account);
  return (
    <styled.header px="space.03" pt="space.02" data-approval-zone="requester">
      <Flex
        width="40px"
        height="40px"
        alignItems="center"
        justifyContent="center"
        borderRadius="round"
        cursor="pointer"
        aria-label="Back"
      >
        <ArrowLeftIcon />
      </Flex>
    </styled.header>
  );
}

interface HistoryStatusIconProps {
  state: ApprovalHistoryState;
}

function HistoryStatusIcon({ state }: HistoryStatusIconProps) {
  if (state === 'confirmed') {
    return <CheckmarkCircleIcon variant="small" color="green.action-primary-default" />;
  }
  if (state === 'failed') {
    return <ErrorCircleIcon variant="small" color="red.action-primary-default" />;
  }
  return <BlockchainActivityIndicatorIcon indicator="pending" size={pendingIndicatorSize} />;
}

function BaselineHistoryStatus({
  state,
  label,
  preposition,
  date,
  note,
  actions,
}: DirectionHistoryStatusProps) {
  return (
    <Flex
      gap="space.02"
      alignItems="flex-start"
      px="space.05"
      mt="-space.02"
      pb="space.03"
      data-approval-zone="status"
      data-history-state={state}
    >
      <Box pt="2px" flexShrink={0} lineHeight={0}>
        <HistoryStatusIcon state={state} />
      </Box>
      <Stack gap="space.02" minWidth={0}>
        <styled.p textStyle="label.03">
          <styled.span className={historyStatusText[state]}>{label}</styled.span>
          <styled.span color="ink.text-subdued">{` ${preposition} ${date}`}</styled.span>
        </styled.p>
        {note && (
          <styled.p textStyle="caption.01" color="ink.text-subdued">
            {note}
          </styled.p>
        )}
        {actions}
      </Stack>
    </Flex>
  );
}

interface ApprovalHistoryStatusProps {
  title: string;
  date: string;
  requester?: ApprovalRequester;
  statusLabel?: string;
  note?: ReactNode;
  actions?: ReactNode;
}

export function ApprovalHistoryStatus({
  title,
  date,
  requester,
  statusLabel,
  note,
  actions,
}: ApprovalHistoryStatusProps) {
  const state = useApprovalHistoryState() ?? 'confirmed';
  const Status = useApprovalDirection()?.HistoryStatus ?? BaselineHistoryStatus;
  const copy = historyStatusCopy[state];
  const origin = requester?.frameOrigin ?? requester?.origin;
  return (
    <>
      <ApprovalIntent
        title={title}
        kind={origin ? `Requested by ${displayOrigin(origin)}` : undefined}
      />
      <Status
        state={state}
        label={statusLabel ?? copy.label}
        preposition={copy.preposition}
        date={date}
        note={note}
        actions={actions}
      />
    </>
  );
}

interface ApprovalHistoryActionsProps {
  children: ReactNode;
}

export function ApprovalHistoryActions({ children }: ApprovalHistoryActionsProps) {
  return (
    <Flex gap="space.02" pt="space.01" flexWrap="wrap">
      {children}
    </Flex>
  );
}

interface ApprovalHistoryActionProps {
  label: string;
}

export function ApprovalHistoryAction({ label }: ApprovalHistoryActionProps) {
  return (
    <Button variant="outline" size="sm">
      {label}
    </Button>
  );
}

type HistoryChain = 'Stacks' | 'Bitcoin';

interface ApprovalHistoryDetailsProps {
  chain: HistoryChain;
  network: ApprovalNetwork;
  date: string;
  txid: string;
  nonce?: string;
  block?: string;
  children?: ReactNode;
}

export function ApprovalHistoryDetails({
  chain,
  network,
  date,
  txid,
  nonce,
  block,
  children,
}: ApprovalHistoryDetailsProps) {
  return (
    <ApprovalSection label="Details" divided>
      <ApprovalRow label="Date" value={date} />
      <ApprovalRow label="Network" value={`${chain} ${network.name.toLowerCase()}`} />
      {children}
      {nonce && <ApprovalRow label="Nonce" value={nonce} />}
      {block && <ApprovalRow label="Block" value={block} />}
      <ApprovalRow
        label="Ref ID"
        value={<ApprovalIdentifier>{truncateMiddle(txid, refIdVisible)}</ApprovalIdentifier>}
        action={<ApprovalCopyAction />}
      />
    </ApprovalSection>
  );
}
