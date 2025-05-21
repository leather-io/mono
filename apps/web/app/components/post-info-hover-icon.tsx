import { ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';

import { InfoCircleIcon } from '@leather.io/ui';
import { Flex, styled } from 'leather-styles/jsx';

import { BasicHoverCard } from './basic-hover-card';
import type { Post } from '~/data/post-types';
import { getLearnMoreLink } from '~/features/page/page';
import { sanitizeContent } from '~/utils/sanitize-content';
import { getPostHref } from '~/utils/post-link';

interface PostInfoHoverIconProps {
  post: Post | undefined;
  children: ReactNode;
  iconColor?: 'black' | 'white';
}

/**
 * Displays content with a hover icon to show additional information about a post
 */
export function PostInfoHoverIcon({ post, children, iconColor = 'black' }: PostInfoHoverIconProps) {
  const navigate = useNavigate();
  
  if (!post) return children;
  
  const iconColorToken = iconColor === 'white' ? 'invert' : 'ink.text-subdued';
  
  function handleIconClick(e: React.MouseEvent): void {
    e.stopPropagation();
    void navigate(getPostHref(post!.slug));
  }
  
  return (
    <BasicHoverCard align="start" content={
      <styled.span display="block">
        {sanitizeContent(post.sentence)}
        {getLearnMoreLink(post.slug, post.sentence)}
      </styled.span>
    }>
      <Flex alignItems="center" gap="space.02">
        {children}
        <styled.a
          href={getPostHref(post.slug)}
          rel="noopener noreferrer"
          onClick={handleIconClick}
          display="inline-flex"
          color="inherit"
          textDecoration="none"
          cursor="pointer"
        >
          <InfoCircleIcon variant="small" color={iconColorToken} />
        </styled.a>
      </Flex>
    </BasicHoverCard>
  );
} 