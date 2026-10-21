export type HardwareWalletInteraction =
  | { type: 'none' }
  | { type: 'unlock-device' }
  | { type: 'open-app'; appName: string | null }
  | { type: 'confirm-on-device' }
  | { type: 'approve-policy' }
  | { type: 'verify-address' }
  | { type: 'show-qr'; payload: string }
  | { type: 'scan-qr' };

export type HardwareWalletInteractionType = HardwareWalletInteraction['type'];

export interface OperationContext {
  signal?: AbortSignal;
  onInteraction?(interaction: HardwareWalletInteraction): void;
}
