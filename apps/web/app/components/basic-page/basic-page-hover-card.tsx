import { ReactElement } from 'react';

import { type HTMLStyledProps, styled } from 'leather-styles/jsx';
import { sanitizeContent } from '~/utils/sanitize-content';

import { BasicPageHoverIcon } from './basic-page-hover-icon';

type TextStyleType = NonNullable<HTMLStyledProps<'span'>['textStyle']>;

interface BasicPageHoverCardProps {
  label?: string;
  title: string;
  slug: string;
  description: string;
  textStyle?: TextStyleType;
}

export function BasicPageHoverCard({
  label,
  textStyle = 'label.01',
  slug,
  description,
  title,
}: BasicPageHoverCardProps): ReactElement | null {
  return (
    <BasicPageHoverIcon slug={slug} description={description}>
      <styled.span textStyle={textStyle}>{sanitizeContent(String(label ?? title))}</styled.span>
    </BasicPageHoverIcon>
  );
}
