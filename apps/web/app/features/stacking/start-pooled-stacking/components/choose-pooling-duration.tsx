import { HStack, Stack, styled } from 'leather-styles/jsx';
import { ArrowRotateRightLeftIcon, Flag } from '@leather.io/ui';
import { getPostBySlug } from '~/utils/post-utils';

export function ChoosePoolingDuration() {
  const post = getPostBySlug('choose-pooling-duration');
  return (
    <HStack pt="space.03">
      <Flag img={<ArrowRotateRightLeftIcon />} align="top">
        <Stack gap="space.01">
          <styled.p textStyle="label.03">{post?.Title}</styled.p>
          <styled.p textStyle="caption.01">{post?.Sentence}</styled.p>
        </Stack>
      </Flag>
    </HStack>
  );
}
