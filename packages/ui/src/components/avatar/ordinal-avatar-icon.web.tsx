import { styled } from 'leather-styles/jsx';

import { Avatar, type AvatarProps } from './avatar.web';

export function OrdinalAvatarIcon(props: AvatarProps) {
  return (
    <Avatar
      outlineColor="ink.border-transparent"
      icon={
        <styled.svg width="100%" height="100%" viewBox="0 0 32 32" fill="none">
          <circle cx="16" cy="16" r="16" fill="#0C0C0D" />
          <circle cx="16" cy="16" r="12" fill="white" />
          <circle cx="16" cy="16" r="6" fill="#0C0C0D" />
        </styled.svg>
      }
      {...props}
    />
  );
}
