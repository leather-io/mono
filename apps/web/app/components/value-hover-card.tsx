import { ReactNode } from 'react';

import { Flex, styled } from 'leather-styles/jsx';
import { LearnArticle } from '~/content/learn-content';
import { sanitizeContent } from '~/utils/sanitize-content';

import { isString } from '@leather.io/utils';

import { LearnInfoHoverIcon } from './learn-info-hover-icon';

interface ValueHoverCardProps {
  label: string;
  value: ReactNode;
  article?: LearnArticle;
  showIcon?: boolean;
  iconColor?: 'black' | 'white';
}

export function ValueHoverCard({
  label,
  value,
  article,
  showIcon = true,
  iconColor = 'black',
}: ValueHoverCardProps) {
  const labelElement = <styled.span textStyle="label.01">{sanitizeContent(label)}</styled.span>;

  return (
    <Flex flexDir="column">
      {showIcon && article ? (
        <LearnInfoHoverIcon article={article} iconColor={iconColor}>
          {labelElement}
        </LearnInfoHoverIcon>
      ) : (
        labelElement
      )}
      {isString(value) ? (
        <styled.span textStyle="heading.02">{sanitizeContent(value)}</styled.span>
      ) : (
        <styled.span textStyle="heading.02">{value}</styled.span>
      )}
    </Flex>
  );
}
