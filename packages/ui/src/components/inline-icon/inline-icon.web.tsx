import type { ComponentType } from 'react';

import { type HTMLStyledProps, styled } from 'leather-styles/jsx';

import type { IconProps } from '../../icons/icon/create-icon.web';

const tones = {
  inherit: 'inherit',
  secondary: 'ink.text-secondary',
  subdued: 'ink.text-subdued',
} as const;

export interface InlineIconProps extends Omit<HTMLStyledProps<'span'>, 'color'> {
  icon: ComponentType<IconProps>;
  tone?: keyof typeof tones;
  size?: 'small' | 'medium';
  placement?: 'start' | 'end';
}

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
