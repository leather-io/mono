import { useToastContext } from '@/components/toast/toast-context';
import { userRemovesApp } from '@/store/apps/apps.write';
import { App } from '@/store/apps/utils';
import { useAppDispatch } from '@/store/utils';
import { t } from '@lingui/core/macro';

import { Box, CloseIcon, Pressable, Text } from '@leather.io/ui/native';

import { useOpenUrl } from './use-open-url';
import { getAppDetails } from './utils';

interface LinkCardProps {
  app: App;
}

export function LinkCard({ app }: LinkCardProps) {
  const { openUrl } = useOpenUrl();
  const dispatch = useAppDispatch();
  const { displayToast } = useToastContext();
  function onDeleteApp() {
    dispatch(userRemovesApp({ origin: app.origin }));
    displayToast({
      title: t`Disconnected`,
      type: 'info',
    });
  }

  const { name, icon } = getAppDetails(app, { iconSize: 24 });

  return (
    <Box
      flexDirection="row"
      key={app.origin}
      justifyContent="space-between"
      alignItems="center"
      style={{ width: '100%' }}
    >
      <Pressable
        onPress={() => openUrl(app.origin)}
        flexDirection="row"
        flexShrink={1}
        alignItems="center"
        gap="2"
      >
        {icon}
        <Box flexShrink={1} flexDirection="column">
          <Text variant="label02" numberOfLines={1}>
            {name}
          </Text>
          <Text color="ink.text-subdued-secondary" variant="caption01">
            {app.origin}
          </Text>
        </Box>
      </Pressable>
      <Pressable onPress={onDeleteApp} p="2">
        <CloseIcon variant="small" />
      </Pressable>
    </Box>
  );
}
