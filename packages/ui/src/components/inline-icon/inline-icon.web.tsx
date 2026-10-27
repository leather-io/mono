import type { ComponentType } from 'react';

import { type HTMLStyledProps, styled } from 'leather-styles/jsx';

import type { IconProps } from '../../icons/icon/create-icon.web';

// The ink steps an inline icon may take. `inherit` (the default) is the text's
// own colour; the others are lighter steps. There is deliberately no darker
// option: an icon never outweighs the words it sits with.
const tones = {
  inherit: 'inherit',
  secondary: 'ink.text-secondary',
  subdued: 'ink.text-subdued',
} as const;

export interface InlineIconProps extends Omit<HTMLStyledProps<'span'>, 'color'> {
  /** The icon component, not an element: `icon={LockIcon}`. */
  icon: ComponentType<IconProps>;
  /** Same colour as the text (default) or a lighter ink step. Never darker. */
  tone?: keyof typeof tones;
  /** `small` (16px) for body, label and caption text; `medium` (24px) beside headings. */
  size?: 'small' | 'medium';
  /** Which side of the words the icon is on; adds a space.01 gap on the other side. */
  placement?: 'start' | 'end';
}

// An icon inside a run of text: info, lock, chevron, user. Put it inside the
// text element (`<styled.span textStyle="label.02">Locked <InlineIcon … /></styled.span>`)
// and it takes the text's colour through currentColor, and sits centred on the
// text's first line (its box is one line-height tall, 1lh). Prefer it over a
// bare `<LockIcon />` next to text: bare icons default to
// ink.action-primary-default, which is darker than secondary or subdued text.
export function InlineIcon({
  icon: Icon,
  tone = 'inherit',
  size = 'small',
  placement,
  ...rest
}: InlineIconProps) {
  return (
    <styled.span
      display="inline-flex"
      alignItems="center"
      verticalAlign="top"
      flexShrink={0}
      height="1lh"
      color={tones[tone]}
      ml={placement === 'end' ? 'space.01' : undefined}
      mr={placement === 'start' ? 'space.01' : undefined}
      {...rest}
    >
      <Icon variant={size} color="current" aria-hidden />
    </styled.span>
  );
}
