import { useToastContext } from '@/components/toast/toast-context';
import { userRemovesApp } from '@/store/apps/apps.write';
import { App } from '@/store/apps/utils';
import { useAppDispatch } from '@/store/utils';
import { t } from '@lingui/macro';

import { Box, CloseIcon, Favicon, Pressable, Text } from '@leather.io/ui/native';

import { useOpenURL } from './use-open-url';

interface LinkCardProps {
  app: App;
}

export function LinkCard({ app }: LinkCardProps) {
  const { openURL } = useOpenURL();
  const dispatch = useAppDispatch();
  const { displayToast } = useToastContext();
  function onDeleteApp() {
    dispatch(userRemovesApp({ origin: app.origin }));
    displayToast({
      title: t({ id: 'general.disconnected', message: 'Disconnected' }),
      type: 'info',
    });
  }
  return (
    <Box
      flexDirection="row"
      key={app.origin}
      justifyContent="space-between"
      alignItems="center"
      style={{ width: '100%' }}
      gap="5"
    >
      <Pressable
        onPress={() => openURL(app.origin)}
        flexDirection="row"
        flexShrink={1}
        alignItems="center"
        gap="2"
      >
        <Favicon origin={app.origin} size={40} />
        <Box flexShrink={1} flexDirection="column">
          <Text variant="label02" numberOfLines={1}>
            {app.name}
          </Text>
          <Text color="ink.text-subdued" variant="caption01">
            {app.origin}
          </Text>
        </Box>
      </Pressable>
      <Pressable onPress={onDeleteApp} p="2">
        <CloseIcon />
      </Pressable>
    </Box>
  );
}
