import { AppRoutes } from '@/routes';
import { t } from '@lingui/macro';
import { useRouter } from 'expo-router';

import { Box, Text, TouchableOpacity } from '@leather.io/ui/native';

export function NetworkBadge() {
  const router = useRouter();

  return (
    <TouchableOpacity px="3" onPress={() => router.navigate(AppRoutes.SettingsNetworks)}>
      <Box
        bg="ink.background-secondary"
        borderColor="ink.border-transparent"
        borderRadius="xs"
        borderWidth={1}
        p="1"
      >
        <Text variant="label03" color="ink.text-subdued">
          {t({
            id: 'settings.header_network',
            message: 'Testnet',
          })}
        </Text>
      </Box>
    </TouchableOpacity>
  );
}
