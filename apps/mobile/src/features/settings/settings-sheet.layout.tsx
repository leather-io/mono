import { ReactNode, RefObject } from 'react';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useSettings } from '@/store/settings/settings.write';
import { HasChildren } from '@/utils/types';
import { useTheme } from '@shopify/restyle';

import { Avatar, Box, Sheet, SheetHeader, SheetRef, Theme } from '@leather.io/ui/native';

interface SettingsSheetLayoutProps extends HasChildren {
  icon: ReactNode;
  sheetRef: RefObject<SheetRef>;
  title: string;
}
export function SettingsSheetLayout({ children, icon, sheetRef, title }: SettingsSheetLayoutProps) {
  const { bottom } = useSafeAreaInsets();
  const { theme: themeVariant } = useSettings();
  const theme = useTheme<Theme>();

  return (
    <Sheet isScrollView ref={sheetRef} themeVariant={themeVariant}>
      <Box
        style={{
          gap: theme.spacing[5],
          paddingBottom: theme.spacing['5'] + bottom,
          paddingHorizontal: theme.spacing['5'],
          paddingTop: theme.spacing['4'],
        }}
      >
        <SheetHeader icon={<Avatar>{icon}</Avatar>} onPressSupport={() => {}} title={title} />
        {children}
      </Box>
    </Sheet>
  );
}
