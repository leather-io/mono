import { HStack, Stack, styled } from 'leather-styles/jsx';

import { ArrowRotateRightLeftIcon, Flag } from '@leather.io/ui';

export function ChoosePoolingDuration() {
  return (
    <HStack pt="space.03">
      <Flag img={<ArrowRotateRightLeftIcon />} align="top">
        <Stack gap="space.01">
          <styled.p textStyle="label.03">Indefinite</styled.p>
          <styled.p textStyle="caption.01">
            The pool stacks your STX for up to 12 cycles. You can revoke anytime, but they stay
            locked until the cycle ends. Revoke before restacking to regain access.
          </styled.p>
        </Stack>
      </Flag>
    </HStack>
  );
}
