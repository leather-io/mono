import { Dimensions } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useApps } from '@/store/apps/apps.read';
import { t } from '@lingui/macro';
import { Image } from 'expo-image';

import { Box, Text } from '@leather.io/ui/native';

import { ScreenshotCard } from '../screenshot-card';
import { URL_SEARCH_HEIGHT } from '../utils';
import { BrowserTabSheetLayout } from './browser-tab-sheet.layout';

const { width } = Dimensions.get('window');

interface ConnectedProps {
  goToUrl(url: string): void;
}

export function BrowserConnectedTab({ goToUrl }: ConnectedProps) {
  const { list: appList } = useApps('connected');
  const { bottom } = useSafeAreaInsets();

  if (appList.length === 0) {
    return (
      <Box
        flex={1}
        justifyContent="center"
        alignItems="center"
        alignSelf="center"
        maxWidth={width * 0.5}
        style={{
          paddingBottom: bottom + URL_SEARCH_HEIGHT,
        }}
        gap="3"
      >
        <Image
          style={{ height: width * 0.5, width: width * 0.5 }}
          contentFit="cover"
          source={require('@/assets/connected_empty.png')}
        />
        <Text textAlign="center" variant="heading03">
          {t({
            id: 'browser-sheet.connected.empty.title',
            message: 'Nothing here yet',
          })}
        </Text>
        <Text textAlign="center" variant="label01">
          {t({
            id: 'browser-sheet.connected.empty.caption',
            message: 'You will find the apps you are connected here',
          })}
        </Text>
      </Box>
    );
  }

  return (
    <BrowserTabSheetLayout>
      <Text variant="heading04" py="3">
        {t({
          id: 'browser-sheet.connected.title',
          message: 'Connected',
        })}
      </Text>
      <Box flexDirection="row" flexWrap="wrap" gap="5">
        {appList.map(app => (
          <ScreenshotCard
            key={app.origin}
            app={app}
            onPress={() => {
              goToUrl(app.origin);
            }}
          />
        ))}
      </Box>
    </BrowserTabSheetLayout>
  );
}
