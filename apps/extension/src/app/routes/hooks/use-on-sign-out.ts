import { resetWallet } from '@leather.io/state';

import { useOnMount } from '@app/common/hooks/use-on-mount';

export function useOnSignOut(handler: () => void) {
  useOnMount(() => {
    chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
      if (message?.method === resetWallet.type) handler();
      sendResponse();
    });
  });
}
