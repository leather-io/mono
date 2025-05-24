import { ReactNode } from 'react';

import { BoxProps } from '@shopify/restyle';

import { Theme } from '../../../theme-native';
import { Box } from '../../box/box.native';
import { useRegisterApproverChild } from '../approver-context.shared';

export function ApproverSection(
  props: BoxProps<Theme> & { children: ReactNode; noTopPadding?: boolean }
) {
  useRegisterApproverChild('section');
  return (
    <Box
      px="5"
      py="4"
      mt={props.noTopPadding ? '0' : '3'}
      gap="2"
      backgroundColor="ink.background-primary"
      {...props}
    />
  );
}
