import { type MouseEvent } from 'react';

import { openExternalLink } from '~/utils/external-links';

import { LEATHER_EXTENSION_CHROME_STORE_URL } from '@leather.io/constants';
import { Button, WalletIcon } from '@leather.io/ui';

interface InstallLeatherButtonProps {
  /** Overrides the default action (opening the Chrome Web Store listing). */
  onClick?(event: MouseEvent): void;
}

// The header call to action whenever no wallet is detected, shared by the
// app-wide sign-in button (where it opens the install modal) and the multisig
// connect dropdown (where it goes straight to the extension).
export function InstallLeatherButton({ onClick }: InstallLeatherButtonProps) {
  return (
    <Button
      alignSelf="center"
      size="md"
      iconStart={WalletIcon}
      onClick={onClick ?? (() => openExternalLink(LEATHER_EXTENSION_CHROME_STORE_URL))}
    >
      Install
    </Button>
  );
}
