import { ReactNode } from 'react';

import { Flex, styled } from 'leather-styles/jsx';
import { LearnArticle } from '~/content/learn-content';
import { sanitizeContent } from '~/utils/sanitize-content';

import { isString } from '@leather.io/utils';

import { LearnHoverCard } from './learn-hover-card';

interface ValueHoverCardProps {
  label: string;
  value: ReactNode;
  article?: LearnArticle;
  showIcon?: boolean;
}

export function ValueHoverCard({ label, value, article, showIcon = true }: ValueHoverCardProps) {
  const labelElement = <styled.span textStyle="label.01">{sanitizeContent(label)}</styled.span>;

  return (
    <Flex flexDir="column">
      {showIcon && article ? (
        <LearnHoverCard article={article} label={sanitizeContent(label)} />
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
