import { Component, forwardRef } from 'react';

import Folder from '../../assets/icons/account-avatars/folder-24-24.svg';
import { Icon, IconProps } from '../icon/icon.native';

export const FolderIcon = forwardRef<Component, IconProps>(({ variant, ...props }, ref) => {
  return (
    <Icon ref={ref} {...props}>
      <Folder />
    </Icon>
  );
});
