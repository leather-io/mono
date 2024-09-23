import { AppRoutes } from '@/routes';
import { useRouter } from 'expo-router';

import { Box, SettingsGearIcon, TerminalIcon, TouchableOpacity } from '@leather.io/ui/native';

export function OptionsHeader() {
  const router = useRouter();

  return (
    <Box flexDirection="row">
      <TouchableOpacity p="3" onPress={() => router.navigate(AppRoutes.Settings)}>
        <SettingsGearIcon />
      </TouchableOpacity>
      <TouchableOpacity p="3" onPress={() => router.navigate(AppRoutes.DeveloperConsole)}>
        <TerminalIcon />
      </TouchableOpacity>
    </Box>
  );
}
