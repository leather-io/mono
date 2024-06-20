// Loading fonts in runtime.
import { useEffect } from 'react';

import FontAwesome from '@expo/vector-icons/FontAwesome';
import { useFonts } from 'expo-font';

export function useLoadFonts({ onLoaded }: { onLoaded?: () => unknown }) {
  // As soon as we `expo prebuild` the project, we should move it to app.json expo-font config plugin
  const [loaded, error] = useFonts({
    SpaceMono: require('../assets-native/fonts/SpaceMono-Regular.ttf'),
    DiatypeRegular: require('../assets-native/fonts/ABCDiatype-Regular.otf'),
    DiatypeLight: require('../assets-native/fonts/ABCDiatype-Light.otf'),
    DiatypeMedium: require('../assets-native/fonts/ABCDiatype-Medium.otf'),
    MarcheSuperPro: require('../assets-native/fonts/marche-super-pro.otf'),
    ...FontAwesome.font,
  });

  // Expo Router uses Error Boundaries to catch errors in the navigation tree.
  useEffect(() => {
    if (error) throw error;
  }, [error]);

  useEffect(() => {
    if (loaded) onLoaded?.();
  }, [loaded]);

  return {
    fontsLoaded: loaded,
  };
}
