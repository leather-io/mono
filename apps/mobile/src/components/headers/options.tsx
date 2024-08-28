import { APP_ROUTES } from '@/routes';
import { useRouter } from 'expo-router';

import { Box, PulseIcon, SettingsSliderThreeIcon, TouchableOpacity } from '@leather.io/ui/native';

export function OptionsHeader() {
  const router = useRouter();

  return (
    <Box flexDirection="row">
      <TouchableOpacity p="3" onPress={() => router.navigate(APP_ROUTES.WalletSettings)}>
        <SettingsSliderThreeIcon />
      </TouchableOpacity>
      <TouchableOpacity p="3" onPress={() => router.navigate(APP_ROUTES.WalletDeveloperConsole)}>
        <PulseIcon />
      </TouchableOpacity>
    </Box>
  );
}
