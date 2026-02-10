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

export async function resetToSerializedStateVersion() {
  await chrome.storage.local.set({
    ['persist:root']:
      '{"analytics":"{\\"hasStxDeposits\\":{\\"1\\":true,\\"2147483648\\":true}}","chains":"{\\"stx\\":{\\"default\\":{\\"highestAccountIndex\\":16,\\"currentAccountIndex\\":0}}}","keys":"{\\"ids\\":[\\"default\\"],\\"entities\\":{\\"default\\":{\\"type\\":\\"software\\",\\"id\\":\\"default\\",\\"salt\\":\\"824e35c73aaad6f501c8c11ee6042da5\\",\\"encryptedSecretKey\\":\\"dbd99c464bdcbd60989c9a7c04c2868d7c4de28419506dba2b959cc6a50dcd0b9236960eb46e721f9ba3dfe6ee32532d60bb789670387b4f0f31d22a86e3d91019851f82128c304d5fff7f75203c697b5735b6c7955b0b931509d0f227fa1ece\\"}}}","networks":"{\\"ids\\":[],\\"entities\\":{},\\"currentNetworkId\\":\\"mainnet\\"}","onboarding":"{\\"hideSteps\\":true,\\"stepsStatus\\":{\\"Back up secret key\\":1,\\"Add some funds\\":0,\\"Explore apps\\":0,\\"Buy an NFT\\":0}}","settings":"{\\"userSelectedTheme\\":\\"system\\",\\"dismissedMessages\\":[]}","_persist":"{\\"version\\":1,\\"rehydrated\\":true}"}',
  });
  await chrome.storage.session.set({ encryptionKey: process.env.DEBUG_DEV_WALLET_ENCRYPTION_KEY });
  logger.info('Reset to serialized state version');
  window.location.reload();
}
