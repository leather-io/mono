import { ScrollView } from 'react-native-gesture-handler';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { t } from '@lingui/macro';
import { useTheme } from '@shopify/restyle';

import {
  Box,
  Cell,
  GraduateCapIcon,
  MagicBookIcon,
  SupportIcon,
  Theme,
} from '@leather.io/ui/native';

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
        <Cell
          title={t`Support and feedback`}
          subtitle={t`Placeholder`}
          Icon={SupportIcon}
          onPress={() => {}}
        />
        <Cell title={t`Guides`} subtitle={t`Placeholder`} Icon={MagicBookIcon} onPress={() => {}} />
        <Cell
          title={t`Learn`}
          subtitle={t`Placeholder`}
          Icon={GraduateCapIcon}
          onPress={() => {}}
        />
      </ScrollView>
    </Box>
  );
}
