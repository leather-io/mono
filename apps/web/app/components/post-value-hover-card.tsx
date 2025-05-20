import { ReactNode } from 'react';

import { Flex, styled } from 'leather-styles/jsx';
import { content } from '~/data/content';
import type { Post } from '~/data/post-types';
import { sanitizeContent } from '~/utils/sanitize-content';

import { isString } from '@leather.io/utils';

import { PostInfoHoverIcon } from './post-info-hover-icon';

interface PostValueHoverCardProps {
  postKey?: string;
  post?: Post;
  value: ReactNode;
  label?: string;
}

export function PostValueHoverCard({
  postKey,
  post: propPost,
  value,
  label,
}: PostValueHoverCardProps) {
  let post = propPost;

  if (!post && postKey) {
    post = content.posts[postKey];
  }

  if (!post) return null;

  return (
    <Flex flexDir="column">
      <PostInfoHoverIcon post={post}>
        <styled.span textStyle="label.01">{sanitizeContent(label ?? post.title)}</styled.span>
      </PostInfoHoverIcon>
      {isString(value) ? (
        <styled.span textStyle="heading.02">{sanitizeContent(value)}</styled.span>
      ) : (
        <styled.span textStyle="heading.02">{value}</styled.span>
      )}
    </Flex>
  );
}
