import AsyncStorage from '@react-native-async-storage/async-storage';
import * as SecureStore from 'expo-secure-store';

export const PROTECTED_KEY = 'protected';
export const PERSISTED_KEY = 'persisted';

export function filterObjectKeys(object: object, keys: string[]) {
  return Object.fromEntries(Object.entries(object).filter(([key]) => !keys.includes(key)));
}

// @ts-expect-error '_clearAllPersistedStorage' is defined but never used.
// eslint-disable-next-line @typescript-eslint/no-unused-vars
async function _clearAllPersistedStorage() {
  await AsyncStorage.clear();
  await SecureStore.deleteItemAsync(PROTECTED_KEY);
}
