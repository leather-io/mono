import { Dimensions } from 'react-native';

import { userRemovesApp } from '@/store/apps/apps.write';
import { App } from '@/store/apps/utils';
import { useAppDispatch } from '@/store/utils';
import { Image } from 'expo-image';

import { Box, CloseIcon, Pressable, Text, legacyTouchablePressEffect } from '@leather.io/ui/native';

const { width } = Dimensions.get('window');

interface ScreenshotCardProps {
  app: App;
  onPress(): void;
}
export function ScreenshotCard({ app, onPress }: ScreenshotCardProps) {
  const dispatch = useAppDispatch();
  function onDeleteApp() {
    dispatch(userRemovesApp({ origin: app.origin }));
  }

  return (
    <Pressable onPress={onPress} pressEffects={legacyTouchablePressEffect} maxWidth={width * 0.4}>
      <Box py="3" flexDirection="row" alignItems="center" justifyContent="space-between">
        <Box
          flexDirection="row"
          gap="2"
          justifyContent="center"
          alignItems="center"
          flexShrink={1}
          overflow="hidden"
        >
          <Image style={{ width: 24, height: 24, borderRadius: 999 }} source={{ uri: app.icon }} />
          <Text style={{ flexShrink: 1 }} numberOfLines={1}>
            {app.name}
          </Text>
        </Box>
        <Pressable
          pressEffects={legacyTouchablePressEffect}
          width={24}
          height={24}
          justifyContent="center"
          alignItems="center"
          onPress={onDeleteApp}
        >
          <CloseIcon height={16} width={16} />
        </Pressable>
      </Box>

      <Box borderWidth={1} borderColor="ink.border-default" borderRadius="sm" overflow="hidden">
        <Image
          style={{ width: width * 0.4, height: 300 }}
          source={app.screenshot && { uri: app.screenshot }}
        />
      </Box>
    </Pressable>
  );
}
