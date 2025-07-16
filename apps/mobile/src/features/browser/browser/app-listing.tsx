import { Screen } from '@/components/screen/screen';
import { HeaderTitle } from '@/components/screen/screen-header/components/header-title';
import { ScreenshotCard } from '@/features/browser/browser/screenshot-card';
import { useOpenURL } from '@/features/browser/browser/use-open-url';
import { useApps } from '@/store/apps/apps.read';
import { AppStatus } from '@/store/apps/utils';
import { Image } from 'expo-image';

import { Box, Text } from '@leather.io/ui/native';

interface AppListingProps {
  appStatus: AppStatus;
  title: string;
  emptyStateTitle: string;
  imageSrc: string;
}

export function AppListing({ appStatus, title, emptyStateTitle, imageSrc }: AppListingProps) {
  const { list: appList } = useApps(appStatus);
  const { openURL } = useOpenURL();

  const emptyState = (
    <>
      <Box>
        <Screen.Header centerElement={<HeaderTitle title={title} />} />
      </Box>
      <Screen.Body width={270} alignSelf="center" justifyContent="center" alignItems="center">
        <Image style={{ height: 270, width: 270 }} contentFit="cover" source={imageSrc} />

        <Text textAlign="center" variant="label01">
          {emptyStateTitle}
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
