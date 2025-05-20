import { HStack, Stack, styled } from 'leather-styles/jsx';
import { getPosts } from '~/utils/post-utils';

import { ArrowRotateRightLeftIcon, Flag } from '@leather.io/ui';

export function ChoosePoolingDuration() {
  const posts = getPosts();
  const post = posts.choosingPoolingDuration;

  return (
    <HStack pt="space.03">
      <Flag img={<ArrowRotateRightLeftIcon />} align="top">
        <Stack gap="space.01">
          <styled.p textStyle="label.03">{post?.title || 'Indefinite'}</styled.p>
          <styled.p textStyle="caption.01">
            {post?.sentence ||
              'The pool commits your STX for up to 12 cycles, with approximately two weeks per cycle.'}
          </styled.p>
        </Stack>
      </Flag>
    </HStack>
  );
}
