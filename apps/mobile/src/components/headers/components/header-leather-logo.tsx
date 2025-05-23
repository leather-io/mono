import { TestId } from '@/shared/test-id';
import { router } from 'expo-router';

import { Box, LeatherLogomarkIcon } from '@leather.io/ui/native';

export function HeaderLeatherLogo() {
  return (
    <Box p="3">
      <LeatherLogomarkIcon
        onPress={() => router.navigate('/developer-console')}
        testID={TestId.homeDeveloperToolsButton}
      />
    </Box>
  );
}
