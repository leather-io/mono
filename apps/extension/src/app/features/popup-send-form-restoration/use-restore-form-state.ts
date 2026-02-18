import { getActiveTab } from '@shared/utils/get-active-tab';

import { useOnMount } from '@app/common/hooks/use-on-mount';
import { isPopupMode } from '@app/common/utils';
import { useNavigate } from '@app/routes/compat';
import { useAppDispatch } from '@app/store';
import { sendNavigationSlice } from '@app/store/navigation/send-navigation.slice';

// Would rather use the `useAsync` hook to call this promise, however this is
// excuted later in the lifecycle of the app, which causes the homepage to
// render first.
let currentTabId = 0;
async function run() {
  const tab = await getActiveTab();
  // Tab can sometimes be undefined in mobile extension environments
  // https://trust-machines.sentry.io/issues/3999731741/?project=4504204000952320

  if (!tab) return;
  currentTabId = tab.id ?? 0;
}
void run();

export function useRestoreFormState() {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();

  useOnMount(async () => {
    if (!isPopupMode() || !currentTabId || !chrome.storage.session) return;
    const key = 'form-state-' + currentTabId.toString();
    const state = await chrome.storage.session.get('form-state-' + currentTabId.toString());
    const persistedState = state[key];
    if (!persistedState || !persistedState.symbol) return;
    dispatch(
      sendNavigationSlice.actions.setSendFormRouteState({
        amount: persistedState.amount ?? '',
        recipient: persistedState.recipient ?? '',
      })
    );
    void navigate('send/' + persistedState.symbol);
  });
}
