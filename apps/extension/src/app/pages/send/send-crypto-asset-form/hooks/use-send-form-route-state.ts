import { useLocation } from 'react-router';

export function useSendFormRouteState() {
  const { state } = useLocation();
  return {
    amount: (state as any)?.amount ?? '',
    recipient: (state as any)?.recipient ?? '',
    ...state,
  };
}
