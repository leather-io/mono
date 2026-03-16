import { useOnMount } from '@app/common/hooks/use-on-mount';

const WALLET_LOCK_MESSAGE = 'wallet/lock';

export function useOnWalletLock(handler: () => void) {
  useOnMount(() => {
    chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
      if (message?.method === WALLET_LOCK_MESSAGE) handler();
      sendResponse();
    });
  });
}
