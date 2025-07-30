import { Screen } from '@/components/screen/screen';
import { HeaderTitle } from '@/components/screen/screen-header/components/header-title';
import { Sticker } from '@/components/sticker';
import { LinkCard } from '@/features/browser/browser/link-card';
import { useApps } from '@/store/apps/apps.read';
import { t } from '@lingui/macro';

import { Box, Text } from '@leather.io/ui/native';

export default function ConnectionsScreen() {
  const { list: appList } = useApps('connected');
  const title = t({ id: 'browser.connections.title', message: 'Connections' });

  const emptyState = (
    <>
      <Box position="absolute" style={{ width: '100%' }}>
        <Screen.Header centerElement={<HeaderTitle title={title} />} />
      </Box>
      <Screen.Body width={270} alignSelf="center" justifyContent="center" alignItems="center">
        <Sticker source={require('@/assets/stickers/ufo.png')} />
        <Text textAlign="center" variant="label01">
          {t({
            id: 'browser-sheet.connected.empty.caption',
            message: 'You will find the apps you are connected to here',
          })}
        </Text>
      </Screen.Body>
    </>
  );
  const withApps = (
    <>
      <Screen.Header centerElement={<HeaderTitle title={title} />} />
      <Screen.ScrollView>
        <Box flexDirection="row" flexWrap="wrap" gap="4" px="5">
          {appList.reverse().map(app => (
            <LinkCard app={app} key={app.origin} />
          ))}
        </Box>
      </Screen.ScrollView>
    </>
  );

  const innerContent = appList.length === 0 ? emptyState : withApps;

  return <Screen backgroundColor="ink.background-primary">{innerContent}</Screen>;
}
