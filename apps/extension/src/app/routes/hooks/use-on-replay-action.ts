import { userAddsAccount } from '@leather.io/state/keychains';
import { userRenamesWallet } from '@leather.io/state/wallet';

import { addReplayActionListener } from '@shared/messages';

import { useOnMount } from '@app/common/hooks/use-on-mount';
import { useAppDispatch } from '@app/store';
import { userRenamesAccount, userTogglesHideAccount } from '@app/store/accounts/accounts.slice';
import { userSwitchesAccount } from '@app/store/active/active.slice';
import { stxChainSlice } from '@app/store/chains/stx-chain.slice';

const replayableActionTypes = new Set<string>([
  userRenamesWallet.type,
  userRenamesAccount.type,
  userTogglesHideAccount.type,
  userAddsAccount.type,
  userSwitchesAccount.type,
  stxChainSlice.actions.createNewAccount.type,
]);

export function useOnReplayAction() {
  const dispatch = useAppDispatch();
  useOnMount(() =>
    addReplayActionListener(action => {
      if (replayableActionTypes.has(action.type)) dispatch(action);
    })
  );
}
