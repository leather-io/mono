import { type ReactNode } from 'react';
import { useNavigate } from 'react-router';

import { Flex, styled } from 'leather-styles/jsx';
import { LearnArticle } from '~/content/learn-content';
import { LearnMoreLink } from '~/layouts/page/page';
import { sanitizeContent } from '~/utils/sanitize-content';

import { HoverCard, InfoCircleIcon } from '@leather.io/ui';

interface LearnInfoHoverIconProps {
  article?: LearnArticle;
  children: ReactNode;
  iconColor?: 'black' | 'white';
  align?: 'start' | 'center' | 'end';
}

export function LearnInfoHoverIcon({
  article,
  children,
  iconColor = 'black',
  align = 'center',
}: LearnInfoHoverIconProps) {
  const navigate = useNavigate();
  const iconColorToken = iconColor === 'white' ? 'invert' : 'ink.text-subdued';

  /**
   * Handle click on the info icon button
   * Navigates to the same URL as the "Learn more" link in the tooltip
   */
  function handleIconClick(e: React.MouseEvent): void {
    e.stopPropagation();
    if (article?.slug) {
      void navigate(`/support/guide/${article.slug}`);
    }
  }

  if (!article) {
    return <>{children}</>;
  }

  return (
    <HoverCard.Root openDelay={220}>
      <HoverCard.Trigger asChild>
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
            aria-label={`Learn more about ${article.title}`}
          >
            <InfoCircleIcon variant="small" color={iconColorToken} />
          </styled.button>
        </Flex>
      </HoverCard.Trigger>
      <HoverCard.Portal>
        <HoverCard.Content side="top" align={align}>
          <Flex direction="column" gap="space.03" p="space.04" maxW="320px">
            <styled.h4 textStyle="label.02">{sanitizeContent(article.title)}</styled.h4>
            {article.sentence && (
              <styled.p textStyle="body.02">
                {sanitizeContent(article.sentence)}
                {article.slug && <LearnMoreLink destination={article.slug} />}
              </styled.p>
            )}
          </Flex>
        </HoverCard.Content>
      </HoverCard.Portal>
    </HoverCard.Root>
  );
}
