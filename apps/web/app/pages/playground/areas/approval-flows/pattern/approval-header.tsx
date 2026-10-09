import type { ReactNode } from 'react';

import { css, cx } from 'leather-styles/css';
import { Flex, Stack, styled } from 'leather-styles/jsx';

import { useApprovalDirection } from './approval-direction';
import {
  AccountCaption,
  NetworkChip,
  OriginName,
  RequesterAccountPair,
  RequesterIcon,
  requesterContextNote,
} from './approval-identity';
import {
  type ApprovalHeaderRadius,
  type ApprovalHeaderSurface,
  useApprovalOptions,
} from './approval-options';
import { useRegisterApprovalIdentity, useRegisterApprovalSigner } from './approval-shell';
import { approvalGroupFill } from './approval-surface';
import type { ApprovalAccount, ApprovalNetwork, ApprovalRequester } from './approval-types';

const headerSurfaceStyles: Record<ApprovalHeaderSurface, string> = {
  divider: css({
    px: 'space.05',
    py: 'space.03',
    borderBottomWidth: 1,
    borderColor: 'ink.border-default',
    '[data-approval-containers=interactive] &': { borderBottomWidth: 0 },
  }),
  plain: css({ px: 'space.05', py: 'space.03' }),
  card: css({
    mx: 'space.03',
    mt: 'space.03',
    px: 'space.03',
    py: 'space.03',
  }),
};

const headerRadiusStyles: Record<ApprovalHeaderRadius, string> = {
  sm: css({ borderRadius: 'sm' }),
  md: css({ borderRadius: 'md' }),
  lg: css({ borderRadius: 'lg' }),
  xl: css({ borderRadius: '20px' }),
};

function headerSurfaceClassName(surface: ApprovalHeaderSurface, radius: ApprovalHeaderRadius) {
  if (surface === 'card') {
    return cx(headerSurfaceStyles.card, approvalGroupFill, headerRadiusStyles[radius]);
  }
  return headerSurfaceStyles[surface];
}

interface HeaderNoteProps {
  note: string;
}

function HeaderNote({ note }: HeaderNoteProps) {
  return (
    <styled.span textStyle="caption.01" color="ink.text-subdued" truncate>
      {note}
    </styled.span>
  );
}

interface HeaderSiteProps {
  origin: string;
  note?: string;
}

function HeaderSite({ origin, note }: HeaderSiteProps) {
  return (
    <>
      <RequesterIcon origin={origin} />
      <Stack gap="0" flex="1" minWidth={0}>
        <OriginName origin={origin} />
        {note && <HeaderNote note={note} />}
      </Stack>
    </>
  );
}

interface HeaderSiteAndAccountProps {
  origin: string;
  account: ApprovalAccount;
  note?: string;
  isFilledCard: boolean;
}

function HeaderSiteAndAccount({ origin, account, note, isFilledCard }: HeaderSiteAndAccountProps) {
  return (
    <>
      <RequesterAccountPair
        origin={origin}
        account={account}
        ring={isFilledCard ? 'secondary' : 'primary'}
      />
      <Stack gap="0" flex="1" minWidth={0}>
        <OriginName origin={origin} />
        <AccountCaption account={account} />
        {note && <HeaderNote note={note} />}
      </Stack>
    </>
  );
}

interface ApprovalHeaderProps {
  requester: ApprovalRequester;
  account?: ApprovalAccount;
  connecting?: ApprovalAccount;
  network: ApprovalNetwork;
  trailing?: ReactNode;
}

export function ApprovalHeader({
  requester,
  account,
  connecting,
  network,
  trailing,
}: ApprovalHeaderProps) {
  const { accountPlacement, headerSurface, headerRadius, containers } = useApprovalOptions();
  const siteOrigin = requester.frameOrigin ?? requester.origin;
  useRegisterApprovalSigner(account);
  useRegisterApprovalIdentity(siteOrigin, account ?? connecting);
  const Header = useApprovalDirection()?.Header;
  if (Header) {
    return (
      <Header
        requester={requester}
        network={network}
        account={account}
        connecting={connecting}
        trailing={trailing}
      />
    );
  }
  const headerAccount = accountPlacement === 'header' ? (account ?? connecting) : undefined;
  const note = requesterContextNote(requester);
  return (
    <styled.header
      className={headerSurfaceClassName(headerSurface, headerRadius)}
      data-approval-zone="requester"
      data-header-surface={headerSurface}
    >
      <Flex alignItems="center" gap="space.03">
        {headerAccount ? (
          <HeaderSiteAndAccount
            origin={siteOrigin}
            account={headerAccount}
            note={note}
            isFilledCard={headerSurface === 'card' && containers === 'groups'}
          />
        ) : (
          <HeaderSite origin={siteOrigin} note={note} />
        )}
        {trailing ?? <NetworkChip network={network} />}
      </Flex>
    </styled.header>
  );
}
