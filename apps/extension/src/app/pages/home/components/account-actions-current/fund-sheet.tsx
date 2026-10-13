import { InboxIcon, PaperPlaneIcon } from '@leather.io/ui';

import { ActionDrawer } from './action-drawer';
import { ActionDrawerButton } from './action-drawer-button';

interface FundSheetProps {
  onBuy(): void;
  onSell(): void;
  onClose(): void;
  isShowing: boolean;
}

export function FundSheet({ onBuy, onSell, onClose, isShowing }: FundSheetProps) {
  return (
    <ActionDrawer onClose={onClose} isShowing={isShowing}>
      <ActionDrawerButton
        title="Buy"
        onClick={onBuy}
        caption="Buy tokens securely with cash"
        icon={<PaperPlaneIcon />}
      />

      <ActionDrawerButton
        icon={<InboxIcon />}
        onClick={onSell}
        title="Sell"
        caption="Sell tokens securely for cash"
      />
    </ActionDrawer>
  );
}
