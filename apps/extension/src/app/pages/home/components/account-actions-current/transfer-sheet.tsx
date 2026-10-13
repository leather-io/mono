import { InboxIcon, PaperPlaneIcon } from '@leather.io/ui';

import { ActionDrawer } from './action-drawer';
import { ActionDrawerButton } from './action-drawer-button';

interface TransferSheetProps {
  onSend(): void;
  onReceive(): void;
  onClose(): void;
  isShowing: boolean;
}

export function TransferSheet({ onSend, onReceive, onClose, isShowing }: TransferSheetProps) {
  return (
    <ActionDrawer onClose={onClose} isShowing={isShowing}>
      <ActionDrawerButton
        title="Send"
        onClick={onSend}
        caption="Send tokens to another wallet"
        icon={<PaperPlaneIcon />}
      />

      <ActionDrawerButton
        icon={<InboxIcon />}
        onClick={onReceive}
        title="Receive"
        caption="Receive tokens or NTFs from others"
      />
    </ActionDrawer>
  );
}
