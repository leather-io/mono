import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { BottomSheetScrollView } from '@gorhom/bottom-sheet';
import { useTheme } from '@shopify/restyle';
import { HasChildren } from 'src/utils/has-children.shared';

import { Theme } from '../../../theme-native';
import { Box } from '../../box/box.native';
import { useApproverContext } from '../approver-context.shared';

export function ApproverContainer({ children }: HasChildren) {
  const { top, bottom } = useSafeAreaInsets();
  const theme = useTheme<Theme>();
  const { actionBarHeight } = useApproverContext();

  return (
    <BottomSheetScrollView contentContainerStyle={{ paddingBottom: actionBarHeight }}>
      <Box
        style={{
          marginBottom: theme.spacing[5] + bottom,
          marginTop: theme.spacing[4] + top,
        }}
      >
        {children}
      </Box>
    </BottomSheetScrollView>
  );
}
