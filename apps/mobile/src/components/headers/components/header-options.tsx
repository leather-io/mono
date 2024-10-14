import { AppRoutes } from '@/routes';
import { TestId } from '@/shared/test-id';
import { useRouter } from 'expo-router';

import { Box, SettingsGearIcon, TerminalIcon, TouchableOpacity } from '@leather.io/ui/native';

export function HeaderOptions() {
  const router = useRouter();

  return (
    <Box flexDirection="row">
      <TouchableOpacity
        p="3"
        onPress={() => router.navigate(AppRoutes.Settings)}
        testID={TestId.homeSettingsButton}
      >
        <SettingsGearIcon />
      </TouchableOpacity>
      <TouchableOpacity
        p="3"
        onPress={() => router.navigate(AppRoutes.DeveloperConsole)}
        testID={TestId.homeDeveloperToolsButton}
      >
        <TerminalIcon />
      </TouchableOpacity>
    </Box>
  );
}
