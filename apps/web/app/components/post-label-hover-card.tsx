import { ReactNode } from 'react';
import type { JSX } from 'react';
import { Flex, styled } from 'leather-styles/jsx';
import { PostInfoHoverIcon } from './post-info-hover-icon';
import { content } from '~/data/content';
import React from 'react';
import { sanitizeContent } from '~/utils/sanitize-content';

interface PostLabelHoverCardProps {
  postKey: string;
  label?: string;
  textStyle?: string;
  tagName?: string;
}

export function PostLabelHoverCard({ postKey, label, textStyle = 'label.01', tagName = 'span' }: PostLabelHoverCardProps) {
  const post: any = (content.posts as Record<string, any>)[postKey];
  if (!post) return null;
  const Tag = styled[tagName as keyof typeof styled];
  return (
    <PostInfoHoverIcon postKey={postKey}>
      <Tag textStyle={textStyle}>{sanitizeContent(String(label ?? post.Title))}</Tag>
    </PostInfoHoverIcon>
  );
} 