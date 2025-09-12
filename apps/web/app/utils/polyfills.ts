import { Buffer } from 'safe-buffer';

// Polyfill global Buffer
// @ts-expect-error safe-buffer typings are too old
globalThis.Buffer = Buffer;
