import { Screen } from '@/components/screen/screen';
import { HeaderTitle } from '@/components/screen/screen-header/components/header-title';
import { ScreenshotCard } from '@/features/browser/browser/screenshot-card';
import { useOpenURL } from '@/features/browser/browser/use-open-url';
import { useApps } from '@/store/apps/apps.read';
import { t } from '@lingui/macro';
import { Image } from 'expo-image';

import { Box, Text } from '@leather.io/ui/native';

export default function RecentlyViewedScreen() {
  const { list: appList } = useApps('recently_visited');
  const { openURL } = useOpenURL();
  const title = t({ id: 'browser.recently-viewed.title', message: 'Recently viewed' });

  const emptyState = (
    <>
      <Box position="absolute" style={{ width: '100%' }}>
        <Screen.Header centerElement={<HeaderTitle title={title} />} />
      </Box>
      <Screen.Body width={270} alignSelf="center" justifyContent="center" alignItems="center">
        <Image
          style={{ height: 270, width: 270 }}
          contentFit="cover"
          source={require('@/assets/stickers/flower.png')}
        />

        <Text textAlign="center" variant="label01">
          {t({
            id: 'browser-sheet.recent.empty.caption',
            message: 'You will find the apps you recently viewed here',
          })}
        </Text>
      </Screen.Body>
    </>
  );
  const withApps = (
    <>
      <Screen.Header centerElement={<HeaderTitle title={title} />} />
      <Screen.ScrollView>
        <Box flexDirection="row" flexWrap="wrap" gap="5" px="5">
          {appList.reverse().map(app => (
            <ScreenshotCard
              key={app.origin}
              app={app}
              onPress={() => {
                openURL(app.origin);
              }}
            />
          ))}
        </Box>
      </Screen.ScrollView>
    </>
  );

  const innerContent = appList.length === 0 ? emptyState : withApps;

  return <Screen backgroundColor="ink.background-primary">{innerContent}</Screen>;
}
