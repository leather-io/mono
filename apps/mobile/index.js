import 'react-native-get-random-values';

import 'expo-router/entry';
import { polyfillWebCrypto } from 'expo-standard-web-crypto';
import 'fast-text-encoding';

polyfillWebCrypto();
if (typeof Buffer === 'undefined') {
  global.Buffer = require('buffer').Buffer;
}
