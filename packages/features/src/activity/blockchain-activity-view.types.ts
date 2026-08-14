import type {
  CryptoAsset,
  CryptoAssetChain,
  Money,
  OnChainActivityStatus,
  StacksProtocolAction,
} from '@leather.io/models';

export type BlockchainActivityDirection = 'sent' | 'received';

export type BlockchainActivityIndicator =
  | 'pending'
  | 'failed'
  | 'sent'
  | 'received'
  | 'swap'
  | 'function';

export type BlockchainActivityAvatar =
  | { kind: 'single'; asset: CryptoAsset }
  | {
      kind: 'pair';
      back: { asset: CryptoAsset; dimmed: boolean };
      front: { asset: CryptoAsset; dimmed: boolean };
    }
  | { kind: 'icon'; icon: 'contract-call' | 'contract-deploy' };

export interface BlockchainActivityAmount {
  direction: BlockchainActivityDirection;
  quote: Money;
  crypto?: Money;
}

export interface BlockchainActivityView {
  key: string;
  txid: string;
  chain: CryptoAssetChain;
  timestamp: number;
  action: StacksProtocolAction;
  status: OnChainActivityStatus;
  avatar: BlockchainActivityAvatar;
  indicator: BlockchainActivityIndicator;
  title: string;
  subtitle: string;
  protocolName?: string;
  amount?: BlockchainActivityAmount;
}

export type BlockchainActivityTranslate = (
  template: string,
  values?: Record<string, string>
) => string;
