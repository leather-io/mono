export type ReceiveView = 'full' | 'collectible' | 'btc' | 'btc-taproot' | 'stx';

export interface ReceiveOutletContext {
  receiveView: ReceiveView | null;
  setReceiveView(this: void, view: ReceiveView | null): void;
}
