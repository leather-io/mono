import type { BigNumber } from 'bignumber.js';

import { AccountId } from '../account.model';
import { CryptoAssetInfo } from '../crypto-assets/crypto-asset-info.model';
import { Money } from '../money.model';
import { ActivityLevel } from './activity-level.model';
import { OnChainActivityStatus } from './activity-status.model';
import {
  ActivityType,
  GeneralActivityType,
  OnChainActivityType,
  WalletActivityType,
} from './activity-type.model';

export interface BaseActivity {
  readonly level: ActivityLevel;
  readonly type: ActivityType;
  readonly timestamp: number;
}

export interface AccountLevelActivity extends BaseActivity {
  readonly level: 'account';
  readonly account: AccountId;
}

export interface AppLevelActivity extends BaseActivity {
  readonly level: 'app';
}

// On-Chain Activity
export interface BaseOnChainActivity extends AccountLevelActivity {
  readonly type: OnChainActivityType;
  readonly txid: string;
  readonly status: OnChainActivityStatus;
}

export interface DeploySmartContractActivity extends BaseOnChainActivity {
  readonly type: 'deploySmartContract';
  readonly contractId: string;
}

export interface ExecuteSmartContractActivity extends BaseOnChainActivity {
  readonly type: 'executeSmartContract';
  readonly contractId: string;
  readonly functionName: string;
}

export interface LockAssetActivity extends BaseOnChainActivity {
  readonly type: 'lockAsset';
  readonly asset: CryptoAssetInfo;
  readonly amount: BigNumber;
  readonly value?: {
    crypto: Money;
    quote: Money;
  };
}

export interface SendAssetActivity extends BaseOnChainActivity {
  readonly type: 'sendAsset';
  readonly asset: CryptoAssetInfo;
  readonly receivers: string[];
  readonly amount: BigNumber;
  readonly value?: {
    crypto: Money;
    quote: Money;
  };
}

export interface ReceiveAssetActivity extends BaseOnChainActivity {
  readonly type: 'receiveAsset';
  readonly asset: CryptoAssetInfo;
  readonly senders: string[];
  readonly amount: BigNumber;
  readonly value?: {
    crypto: Money;
    quote: Money;
  };
}

export interface SwapAssetsActivity extends BaseOnChainActivity {
  readonly type: 'swapAssets';
  readonly fromAsset: CryptoAssetInfo;
  readonly fromAmount: BigNumber;
  readonly fromValue?: {
    crypto: Money;
    quote: Money;
  };
  readonly toAsset: CryptoAssetInfo;
  readonly toAmount: BigNumber;
  readonly toValue?: {
    crypto: Money;
    quote: Money;
  };
}

// Wallet Activity
export interface BaseWalletActivity extends AccountLevelActivity {
  readonly type: WalletActivityType;
}

export interface ConnectAppActivity extends BaseWalletActivity {
  readonly type: 'connectApp';
  readonly appName: string;
  readonly appUrl: string;
}

export interface SignMessageActivity extends BaseWalletActivity {
  readonly type: 'signMessage';
  readonly appName: string;
  readonly appUrl: string;
}

// General Activity
export interface GeneralActivity extends AppLevelActivity {
  readonly type: GeneralActivityType;
  readonly title: string;
  readonly message: string;
}

export type OnChainActivity =
  | DeploySmartContractActivity
  | ExecuteSmartContractActivity
  | LockAssetActivity
  | SendAssetActivity
  | ReceiveAssetActivity
  | SwapAssetsActivity;
export type WalletActivity = ConnectAppActivity | SignMessageActivity;
export type Activity = OnChainActivity | WalletActivity | GeneralActivity;
