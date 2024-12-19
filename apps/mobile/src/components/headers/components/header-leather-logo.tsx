import { AppRoutes } from '@/routes';
import { TestId } from '@/shared/test-id';
import { isFeatureEnabled } from '@/utils/feature-flag';
import { useRouter } from 'expo-router';

import { Box, LeatherLogomarkIcon } from '@leather.io/ui/native';

export function HeaderLeatherLogo() {
  const router = useRouter();
  return (
    <Box p="3">
      <LeatherLogomarkIcon
        onPress={isFeatureEnabled() ? () => router.navigate(AppRoutes.DeveloperConsole) : undefined}
        testID={TestId.homeDeveloperToolsButton}
      />
    </Box>
  );
}
