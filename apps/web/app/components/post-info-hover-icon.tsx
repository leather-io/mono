import { ReactNode } from 'react';

import { Flex, styled } from 'leather-styles/jsx';
import type { Post } from '~/data/post-types';
import { LearnMoreLink } from '~/features/page/page';
import { getPostHref } from '~/utils/post-link';
import { sanitizeContent } from '~/utils/sanitize-content';

import { InfoCircleIcon } from '@leather.io/ui';

import { BasicHoverCard } from './basic-hover-card';

interface PostInfoHoverIconProps {
  post: Post | undefined;
  children: ReactNode;
  iconColor?: 'black' | 'white';
}

/**
 * Displays content with a hover icon to show additional information about a post
 */
export function PostInfoHoverIcon({ post, children, iconColor = 'black' }: PostInfoHoverIconProps) {
  if (!post) return children;

  const iconColorToken = iconColor === 'white' ? 'invert' : 'ink.text-subdued';

  /**
   * Handle click on the info icon button
   * Navigates to the same URL as the "Learn more" link in the tooltip
   */
  function handleIconClick(e: React.MouseEvent): void {
    e.stopPropagation();
    if (post && post.slug) {
      const isUrl = /^https?:\/\//.test(post.slug);
      const href = isUrl ? post.slug : getPostHref(post.slug);

      window.location.href = href;
    }
  }

  return (
    <BasicHoverCard
      align="start"
      content={
        <styled.span display="block">
          {sanitizeContent(post.sentence)}
          <LearnMoreLink destination={post.slug} precedingText={post.sentence} />
        </styled.span>
      }
    >
      <Flex alignItems="center" gap="space.02">
        {children}
        <styled.button
          onClick={handleIconClick}
          display="inline-flex"
          color="inherit"
          textDecoration="none"
          cursor="pointer"
          bg="transparent"
          border="none"
          p="0"
        >
          <InfoCircleIcon variant="small" color={iconColorToken} />
        </styled.button>
      </Flex>
    </BasicHoverCard>
  );
}
