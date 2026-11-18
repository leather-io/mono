import { type CryptoAsset, type CryptoAssetChain } from '../assets/asset.model';
import { type Money } from '../money.model';
import {
  type StacksProtocolAction,
  type StacksProtocolId,
} from '../protocols/stacks-protocol.model';
import { type OnChainActivityStatus } from './activity-status.model';

export interface BlockchainActivityContractCall {
  readonly type: 'call';
  readonly contractId: string;
  readonly functionName: string;
}

export interface BlockchainActivityContractDeploy {
  readonly type: 'deploy';
  readonly contractId: string;
}

export type BlockchainActivityBalanceChangeDirection = 'sent' | 'received';

export interface BlockchainActivityBalanceChange {
  readonly direction: BlockchainActivityBalanceChangeDirection;
  readonly asset: CryptoAsset;
  readonly amount: {
    readonly crypto: Money;
    readonly quote: Money;
  };
}

export interface BlockchainActivity {
  readonly timestamp: number;
  readonly txid: string;
  readonly blockHeight?: number;
  readonly nonce?: number;
  readonly fee?: Money;
  readonly status: OnChainActivityStatus;
  readonly chain: CryptoAssetChain;
  readonly initiatedByUser: boolean;
  readonly action: StacksProtocolAction;
  readonly protocol?: StacksProtocolId;
  readonly protocolName?: string;
  readonly counterparty?: string;
  readonly balanceChanges: BlockchainActivityBalanceChange[];
  readonly contract?: BlockchainActivityContractCall | BlockchainActivityContractDeploy;
}
