export type ReceiveView = 'full' | 'collectible' | 'btc' | 'btc-taproot' | 'stx';

export interface ReceiveOutletContext {
  receiveView: ReceiveView | null;
  setReceiveView(view: ReceiveView | null): void;
}
