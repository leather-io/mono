import { Flex, Stack, styled } from 'leather-styles/jsx';

import exchangeIcons from '@leather.io/ui/assets/images/exchange-icons.png';

export function FirstTokenBanner() {
  return (
    <Flex alignItems="center" gap="space.04">
      <Stack gap="space.01" flex="1">
        <styled.h3 textStyle="label.01" margin="0">
          Get your first token
        </styled.h3>
        <styled.p textStyle="caption.01" color="ink.text-subdued" margin="0">
          Fund your wallet by buying tokens or transferring from another account.
        </styled.p>
      </Stack>
      <styled.img
        src={exchangeIcons}
        alt="Exchange icons"
        width="80px"
        height="48px"
        objectFit="cover"
        flexShrink={0}
      />
    </Flex>
  );
}
