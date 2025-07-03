import { BottomSheetScrollView } from '@gorhom/bottom-sheet';
import { useTheme } from '@shopify/restyle';
import { HasChildren } from 'src/utils/has-children.shared';

import { Theme } from '../../../theme-native';

export function ApproverContainer({ children }: HasChildren) {
  const theme = useTheme<Theme>();

  return (
    <BottomSheetScrollView
      contentContainerStyle={{
        backgroundColor: theme.colors['ink.background-secondary'],
        gap: 1,
      }}
    >
      {children}
    </BottomSheetScrollView>
  );
}
