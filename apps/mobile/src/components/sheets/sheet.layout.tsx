import { ReactElement, ReactNode, RefObject } from 'react';

import { useSettings } from '@/store/settings/settings';

import { Avatar, Box, Sheet, SheetHeader, SheetProps, SheetRef } from '@leather.io/ui/native';

interface SheetLayoutProps extends Omit<SheetProps, 'themeVariant' | 'children'> {
  icon: ReactElement;
  sheetRef: RefObject<SheetRef>;
  children: ReactNode;
  title: string;
}
export function SheetLayout({ children, icon, sheetRef, title, ...sheetProps }: SheetLayoutProps) {
  const { themeDerivedFromThemePreference } = useSettings();

  return (
    <Sheet ref={sheetRef} themeVariant={themeDerivedFromThemePreference} {...sheetProps}>
      <Box gap="3" pt="4" px="5">
        <SheetHeader icon={<Avatar icon={icon} />} title={title} />
        {children}
      </Box>
    </Sheet>
  );
}
