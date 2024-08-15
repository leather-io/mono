import { APP_ROUTES } from '@/constants';
import { useRouter } from 'expo-router';

import { Box, ConsoleIcon, SettingsIcon, TouchableOpacity } from '@leather.io/ui/native';

export function OptionsHeader() {
  const router = useRouter();

  return (
    <Box flexDirection="row">
      <TouchableOpacity p="3" onPress={() => router.navigate(APP_ROUTES.WalletSettings)}>
        <SettingsIcon />
      </TouchableOpacity>
      <TouchableOpacity p="3" onPress={() => router.navigate(APP_ROUTES.WalletDeveloperConsole)}>
        <ConsoleIcon />
      </TouchableOpacity>
    </Box>
  );
}
