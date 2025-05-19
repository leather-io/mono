import { ReactNode } from 'react';
import { Flex, styled } from 'leather-styles/jsx';
import { PostInfoHoverIcon } from './post-info-hover-icon';
import { content } from '~/data/content';
import { sanitizeContent } from '~/utils/sanitize-content';
import type { Post } from '~/data/post-types';

interface PostValueHoverCardProps {
  postKey: string;
  value: ReactNode;
  label?: string;
}

export function PostValueHoverCard({ postKey, value, label }: PostValueHoverCardProps) {
  const post = (content.posts as Record<string, Post>)[postKey];
  if (!post) return null;
  return (
    <Flex flexDir="column">
      <PostInfoHoverIcon postKey={postKey}>
        <styled.span textStyle="label.01">{sanitizeContent(label ?? post.Title)}</styled.span>
      </PostInfoHoverIcon>
      {typeof value === 'string' ? (
        <styled.span textStyle="heading.02">{sanitizeContent(value)}</styled.span>
      ) : (
      <styled.span textStyle="heading.02">{value}</styled.span>
      )}
    </Flex>
  );
} 