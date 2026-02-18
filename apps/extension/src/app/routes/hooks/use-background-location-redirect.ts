import { useEffect } from 'react';
import { useSelector } from 'react-redux';

import { RouteUrls } from '@shared/route-urls';

import { type RootState, useAppDispatch } from '@app/store';
import { modalNavigationSlice } from '@app/store/navigation/modal-navigation.slice';

/**
 * If routes are accessed directly / opened in new tabs `backgroundLocation` is lost
 * this hook sets the background location in Redux so the modal overlay renders correctly
 */

export function useBackgroundLocationRedirect(baseUrl = RouteUrls.Home) {
  const dispatch = useAppDispatch();
  const backgroundPathname = useSelector(
    (state: RootState) => state.navigation.modal.backgroundLocationPathname
  );

  useEffect(() => {
    if (!backgroundPathname) {
      dispatch(modalNavigationSlice.actions.setBackgroundLocationPathname(baseUrl));
    }
  }, [backgroundPathname, baseUrl, dispatch]);
}
