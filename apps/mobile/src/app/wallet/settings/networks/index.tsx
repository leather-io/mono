import { ScrollView } from 'react-native-gesture-handler';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { t } from '@lingui/macro';
import { useTheme } from '@shopify/restyle';

import {
  Avatar,
  Box,
  Flag,
  GlobeIcon,
  ItemLayout,
  PlaygroundFormsIcon,
  RadioButton,
  TestTubeIcon,
  Theme,
  TouchableOpacity,
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
        <TouchableOpacity onPress={() => {}}>
          <Flag
            img={
              <Avatar>
                <GlobeIcon />
              </Avatar>
            }
          >
            <ItemLayout
              actionIcon={<RadioButton disabled isSelected />}
              titleLeft={t`Mainnet`}
              captionLeft={t`Enabled`}
            />
          </Flag>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => {}}>
          <Flag
            img={
              <Avatar>
                <TestTubeIcon />
              </Avatar>
            }
          >
            <ItemLayout
              actionIcon={<RadioButton disabled isSelected={false} />}
              titleLeft={t`Testnet`}
              captionLeft={t`Disabled`}
            />
          </Flag>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => {}}>
          <Flag
            img={
              <Avatar>
                <PlaygroundFormsIcon />
              </Avatar>
            }
          >
            <ItemLayout
              actionIcon={<RadioButton disabled isSelected={false} />}
              titleLeft={t`Signet`}
              captionLeft={t`Disabled`}
            />
          </Flag>
        </TouchableOpacity>
      </ScrollView>
    </Box>
  );
}
