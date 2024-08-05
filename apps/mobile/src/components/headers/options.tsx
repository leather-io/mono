import DeveloperConsoleIcon from '@/assets/developer-console.svg';
import SettingsIcon from '@/assets/settings.svg';
import { APP_ROUTES } from '@/constants';
import { useRouter } from 'expo-router';

import { Box, TouchableOpacity } from '@leather.io/ui/native';

export function OptionsHeader() {
  const router = useRouter();

  return (
    <Box flexDirection="row">
      <TouchableOpacity p="3" onPress={() => router.navigate(APP_ROUTES.WalletSettings)}>
        <SettingsIcon width={24} height={24} />
      </TouchableOpacity>
      <TouchableOpacity p="3" onPress={() => router.navigate(APP_ROUTES.WalletDeveloperConsole)}>
        <DeveloperConsoleIcon width={24} height={24} />
      </TouchableOpacity>
    </Box>
  );
}
