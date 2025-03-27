import { Buffer } from 'safe-buffer';
// @ts-expect-error // import process using alias
import process from 'safe-process';

import leatherUiStyles from '@leather.io/ui/styles?url';

import type { Route } from './+types/root';
import stylesheet from './app.css?url';

/**
 * Polyfill global Buffer
 * (should be called before another code)
 */
// @ts-expect-error // safe-buffer typings are too old
globalThis.Buffer = Buffer;

/**
 * Polyfill global process
 * (should be called before another code)
 */
globalThis.process = process;

export function links() {
  return [
    { rel: 'stylesheet', href: stylesheet },
    { rel: 'stylesheet', href: leatherUiStyles },
  ] satisfies Route.LinkDescriptors;
}

export { default, Layout, ErrorBoundary } from './app';
