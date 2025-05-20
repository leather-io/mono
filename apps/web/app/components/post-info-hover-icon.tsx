import { ReactNode } from 'react';
import { Flex, styled } from 'leather-styles/jsx';
import { BasicHoverCard } from './basic-hover-card';
import { content } from '~/data/content';
import { InfoCircleIcon } from '@leather.io/ui';
import { getPostHref } from '~/utils/post-link';
import { getLearnMoreLink } from '~/features/page/page';
import { sanitizeContent } from '~/utils/sanitize-content';
import { useNavigate } from 'react-router-dom';
import type { PostsCollection } from '~/data/post-types';

interface PostInfoHoverIconProps {
  postKey: string;
  children: ReactNode;
  iconColor?: 'black' | 'white';
}

export function PostInfoHoverIcon({ postKey, children, iconColor = 'black' }: PostInfoHoverIconProps) {
  const post = (content.posts as unknown as PostsCollection)[postKey];
  const navigate = useNavigate();
  if (!post) return <>{children}</>;
  const iconColorToken = iconColor === 'white' ? 'invert' : 'ink.text-subdued';
  const handleIconClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigate(getPostHref(post.slug));
  };
  return (
    <BasicHoverCard align="start" content={
      <styled.span display="block">
        {sanitizeContent(post.sentence)}
        {getLearnMoreLink(post.slug, post.sentence)}
      </styled.span>
    }>
      <Flex alignItems="center" gap="space.02">
        {children}
        <a
          href={getPostHref(post.slug)}
          rel="noopener noreferrer"
          onClick={handleIconClick}
          style={{ display: 'inline-flex', color: 'inherit', textDecoration: 'none', cursor: 'pointer' }}
        >
          <InfoCircleIcon variant="small" color={iconColorToken} />
        </a>
      </Flex>
    </BasicHoverCard>
  );
} 