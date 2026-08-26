import { createRoot } from 'react-dom/client';

import ecc from '@bitcoinerlab/secp256k1';
import * as bitcoin from 'bitcoinjs-lib';

import { initiateLeatherSessionTrackingPort } from '@shared/analytics/session-duration-tracking';
import { initSentry } from '@shared/utils/analytics';
import { warnUsersAboutDevToolsDangers } from '@shared/utils/dev-tools-warning-log';
import { installHiroPartnerFetch } from '@shared/utils/hiro-partner-fetch';

import { persistAndRenderApp } from '@app/common/persistence';
import { persistor } from '@app/store';
import { restoreWalletSession } from '@app/store/session-restore';

import { App } from './app';
import { setDebugOnGlobal } from './debug';
import { initAppServices } from './services/init-app-services';

// `bitcoinjs-lib` requires an elliptic curve library to be initialized, here we
// do it globally for the entire app.
bitcoin.initEccLib(ecc);

installHiroPartnerFetch();
initAppServices();
initSentry();
warnUsersAboutDevToolsDangers();
setDebugOnGlobal();
initiateLeatherSessionTrackingPort();

declare global {
  interface Window {
    __APP_VERSION__: string;
  }
}

window.__APP_VERSION__ = VERSION;

// Persist writes are staged asynchronously; a closing popup would otherwise
// lose changes made moments before it was dismissed
function flushPersistenceBeforeHide() {
  void persistor.flush();
}
window.addEventListener('pagehide', flushPersistenceBeforeHide);
document.addEventListener('visibilitychange', () => {
  if (document.visibilityState === 'hidden') flushPersistenceBeforeHide();
});

async function renderApp() {
  await restoreWalletSession();
  const container = document.getElementById('app');
  return createRoot(container!).render(<App />);
}

persistAndRenderApp(renderApp);
