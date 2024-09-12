import { APP_ROUTES } from '@/routes';
import { useRouter } from 'expo-router';

import { Box, SettingsGearIcon, TerminalIcon, TouchableOpacity } from '@leather.io/ui/native';

export function OptionsHeader() {
  const router = useRouter();

  return (
    <Box flexDirection="row">
      <TouchableOpacity p="3" onPress={() => router.navigate(APP_ROUTES.WalletSettings)}>
        <SettingsGearIcon />
      </TouchableOpacity>
      <TouchableOpacity p="3" onPress={() => router.navigate(APP_ROUTES.WalletDeveloperConsole)}>
        <TerminalIcon />
      </TouchableOpacity>
    </Box>
  );
}
