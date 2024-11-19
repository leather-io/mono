import { AppRoutes } from '@/routes';
import { TestId } from '@/shared/test-id';
import { useRouter } from 'expo-router';

import { Box, LeatherLogomarkIcon } from '@leather.io/ui/native';

export function HeaderLeatherLogo() {
  const router = useRouter();
  return (
    <Box p="3">
      <LeatherLogomarkIcon
        onPress={() => router.navigate(AppRoutes.DeveloperConsole)}
        testID={TestId.homeDeveloperToolsButton}
      />
    </Box>
  );
}
