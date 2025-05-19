import { HStack, Stack, styled } from 'leather-styles/jsx';

import { ArrowRotateRightLeftIcon, Flag } from '@leather.io/ui';

export function ChoosePoolingDuration() {
  return (
    <HStack pt="space.03">
      <Flag img={<ArrowRotateRightLeftIcon />} align="top">
        <Stack gap="space.01">
          <styled.p textStyle="label.03">Indefinite</styled.p>
          <styled.p textStyle="caption.01">
            The pool will commit your STX for Stacking for up to 12 cycles (with about two weeks per cycle). You can revoke anytime, but they stay
            locked until the pool's commitment ends. Revoke before the pool's next commitment to regain access at the end of the current commitment period.
          </styled.p>
        </Stack>
      </Flag>
    </HStack>
  );
}
