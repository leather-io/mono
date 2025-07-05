import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useTheme } from '@shopify/restyle';
import { HasChildren } from 'src/utils/has-children.shared';

import { Theme } from '../../../theme-native';
import { Box } from '../../box/box.native';
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
