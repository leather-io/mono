import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';

import { Buffer } from 'safe-buffer';

import { App } from './app';

import './styles.css';

// bitcoinjs-lib, reached through @leather.io/bitcoin, expects a global Buffer.
// safe-buffer implements the runtime surface those libraries use; its type
// declaration is narrower than Node's BufferConstructor, hence the assignment
// through a structural cast rather than a direct one.
Reflect.set(globalThis, 'Buffer', Buffer);

const rootEl = document.getElementById('root');
if (!rootEl) throw new Error('Root element #root not found');

createRoot(rootEl).render(
  <StrictMode>
    <App />
  </StrictMode>
);
