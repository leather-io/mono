import { ScrollView } from 'react-native-gesture-handler';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { HasChildren } from '@/utils/types';
import { Trans } from '@lingui/macro';
import { useTheme } from '@shopify/restyle';

import { Box, QuestionCircleIcon, Text, Theme, TouchableOpacity } from '@leather.io/ui/native';

export function MpcWalletListLayout({ children }: HasChildren) {
  const { bottom } = useSafeAreaInsets();
  const theme = useTheme<Theme>();

  return (
    <Box
      flex={1}
      backgroundColor="ink.background-primary"
      style={{ paddingBottom: bottom + theme.spacing['5'] }}
    >
      <ScrollView contentContainerStyle={{ paddingHorizontal: theme.spacing['5'] }}>
        <Box gap="3" pt="5">
          <TouchableOpacity
            onPress={() => {
              // TODO: show some kind of a helper here
            }}
            p="5"
            position="absolute"
            right={-theme.spacing['5']}
            zIndex={10}
            top={theme.spacing['1']}
          >
            <QuestionCircleIcon color={theme.colors['ink.text-primary']} variant="small" />
          </TouchableOpacity>
          <Box>
            <Trans>
              <Text variant="heading03">CONNECT</Text>
              <Text variant="heading03">MPC WALLET</Text>
            </Trans>
          </Box>
          {children}
        </Box>
      </ScrollView>
    </Box>
  );
}
