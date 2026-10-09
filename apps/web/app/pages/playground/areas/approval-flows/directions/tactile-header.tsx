import { Box, Flex, Stack, styled } from 'leather-styles/jsx';

import type { DirectionHeaderProps, DirectionIntentProps } from '../pattern/approval-direction';
import {
  AccountCaption,
  OriginName,
  RequesterIcon,
  requesterContextNote,
} from '../pattern/approval-identity';
import { useApprovalOptions } from '../pattern/approval-options';
import { useApprovalTitleFocus } from '../pattern/approval-shell';
import type { ApprovalNetwork } from '../pattern/approval-types';

const pillHeight = '40px';
const faviconSize = 28;

interface TactileNetworkProps {
  network: ApprovalNetwork;
}

function TactileNetwork({ network }: TactileNetworkProps) {
  const { networkLabel } = useApprovalOptions();
  const isMainnet = network.id === 'mainnet';
  if (isMainnet && networkLabel === 'non-mainnet') return null;
  if (isMainnet) {
    return (
      <styled.span textStyle="label.03" color="ink.text-subdued" flexShrink={0} px="space.02">
        {network.name}
      </styled.span>
    );
  }
  return (
    <Flex
      alignItems="center"
      height={pillHeight}
      px="space.04"
      flexShrink={0}
      borderRadius="round"
      borderWidth={1}
      borderColor="yellow.border"
      bg="yellow.background-primary"
      textStyle="label.03"
      color="yellow.action-primary-default"
      data-approval-zone="network"
    >
      {network.name}
    </Flex>
  );
}

export function TactileHeader({ requester, network, account, trailing }: DirectionHeaderProps) {
  const { accountPlacement } = useApprovalOptions();
  const siteOrigin = requester.frameOrigin ?? requester.origin;
  const headerAccount = accountPlacement === 'header' ? account : undefined;
  const note = requesterContextNote(requester);
  return (
    <styled.header px="space.04" pt="space.03" data-approval-zone="requester">
      <Flex alignItems="center" gap="space.02">
        <Flex
          flex="1"
          minWidth={0}
          alignItems="center"
          gap="space.02"
          height={pillHeight}
          pl="6px"
          pr="space.04"
          borderRadius="round"
          bg="ink.component-background-default"
        >
          <Box flexShrink={0} lineHeight={0} borderRadius="round" overflow="hidden">
            <RequesterIcon origin={siteOrigin} size={faviconSize} />
          </Box>
          <Stack gap="0" flex="1" minWidth={0}>
            <OriginName origin={siteOrigin} />
            {note && (
              <styled.span textStyle="caption.02" color="ink.text-subdued" truncate>
                {note}
              </styled.span>
            )}
          </Stack>
        </Flex>
        {trailing ?? <TactileNetwork network={network} />}
      </Flex>
      {headerAccount && (
        <Flex pt="space.02" minWidth={0}>
          <AccountCaption account={headerAccount} />
        </Flex>
      )}
    </styled.header>
  );
}

export function TactileIntent({ title, kind, icon }: DirectionIntentProps) {
  const titleRef = useApprovalTitleFocus();
  return (
    <Stack gap="space.02" px="space.05" pt="space.05" pb="space.03" data-approval-zone="intent">
      {icon && <Box lineHeight={0}>{icon}</Box>}
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
        <styled.p textStyle="caption.01" color="ink.text-subdued" overflowWrap="anywhere">
          {kind}
        </styled.p>
      )}
    </Stack>
  );
}
