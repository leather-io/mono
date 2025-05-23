import { ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';

import { Flex, styled } from 'leather-styles/jsx';
import type { Post } from '~/data/post-types';
import { getLearnMoreLink } from '~/features/page/page';
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
  const navigate = useNavigate();

  if (!post) return children;

  const iconColorToken = iconColor === 'white' ? 'invert' : 'ink.text-subdued';

  function handleIconClick(e: React.MouseEvent): void {
    e.stopPropagation();
    void navigate(getPostHref(post!.slug));
  }

  return (
    <BasicHoverCard
      align="start"
      content={
        <styled.span display="block">
          {sanitizeContent(post.sentence)}
          {getLearnMoreLink(post.slug, post.sentence)}
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
