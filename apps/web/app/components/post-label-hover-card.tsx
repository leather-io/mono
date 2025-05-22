import { ReactNode } from 'react';
import type { JSX } from 'react';
import { Flex, styled } from 'leather-styles/jsx';
import { PostInfoHoverIcon } from './post-info-hover-icon';
import { content } from '~/data/content';
import { sanitizeContent } from '~/utils/sanitize-content';
import type { Post } from '~/data/post-types';

interface PostLabelHoverCardProps {
  postKey: string;
  label?: string;
  textStyle?: string;
  tagName?: string;
}

export function PostLabelHoverCard({ postKey, label, textStyle = 'label.01', tagName = 'span' }: PostLabelHoverCardProps) {
  const post: Post | undefined = content.posts[postKey];
  if (!post) return null;
  const Tag = styled[tagName as keyof typeof styled];
  return (
    <PostInfoHoverIcon postKey={postKey}>
      <Tag textStyle={textStyle}>{sanitizeContent(String(label ?? post.title))}</Tag>
    </PostInfoHoverIcon>
  );
} 