import { styled } from 'leather-styles/jsx';
import { token } from 'leather-styles/tokens';

import { Avatar, type AvatarProps } from './avatar.web';

export function RunesAvatarIcon(props: AvatarProps) {
  return (
    <Avatar
      outlineColor="ink.border-transparent"
      icon={
        <styled.svg width="100%" height="100%" viewBox="0 0 32 32" fill="none">
          <rect width="32" height="32" rx="16" fill={token('colors.ink.background-primary')} />
          <rect width="32" height="32" fill={token('colors.ink.action-primary-default')} />
          <rect x="4" y="4" width="24" height="24" fill={token('colors.ink.background-primary')} />
          <rect
            x="10"
            y="10"
            width="12"
            height="12"
            fill={token('colors.ink.action-primary-default')}
          />{' '}
        </styled.svg>
      }
      {...props}
    />
  );
}
