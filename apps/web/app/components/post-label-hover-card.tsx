import { ReactNode, ReactElement, Fragment } from 'react';
import type { JSX } from 'react';
import { Flex, styled } from 'leather-styles/jsx';
import { PostInfoHoverIcon } from './post-info-hover-icon';
import { sanitizeContent } from '~/utils/sanitize-content';
import type { Post } from '~/data/post-types';
import { TextElementTag, isValidTextElementTag } from '~/shared/types';
import { getPosts } from '~/utils/post-utils';

interface PostLabelHoverCardProps {
  post: Post | undefined;
  label?: string;
  textStyle?: string;
  tagName?: TextElementTag;
}

/**
 * Displays a label with hover functionality showing more information about a post
 */
export function PostLabelHoverCard({ 
  post,
  label, 
  textStyle = 'label.01', 
  tagName = 'span' 
}: PostLabelHoverCardProps): ReactElement {
  if (!post) return <Fragment />;
  
  if (!isValidTextElementTag(tagName)) {
    console.warn(`Invalid tag name: ${tagName}. Falling back to span.`);
    tagName = 'span';
  }
  
  const Tag = styled[tagName];
  return (
    <PostInfoHoverIcon post={post}>
      <Tag textStyle={textStyle}>{sanitizeContent(String(label ?? post.title))}</Tag>
    </PostInfoHoverIcon>
  );
} 