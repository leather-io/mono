import { ReactNode } from 'react';
import { Flex, styled } from 'leather-styles/jsx';
import { BasicHoverCard } from './basic-hover-card';
import { content } from '~/data/content';
import { InfoCircleIcon } from '@leather.io/ui';
import { getPostHref } from '~/utils/post-link';
import { getLearnMoreLink } from '~/features/page/page';
import { sanitizeContent } from '~/utils/sanitize-content';

interface PostInfoHoverIconProps {
  postKey: string;
  children: ReactNode;
  iconColor?: 'black' | 'white';
}

export function PostInfoHoverIcon({ postKey, children, iconColor = 'black' }: PostInfoHoverIconProps) {
  const post = (content.posts as Record<string, any>)[postKey];
  if (!post) return <>{children}</>;
  const iconColorToken = iconColor === 'white' ? 'invert' : 'ink.text-subdued';
  const handleIconClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    window.location.assign(getPostHref(post.Slug));
  };
  return (
    <BasicHoverCard align="start" content={
      <styled.span display="block">
        {sanitizeContent(post.Sentence)}
        {getLearnMoreLink(post.Slug, post.Sentence)}
      </styled.span>
    }>
      <Flex alignItems="center" gap="space.02">
        {children}
        <a
          href={getPostHref(post.Slug)}
          target="_blank"
          rel="noopener noreferrer"
          onClick={e => e.stopPropagation()}
          style={{ display: 'inline-flex', color: 'inherit', textDecoration: 'none', cursor: 'pointer' }}
        >
          <InfoCircleIcon variant="small" color={iconColorToken} />
        </a>
      </Flex>
    </BasicHoverCard>
  );
} 