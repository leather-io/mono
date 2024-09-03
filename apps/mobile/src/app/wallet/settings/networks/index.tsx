import { ScrollView } from 'react-native-gesture-handler';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { t } from '@lingui/macro';
import { useTheme } from '@shopify/restyle';

import {
  Box,
  Cell,
  GlobeIcon,
  PlaygroundFormsIcon,
  TestTubeIcon,
  Theme,
} from '@leather.io/ui/native';

export default function SettingsNetworksScreen() {
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
          isSelected
          title={t`Mainnet`}
          subtitle={t`Enabled`}
          Icon={GlobeIcon}
          variant="radio"
        />
        <Cell
          isSelected={false}
          title={t`Testnet`}
          subtitle={t`Disabled`}
          Icon={TestTubeIcon}
          variant="radio"
        />
        <Cell
          isSelected={false}
          title={t`Signet`}
          subtitle={t`Disabled`}
          Icon={PlaygroundFormsIcon}
          variant="radio"
        />
      </ScrollView>
    </Box>
  );
}
