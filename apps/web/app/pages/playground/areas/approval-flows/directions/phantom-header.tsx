import { Flex, Stack, styled } from 'leather-styles/jsx';

import { Badge } from '@leather.io/ui';

import type { DirectionHeaderProps, DirectionIntentProps } from '../pattern/approval-direction';
import {
  AccountCaption,
  OriginName,
  RequesterAccountPair,
  RequesterIcon,
  requesterContextNote,
} from '../pattern/approval-identity';
import { useApprovalOptions } from '../pattern/approval-options';
import { useApprovalTitleFocus } from '../pattern/approval-shell';
import type { ApprovalNetwork } from '../pattern/approval-types';

interface NetworkPillProps {
  network: ApprovalNetwork;
}

function NetworkPill({ network }: NetworkPillProps) {
  const { networkLabel } = useApprovalOptions();
  const isMainnet = network.id === 'mainnet';
  if (isMainnet && networkLabel === 'non-mainnet') return null;
  if (isMainnet) {
    return (
      <styled.span
        textStyle="caption.01"
        color="ink.text-subdued"
        px="space.02"
        borderRadius="round"
        bg="ink.component-background-default"
        flexShrink={0}
      >
        {network.name}
      </styled.span>
    );
  }
  return <Badge label={network.name} variant="warning" flexShrink={0} />;
}

export function PhantomHeader({ requester, network, account, trailing }: DirectionHeaderProps) {
  const { accountPlacement } = useApprovalOptions();
  const siteOrigin = requester.frameOrigin ?? requester.origin;
  const headerAccount = accountPlacement === 'header' ? account : undefined;
  const note = requesterContextNote(requester);
  return (
    <styled.header px="space.05" pt="space.03" data-approval-zone="requester">
      <Flex alignItems="center" justifyContent="flex-end" gap="space.03" minHeight="24px">
        {trailing ?? <NetworkPill network={network} />}
      </Flex>
      <Stack alignItems="center" gap="space.02" pt="space.01">
        {headerAccount ? (
          <RequesterAccountPair origin={siteOrigin} account={headerAccount} size="xl" />
        ) : (
          <RequesterIcon origin={siteOrigin} size={56} />
        )}
        <Stack alignItems="center" gap="0" width="100%" textAlign="center">
          <OriginName origin={siteOrigin} align="center" />
          {headerAccount && (
            <Flex justifyContent="center" maxWidth="100%" minWidth={0}>
              <AccountCaption account={headerAccount} />
            </Flex>
          )}
          {note && (
            <styled.span textStyle="caption.01" color="ink.text-subdued">
              {note}
            </styled.span>
          )}
        </Stack>
      </Stack>
    </styled.header>
  );
}

export function PhantomIntent({ title, kind, icon }: DirectionIntentProps) {
  const titleRef = useApprovalTitleFocus();
  return (
    <Stack
      alignItems="center"
      gap="space.02"
      px="space.05"
      pt="space.04"
      pb="space.04"
      textAlign="center"
      data-approval-zone="intent"
    >
      {icon && (
        <Flex justifyContent="center" lineHeight={0}>
          {icon}
        </Flex>
      )}
      <styled.h1
        ref={titleRef}
        tabIndex={-1}
        outline="none"
        textStyle="heading.05"
        color="ink.text-primary"
        textWrap="balance"
      >
        {title}
      </styled.h1>
      {kind && (
        <styled.p
          textStyle="caption.01"
          color="ink.text-subdued"
          overflowWrap="anywhere"
          textWrap="balance"
        >
          {kind}
        </styled.p>
      )}
    </Stack>
  );
}
