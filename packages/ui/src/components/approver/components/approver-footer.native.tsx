import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useTheme } from '@shopify/restyle';
import { Box, Theme } from 'native';
import { HasChildren } from 'src/utils/has-children.shared';

import { useApproverContext, useRegisterApproverChild } from '../approver-context.shared';

export function ApproverFooter({ children }: HasChildren) {
  const { bottom } = useSafeAreaInsets();
  const { setActionBarHeight } = useApproverContext();
  useRegisterApproverChild('actions');
  const theme = useTheme<Theme>();
  return (
    <Box
      onLayout={event => {
        setActionBarHeight(event.nativeEvent.layout.height);
      }}
      position="absolute"
      bottom={0}
      left={0}
      right={0}
      backgroundColor="ink.background-primary"
      borderTopColor="ink.border-transparent"
      borderTopWidth={1}
      pt="5"
      px="5"
      gap="4"
      style={{ paddingBottom: bottom + theme.spacing['5'] }}
    >
      {children}
    </Box>
  );
}
