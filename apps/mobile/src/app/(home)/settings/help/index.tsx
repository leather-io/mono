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
        <Cell.Root
          title={t`Support and feedback`}
          caption={t`Placeholder`}
          icon={<SupportIcon />}
          onPress={() => {}}
        >
          <Cell.Chevron />
        </Cell.Root>

        <Cell.Root
          title={t`Guides`}
          caption={t`Placeholder`}
          icon={<MagicBookIcon />}
          onPress={() => {}}
        >
          <Cell.Chevron />
        </Cell.Root>

        <Cell.Root
          title={t`Learn`}
          caption={t`Placeholder`}
          icon={<GraduateCapIcon />}
          onPress={() => {}}
        >
          <Cell.Chevron />
        </Cell.Root>
      </ScrollView>
    </Box>
  );
}
