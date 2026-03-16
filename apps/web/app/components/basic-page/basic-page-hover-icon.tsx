import { ReactNode } from 'react';

import { Flex, styled } from 'leather-styles/jsx';
import { LearnMoreLink } from '~/layouts/page/page';
import { getPostHref } from '~/utils/post-link';
import { sanitizeContent } from '~/utils/sanitize-content';

import { InfoCircleIcon } from '@leather.io/ui';

import { BasicHoverCard } from '../basic-hover-card';

interface BasicPageHoverIconProps {
  children: ReactNode;
  iconColor?: 'black' | 'white';
  slug: string;
  description: string;
}

export function BasicPageHoverIcon({
  children,
  slug,
  description,
  iconColor = 'black',
}: BasicPageHoverIconProps) {
  const iconColorToken = iconColor === 'white' ? 'invert' : 'ink.text-subdued-primary';

  /**
   * Handle click on the info icon button
   * Navigates to the same URL as the "Learn more" link in the tooltip
   */
  function handleIconClick(e: React.MouseEvent): void {
    e.stopPropagation();
    if (slug) {
      const isUrl = URL.canParse(slug);
      const href = isUrl ? slug : getPostHref(slug);

      window.location.href = href;
    }
  }

  return (
    <BasicHoverCard
      align="start"
      content={
        <styled.span display="block">
          {sanitizeContent(description)}
          <LearnMoreLink destination={slug} />
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
