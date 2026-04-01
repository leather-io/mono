import { type ReactNode } from 'react';
import { useNavigate } from 'react-router';

import { Flex, styled } from 'leather-styles/jsx';
import { LearnArticle } from '~/content/learn-content';
import { LearnMoreLink } from '~/layouts/page/page';
import { sanitizeContent } from '~/utils/sanitize-content';

import { HoverCard, InfoCircleIcon } from '@leather.io/ui';

type SupportedTags = 'h1' | 'h2' | 'h3' | 'h4' | 'span';

interface LearnHoverCardProps {
  article?: LearnArticle;
  label: string;
  textStyle?: string;
  tagName?: SupportedTags;
  children?: ReactNode;
  showIcon?: boolean;
  iconColor?: 'black' | 'white';
  align?: 'start' | 'center' | 'end';
}

export function LearnHoverCard({
  article,
  label,
  textStyle = 'label.01',
  tagName = 'span',
  children,
  showIcon = true,
  iconColor = 'black',
  align = 'center',
}: LearnHoverCardProps) {
  const navigate = useNavigate();
  const iconColorToken = iconColor === 'white' ? 'invert' : 'ink.text-subdued';

  const StyledTag = styled[tagName];

  function renderLabel(withUnderline = false) {
    const props = withUnderline
      ? {
          textStyle,
          textDecoration: 'underline' as const,
          textDecorationStyle: 'dotted' as const,
          textDecorationColor: 'ink.border-default',
          textUnderlineOffset: '2px',
          cursor: 'help' as const,
        }
      : { textStyle };

    return <StyledTag {...props}>{label}</StyledTag>;
  }

  /**
   * Handle click on the info icon button
   * Navigates to the same URL as the "Learn more" link in the tooltip
   */
  function handleIconClick(e: React.MouseEvent): void {
    e.stopPropagation();
    if (article?.slug) {
      void navigate(`/support/${article.slug}`);
    }
  }

  if (!article) {
    return renderLabel();
  }

  const trigger = showIcon ? (
    <Flex alignItems="center" gap="space.02">
      {renderLabel()}
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
  ) : (
    renderLabel(true)
  );

  return (
    <HoverCard.Root openDelay={220}>
      <HoverCard.Trigger asChild={showIcon}>{trigger}</HoverCard.Trigger>
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
            {children}
          </Flex>
        </HoverCard.Content>
      </HoverCard.Portal>
    </HoverCard.Root>
  );
}
