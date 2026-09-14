import { openExternalLink } from '~/utils/external-links';

import { LEATHER_EXTENSION_CHROME_STORE_URL } from '@leather.io/constants';
import { Button, WalletIcon } from '@leather.io/ui';

// The header call to action whenever no wallet is detected, shared by the
// app-wide sign-in button and the multisig connect dropdown.
export function InstallLeatherButton() {
  return (
    <Button
      alignSelf="center"
      size="md"
      iconStart={WalletIcon}
      onClick={() => openExternalLink(LEATHER_EXTENSION_CHROME_STORE_URL)}
    >
      Install
    </Button>
  );
}
