import { useGlobalSheets } from '@/core/global-sheet-provider';
import { t } from '@lingui/core/macro';
import { Image } from 'expo-image';

import { Box, Button, Sheet, Text } from '@leather.io/ui/native';

import { UpdateButton } from './update-button';

interface AppUpdateRequiredSheetProps {
  isLoading?: boolean;
  onUpdatePress?: () => void;
}

export function AppUpdateRequiredSheet({ onUpdatePress }: AppUpdateRequiredSheetProps) {
  const { versionGuardSheetRef } = useGlobalSheets();

  return (
    <Sheet ref={versionGuardSheetRef}>
      <Sheet.View maxWidth={400} px="5">
        <Box pb="2" pt="6" flexDirection="row">
          <Box flex={1.4} gap="5">
            <Text color="ink.text-primary" variant="heading05">
              {t`Get the latest version of the Leather app`}
            </Text>
            <Text variant="body02" color="ink.text-primary" textAlign="left">
              {t`Update the app to get access to the latest features.`}
            </Text>
          </Box>
          <Box flex={1} width={160} height={160}>
            <Image
              style={{
                height: '100%',
                width: '100%',
                position: 'absolute',
                top: -16,
                transform: [{ scaleX: -1 }],
              }}
              contentFit="contain"
              source={require('@/assets/stickers/app-disabled.png')}
            />
          </Box>
        </Box>
        <Box gap="3">
          <UpdateButton onPress={onUpdatePress} />
          <Button variant="ghost" onPress={() => versionGuardSheetRef.current?.dismiss()}>
            {t`Maybe later`}
          </Button>
        </Box>
      </Sheet.View>
    </Sheet>
  );
}
