import 'expo-router/entry';

if (typeof Buffer === 'undefined') {
  global.Buffer = require('buffer').Buffer;
}
