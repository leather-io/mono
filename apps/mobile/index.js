// @formatjs polyfill import order matters, altering it can crash the app.
// This file is in .prettierignore.
import '@formatjs/intl-getcanonicallocales/polyfill.js';
import '@formatjs/intl-locale/polyfill';

// Intl.NumberFormat support differs between Android and iOS https://github.com/facebook/hermes/blob/main/doc/IntlAPIs.md
// For consistency, use force to ensure polyfill is applied regardless of Intl availability.
import '@formatjs/intl-numberformat/polyfill-force';
import '@formatjs/intl-pluralrules/polyfill';

import 'react-native-get-random-values';
import 'expo-router/entry';
import { polyfillWebCrypto } from 'expo-standard-web-crypto';
import 'fast-text-encoding';

polyfillWebCrypto();
if (typeof Buffer === 'undefined') {
  global.Buffer = require('buffer').Buffer;
}

