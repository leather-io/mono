import { Component, forwardRef } from 'react';
import { SvgProps } from 'react-native-svg';

import Folder from '../../assets/icons/account-avatars/folder-24-24.svg';
import { Icon } from '../icon/icon.native';

export const FolderIcon = forwardRef<Component, SvgProps>((props, ref) => {
  return (
    <Icon ref={ref} {...props}>
      <Folder />
    </Icon>
  );
});

FolderIcon.displayName = 'FolderIcon';
