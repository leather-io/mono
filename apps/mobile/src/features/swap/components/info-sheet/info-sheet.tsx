import { ReactNode, useEffect, useRef, useState } from 'react';

import { t } from '@lingui/core/macro';

import { Box, IconButton, InfoCircleIcon, Sheet, SheetInstance } from '@leather.io/ui/native';

interface InfoSheetProps {
  title: string;
  children: ReactNode;
}

/**
 * VERY EXPERIMENTAL. Please do not re-use yet.
 *
 * A declarative wrapper around the Sheet for easily triggering informational popups.
 *
 * @example
 * // Renders an info circle button opening a sheet
 * <InfoSheet>
 *   <Box>
 *     <Text>Arbitrary content here.</Text>
 *   </Box>
 * </InfoSheet>
 * */
export function InfoSheet({ title, children }: InfoSheetProps) {
  const sheetRef = useRef<SheetInstance>(null);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (open) {
      sheetRef.current?.present();
    } else {
      sheetRef.current?.dismiss();
    }
  }, [open, setOpen]);

  return (
    <>
      <IconButton
        onPress={() => setOpen(true)}
        label={t`Info`}
        icon={<InfoCircleIcon variant="small" color="ink.text-subdued-secondary" />}
      />
      {open && (
        <Sheet ref={sheetRef} onDismiss={() => setOpen(false)}>
          <Sheet.View>
            <Sheet.Header leftElement={<Sheet.Title>{title}</Sheet.Title>} />
            <Box px="5" pb="4">
              {children}
            </Box>
          </Sheet.View>
        </Sheet>
      )}
    </>
  );
}
