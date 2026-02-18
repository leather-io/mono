import { useEffect, useRef } from 'react';
import { useSelector } from 'react-redux';

import { isDefined } from '@leather.io/utils';

import { useNavigate } from '@app/routes/compat';
import { type RootState, useAppDispatch } from '@app/store';
import { modalNavigationSlice } from '@app/store/navigation/modal-navigation.slice';

export function useOnFinishedOnboarding(fn: () => void) {
  const hasCalledFn = useRef(false);
  const fromOnboarding = useSelector((state: RootState) => state.navigation.modal.fromOnboarding);
  const navigate = useNavigate();
  const dispatch = useAppDispatch();

  useEffect(() => {
    if (fromOnboarding && !hasCalledFn.current) {
      hasCalledFn.current = true;
      fn();
      dispatch(modalNavigationSlice.actions.setFromOnboarding(false));
      void navigate('/', { replace: true });
    }
  }, [fn, fromOnboarding, navigate, dispatch]);
}

const leatherDomains = ['leather.io', 'app.leather.io', 'app.staging.leather.io'];

export async function refreshLeatherTabs() {
  if (!chrome.tabs) return;
  const tabs = await chrome.tabs.query({});

  tabs
    .filter(tab => {
      if (!tab.url) return false;
      const hostname = new URL(tab.url).hostname;
      return leatherDomains.includes(hostname) && isDefined(tab.id);
    })
    .map(tab => ({ tabId: tab.id ?? 0 }))
    .forEach(({ tabId }) => chrome.tabs.reload(tabId, { bypassCache: true }));
}
