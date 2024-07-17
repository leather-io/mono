import 'expo-router/entry';
import { polyfillWebCrypto } from 'expo-standard-web-crypto';
import 'fast-text-encoding';

polyfillWebCrypto();
if (typeof Stream === 'undefined') {
  global.Stream = require('readable-stream').Stream;
}
if (typeof Buffer === 'undefined') {
  global.Buffer = require('buffer').Buffer;
}
