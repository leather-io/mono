import type { ReactNode } from 'react';

import { Box, Flex, Stack, styled } from 'leather-styles/jsx';

import { Flag } from '@leather.io/ui';

import type { DirectionHeaderProps, DirectionIntentProps } from '../pattern/approval-direction';
import {
  AccountCaption,
  NetworkChip,
  OriginName,
  RequesterAccountPair,
  RequesterIcon,
  requesterContextNote,
} from '../pattern/approval-identity';
import {
  type ApprovalIdentityContext,
  ApprovalIdentityContextMark,
} from '../pattern/approval-identity-context';
import {
  useApprovalHasHeader,
  useApprovalRegisteredIntent,
  useApprovalTitleFocus,
  useRegisterApprovalIntent,
} from '../pattern/approval-shell';

interface HandshakeTitleProps {
  intent: DirectionIntentProps;
  info?: ReactNode;
}

function HandshakeTitle({ intent, info }: HandshakeTitleProps) {
  const titleRef = useApprovalTitleFocus();
  return (
    <Stack gap="space.03" data-approval-zone="intent">
      {intent.icon && <Box lineHeight={0}>{intent.icon}</Box>}
      <Stack gap="space.01" minWidth={0}>
        <Flex alignItems="flex-start" justifyContent="space-between" gap="space.03">
          <styled.h1
            ref={titleRef}
            tabIndex={-1}
            outline="none"
            textStyle="heading.03"
            flex="1"
            minWidth={0}
          >
            {intent.title}
          </styled.h1>
          {info && (
            <Flex flexShrink={0} pt="space.02">
              {info}
            </Flex>
          )}
        </Flex>
        {intent.kind && (
          <styled.p
            textStyle="caption.01"
            color="ink.text-subdued"
            overflowWrap="anywhere"
            textWrapStyle="pretty"
          >
            {intent.kind}
          </styled.p>
        )}
      </Stack>
    </Stack>
  );
}

interface HeaderOriginProps {
  origin: string;
  context?: ApprovalIdentityContext;
}

function HeaderOrigin({ origin, context }: HeaderOriginProps) {
  return (
    <Flex alignItems="center" gap="space.01" minWidth={0}>
      <Box minWidth={0} textStyle="label.02" overflow="hidden">
        <OriginName origin={origin} />
      </Box>
      {context && <ApprovalIdentityContextMark context={context} />}
    </Flex>
  );
}

export function HandshakeHeader({
  requester,
  network,
  account,
  connecting,
  trailing,
}: DirectionHeaderProps) {
  const intent = useApprovalRegisteredIntent();
  const siteOrigin = requester.frameOrigin ?? requester.origin;
  const pairAccount = account ?? connecting;
  const note = requesterContextNote(requester, { includeConnection: !connecting });
  const info = trailing ?? <NetworkChip network={network} />;
  return (
    <styled.header
      px="space.05"
      pt="space.04"
      pb="space.05"
      position="relative"
      bg="ink.background-primary"
      data-approval-zone="requester"
    >
      <Flex alignItems="center" justifyContent="space-between" gap="space.03">
        <Flag
          spacing="space.02"
          align="middle"
          flex="1"
          minWidth={0}
          img={
            pairAccount ? (
              <RequesterAccountPair origin={siteOrigin} account={pairAccount} />
            ) : (
              <RequesterIcon origin={siteOrigin} size={32} />
            )
          }
        >
          <Stack gap="0" minWidth={0}>
            <HeaderOrigin origin={siteOrigin} context={requester.context} />
            {pairAccount && <AccountCaption account={pairAccount} />}
            {note && (
              <styled.span textStyle="caption.01" color="ink.text-subdued" truncate>
                {note}
              </styled.span>
            )}
          </Stack>
        </Flag>
        <Flex flexShrink={0}>{info}</Flex>
      </Flex>
      {intent && (
        <Box mt="space.05">
          <HandshakeTitle intent={intent} />
        </Box>
      )}
    </styled.header>
  );
}

export function HandshakeIntent(props: DirectionIntentProps) {
  useRegisterApprovalIntent(props);
  const hasHeader = useApprovalHasHeader();
  if (hasHeader) return null;
  return (
    <Box px="space.05" pt="space.04" pb="space.03">
      <HandshakeTitle intent={props} />
    </Box>
  );
}
