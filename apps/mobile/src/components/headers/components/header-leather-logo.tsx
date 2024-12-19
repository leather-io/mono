import { AppRoutes } from '@/routes';
import { isFeatureEnabled } from '@/shared/feature-flags';
import { TestId } from '@/shared/test-id';
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
