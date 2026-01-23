import { logger } from '@sentry/react';

export function resetToDevWalletSoftware() {
  (window as any).debug.setLeatherDevWalletSoftware();
}

export function resetToDevWalletLedger() {
  (window as any).debug.setLeatherDevWalletLedger();
}

export function resetToDevWalletLedgerStacksOnly() {
  (window as any).debug.setLeatherDevWalletLedgerStacksOnly();
}

export async function clearSessionStorage() {
  await chrome.storage.session.clear();
  logger.info('Session storage cleared');
}

export async function clearAllChromeStorage() {
  await chrome.storage.local.clear();
  await chrome.storage.session.clear();
  logger.info('All chrome storage cleared');
  window.location.reload();
}
