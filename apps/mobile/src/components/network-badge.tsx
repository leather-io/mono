import { AppRoutes } from '@/routes';
import { useSettings } from '@/store/settings/settings';
import { useLingui } from '@lingui/react';
import { useRouter } from 'expo-router';

import { Box, Text, TouchableOpacity } from '@leather.io/ui/native';

export function NetworkBadge() {
  const router = useRouter();
  const { i18n } = useLingui();
  const { networkPreference } = useSettings();

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
          {i18n._({
            id: 'settings.header_network',
            message: '{network}',
            values: { network: networkPreference.name },
          })}
        </Text>
      </Box>
    </TouchableOpacity>
  );
}
