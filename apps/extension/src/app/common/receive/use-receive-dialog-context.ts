import { useOutletContext } from 'react-router';

import type { ReceiveOutletContext, ReceiveView } from './receive';

export function useReceiveDialog() {
  const { receiveView, setReceiveView } = useOutletContext<ReceiveOutletContext>();

  return {
    receiveView,
    setReceiveView,
    showReceive(view: ReceiveView = 'full') {
      setReceiveView(view);
    },
    hideReceive() {
      setReceiveView(null);
    },
  };
}
