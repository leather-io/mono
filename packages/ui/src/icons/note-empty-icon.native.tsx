import { Component, forwardRef } from 'react';

import NoteEmptySmall from '../assets/icons/note-empty-16-16.svg';
import NoteEmpty from '../assets/icons/note-empty-24-24.svg';
import { Icon, IconProps } from './icon/icon.native';

export const NoteEmptyIcon = forwardRef<Component, IconProps>(({ variant, ...props }, ref) => {
  if (variant === 'small')
    return (
      <Icon ref={ref} {...props}>
        <NoteEmptySmall />
      </Icon>
    );
  return (
    <Icon ref={ref} {...props}>
      <NoteEmpty />
    </Icon>
  );
});

NoteEmptyIcon.displayName = 'NoteEmptyIcon';
