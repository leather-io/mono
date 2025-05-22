import { ReactNode } from 'react';

import { BoxProps } from '@shopify/restyle';

import { Theme } from '../../../theme-native';
import { Box } from '../../box/box.native';
import { useRegisterApproverChild } from '../approver-context.shared';

interface ApproverSectionProps extends BoxProps<Theme> {
  children: ReactNode;
  noTopPadding?: boolean;
  borderTop?: boolean;
}
export function ApproverSection(props: ApproverSectionProps) {
  useRegisterApproverChild('section');
  return (
    <Box
      px="5"
      py="4"
      mt={props.noTopPadding ? '0' : '3'}
      gap="2"
      backgroundColor="ink.background-primary"
      borderTopColor="ink.border-transparent"
      borderTopWidth={props.borderTop ? 1 : 0}
      {...props}
    />
  );
}
