import { useSelector } from 'react-redux';

import type { RootState } from '@app/store';

export function useSendFormRouteState() {
  const sendFormRouteState = useSelector(
    (state: RootState) => state.navigation.send.sendFormRouteState
  );
  return {
    amount: sendFormRouteState?.amount ?? '',
    recipient: sendFormRouteState?.recipient ?? '',
  };
}
