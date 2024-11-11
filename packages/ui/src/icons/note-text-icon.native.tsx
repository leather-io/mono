import { Component, forwardRef } from 'react';

import NoteTextSmall from '../assets/icons/note-text-16-16.svg';
import NoteText from '../assets/icons/note-text-24-24.svg';
import { Icon, IconProps } from './icon/icon.native';

export const NoteTextIcon = forwardRef<Component, IconProps>(({ variant, ...props }, ref) => {
  if (variant === 'small')
    return (
      <Icon ref={ref} {...props}>
        <NoteTextSmall />
      </Icon>
    );
  return (
    <Icon ref={ref} {...props}>
      <NoteText />
    </Icon>
  );
});
