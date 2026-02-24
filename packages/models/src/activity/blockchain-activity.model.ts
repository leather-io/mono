import { CryptoAsset, CryptoAssetChain } from '../assets/asset.model';
import { Money } from '../money.model';
import { StacksProtocolAction, StacksProtocolId } from '../protocols/stacks-protocol.model';
import { OnChainActivityStatus } from './activity-status.model';

export interface BlockchainActivityContractCall {
  readonly type: 'call';
  readonly contractId: string;
  readonly functionName: string;
  readonly protocol?: StacksProtocolId;
  readonly action?: StacksProtocolAction;
}

export interface BlockchainActivityContractDeploy {
  readonly type: 'deploy';
  readonly contractId: string;
}

export type BlockchainActivityEventAction = 'sent' | 'received' | 'locked' | 'minted' | 'burned';

export interface BlockchainActivityEvent {
  readonly action: BlockchainActivityEventAction;
  readonly asset: CryptoAsset;
  readonly counterparty?: string;
  readonly amount: {
    readonly crypto: Money;
    readonly quote: Money;
  };
}

export interface BlockchainActivity {
  readonly timestamp: number;
  readonly txid: string;
  readonly blockHeight?: number;
  readonly fee?: Money;
  readonly status: OnChainActivityStatus;
  readonly chain: CryptoAssetChain;
  readonly initiatedByUser: boolean;
  readonly events: BlockchainActivityEvent[];
  readonly contract?: BlockchainActivityContractCall | BlockchainActivityContractDeploy;
}
