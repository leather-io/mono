import { HStack, Stack, styled } from 'leather-styles/jsx';
import { stackingContent } from '~/content/stacking-content';

import { ArrowRotateRightLeftIcon, Flag } from '@leather.io/ui';

export function ChoosePoolingDuration() {
  const { choosingPoolingDuration } = stackingContent;

  return (
    <HStack pt="space.03">
      <Flag img={<ArrowRotateRightLeftIcon />} align="top">
        <Stack gap="space.01">
          <styled.p textStyle="label.03">{choosingPoolingDuration.title}</styled.p>
          <styled.p textStyle="caption.01">{choosingPoolingDuration.sentence}</styled.p>
        </Stack>
      </Flag>
    </HStack>
  );
}
