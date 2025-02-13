import { Platform } from 'react-native';

import * as Application from 'expo-application';

export function getDeviceId() {
  if (Platform.OS === 'android') {
    return Promise.resolve(Application.getAndroidId());
  } else {
    return Application.getIosIdForVendorAsync();
  }
}
