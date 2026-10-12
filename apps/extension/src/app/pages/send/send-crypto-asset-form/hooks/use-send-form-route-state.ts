import { useLocation } from 'react-router';

function isRouteStateRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

export function useSendFormRouteState() {
  const location = useLocation();
  const state: unknown = location.state;
  return {
    amount: '',
    recipient: '',
    ...(isRouteStateRecord(state) ? state : {}),
  };
}
