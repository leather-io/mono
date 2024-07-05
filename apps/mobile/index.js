import 'expo-router/entry';
import { polyfillWebCrypto } from 'expo-standard-web-crypto';

polyfillWebCrypto();

if (typeof Buffer === 'undefined') {
  global.Buffer = require('buffer').Buffer;
}
