import { useOutletContext } from 'react-router';

import type { ReceiveOutletContext, ReceiveView } from './receive';

export function useReceiveDialog() {
  const { receiveView, setReceiveView } = useOutletContext<ReceiveOutletContext>();

  function showReceive(view: ReceiveView = 'full') {
    setReceiveView(view);
  }

  function hideReceive() {
    setReceiveView(null);
  }

  return {
    receiveView,
    setReceiveView,
    showReceive,
    hideReceive,
  };
}
