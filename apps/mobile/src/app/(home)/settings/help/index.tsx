import { ScrollView } from 'react-native-gesture-handler';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { t } from '@lingui/macro';
import { useTheme } from '@shopify/restyle';

import { Box, GraduateCapIcon, MagicBookIcon, SupportIcon, Theme } from '@leather.io/ui/native';

import { HelpCell } from './help-cell';

export default function SettingsHelpScreen() {
  const { bottom } = useSafeAreaInsets();
  const theme = useTheme<Theme>();

  return (
    <Box flex={1} backgroundColor="ink.background-primary">
      <ScrollView
        contentContainerStyle={{
          paddingHorizontal: theme.spacing['5'],
          paddingTop: theme.spacing['5'],
          paddingBottom: theme.spacing['5'] + bottom,
          gap: theme.spacing[5],
        }}
      >
        <HelpCell
          title={t`Support and feedback`}
          caption={t`Placeholder`}
          icon={<SupportIcon />}
          onPress={() => {}}
        />
        <HelpCell
          title={t`Guides`}
          caption={t`Placeholder`}
          icon={<MagicBookIcon />}
          onPress={() => {}}
        />
        <HelpCell
          title={t`Learn`}
          caption={t`Placeholder`}
          icon={<GraduateCapIcon />}
          onPress={() => {}}
        />
      </ScrollView>
    </Box>
  );
}
