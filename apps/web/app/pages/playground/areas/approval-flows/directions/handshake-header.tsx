import type { ReactNode } from 'react';

import { Box, Flex, Stack, styled } from 'leather-styles/jsx';

import { Flag, InfoCircleIcon, Popover } from '@leather.io/ui';

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
  ApprovalTitle,
  useApprovalHasHeader,
  useApprovalRegisteredIntent,
  useRegisterApprovalIntent,
} from '../pattern/approval-shell';

interface HandshakeTitleProps {
  intent: DirectionIntentProps;
  info?: ReactNode;
}

function HandshakeTitle({ intent, info }: HandshakeTitleProps) {
  return (
    <Stack gap="space.03" data-approval-zone="intent">
      {intent.icon && <Box lineHeight={0}>{intent.icon}</Box>}
      <Stack gap="space.01" minWidth={0}>
        <Flex alignItems="flex-start" justifyContent="space-between" gap="space.03">
          <Box flex="1" minWidth={0}>
            <ApprovalTitle title={intent.title} />
          </Box>
          {info && (
            <Flex flexShrink={0} pt="space.02">
              {info}
            </Flex>
          )}
        </Flex>
      </Stack>
    </Stack>
  );
}

interface HeaderOriginProps {
  origin: string;
  isInternal?: boolean;
  context?: ApprovalIdentityContext;
  note?: string;
}

function HeaderOrigin({ origin, isInternal, context, note }: HeaderOriginProps) {
  return (
    <Flex alignItems="center" gap="space.01" minWidth={0}>
      <Box minWidth={0} textStyle="label.02" overflow="hidden">
        {isInternal ? <styled.span>Leather</styled.span> : <OriginName origin={origin} />}
      </Box>
      {context && <ApprovalIdentityContextMark context={context} />}
      {note && <HeaderConnection note={note} />}
    </Flex>
  );
}

interface HeaderConnectionProps {
  note: string;
}

function HeaderConnection({ note }: HeaderConnectionProps) {
  return (
    <Popover.Root>
      <Popover.Trigger asChild>
        <styled.button
          type="button"
          display="inline-flex"
          alignItems="center"
          justifyContent="center"
          flexShrink={0}
          minWidth="28px"
          minHeight="28px"
          my="-space.01"
          px="space.01"
          borderRadius="xs"
          textStyle="caption.01"
          color="ink.text-subdued"
          cursor="pointer"
          aria-label={`Connection details · ${note}`}
          title={note}
          _hover={{ bg: 'ink.component-background-hover' }}
          _focusVisible={{ outline: '2px solid', outlineColor: 'ink.text-primary' }}
        >
          <InfoCircleIcon variant="small" color="ink.text-subdued" />
        </styled.button>
      </Popover.Trigger>
      <Popover.Portal>
        <Popover.Content
          side="bottom"
          align="start"
          aria-label="Connection details"
          onEscapeKeyDown={event => event.stopPropagation()}
        >
          <Stack gap="space.02" maxWidth="240px">
            <styled.p textStyle="label.03">Connection details</styled.p>
            <styled.p textStyle="caption.01" color="ink.text-subdued" overflowWrap="anywhere">
              {note}
            </styled.p>
            <Popover.Close asChild>
              <styled.button
                type="button"
                textStyle="label.03"
                minHeight="44px"
                alignSelf="flex-start"
                cursor="pointer"
              >
                Close
              </styled.button>
            </Popover.Close>
          </Stack>
        </Popover.Content>
      </Popover.Portal>
    </Popover.Root>
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
            <HeaderOrigin
              origin={siteOrigin}
              isInternal={requester.source === 'internal'}
              context={requester.context}
              note={note}
            />
            {pairAccount && <AccountCaption account={pairAccount} />}
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
