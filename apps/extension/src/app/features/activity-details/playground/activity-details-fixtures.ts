import { btcAsset, stxAsset } from '@leather.io/constants';
import { type BlockchainActivityItem, createBlockchainActivityItem } from '@leather.io/features';
import type { BlockchainActivity, OnChainActivityStatus, Sip10Asset } from '@leather.io/models';
import { createMoneyFromDecimal } from '@leather.io/utils';

import { activityViewDeps } from '@app/query/activity/blockchain-activity.query';

import {
  type SbtcDepositOverlay,
  createSbtcDepositOverlay,
} from '../../activity-list/sbtc-deposit-overlay';

export interface ActivityDetailsScenario {
  id: string;
  label: string;
  activity: BlockchainActivity;
  overlay?: SbtcDepositOverlay;
  requesterOrigin?: string;
}

export function createScenarioItem(
  activity: BlockchainActivity,
  status: OnChainActivityStatus
): BlockchainActivityItem {
  return createBlockchainActivityItem({ ...activity, status }, activityViewDeps);
}

const minute = 60;
const hour = 60 * minute;
const day = 24 * hour;

const now = Math.floor(Date.now() / 1000);

const stacksAddress = 'SP000000000000000000002Q6VF78ANYWAY0PLAY';
const bitcoinAddress = 'bc1q000000000000000000000000000000playbtc';

const usdcxAsset: Sip10Asset = {
  chain: 'stacks',
  category: 'fungible',
  protocol: 'sip10',
  name: 'USD Coin',
  symbol: 'USDCx',
  decimals: 6,
  hasMemo: false,
  canTransfer: true,
  assetId: 'usdcx',
  contractId: 'SP000000000000000000FAKE1.token-usdcx',
  imageCanonicalUri: '',
};

const notAsset: Sip10Asset = {
  ...usdcxAsset,
  name: 'Nothing Token',
  symbol: 'NOT',
  assetId: 'not',
  contractId: 'SP000000000000000000FAKE2.token-not',
};

const alexAsset: Sip10Asset = {
  ...usdcxAsset,
  name: 'ALEX',
  symbol: 'ALEX',
  assetId: 'alex',
  contractId: 'SP000000000000000000FAKE3.token-alex',
};

const ststxAsset: Sip10Asset = {
  ...usdcxAsset,
  name: 'Stacked STX',
  symbol: 'stSTX',
  assetId: 'ststx',
  contractId: 'SP000000000000000000FAKE4.ststx-token',
};

type FixtureAsset = Sip10Asset | typeof btcAsset | typeof stxAsset;

function sent(asset: FixtureAsset, crypto: number, quote: number) {
  return {
    direction: 'sent' as const,
    asset,
    amount: {
      crypto: createMoneyFromDecimal(crypto, asset.symbol, asset.decimals),
      quote: createMoneyFromDecimal(quote, 'USD'),
    },
  };
}

function received(asset: FixtureAsset, crypto: number, quote: number) {
  return {
    direction: 'received' as const,
    asset,
    amount: {
      crypto: createMoneyFromDecimal(crypto, asset.symbol, asset.decimals),
      quote: createMoneyFromDecimal(quote, 'USD'),
    },
  };
}

const sendStx: BlockchainActivity = {
  timestamp: now - 3 * hour,
  txid: '0xb14d0f1f4e1b52f3a1bb1b0d53d9d63d2c4dcd3e3b9e17c6d1f3a2ab0cd76e09d',
  blockHeight: 9009544,
  nonce: 512,
  fee: createMoneyFromDecimal(0.0003, 'STX', 6),
  status: 'success',
  chain: 'stacks',
  initiatedByUser: true,
  action: 'send',
  counterparty: stacksAddress,
  balanceChanges: [sent(stxAsset, 0.5, 0.14)],
};

const receiveBtc: BlockchainActivity = {
  timestamp: now - 26 * hour,
  txid: '7f3b1c2d4e5f60718293a4b5c6d7e8f90112233445566778899aabbccddeeff00',
  blockHeight: 872311,
  fee: createMoneyFromDecimal(0.00001, 'BTC', 8),
  status: 'success',
  chain: 'bitcoin',
  initiatedByUser: false,
  action: 'receive',
  counterparty: bitcoinAddress,
  balanceChanges: [received(btcAsset, 0.00198, 216.38)],
};

const swap: BlockchainActivity = {
  timestamp: now - 2 * day,
  txid: '0x5fdf1a9c7b2e4d6f8a0b1c2d3e4f5a6b7c8d9e0f1a2b3c4d5e6f7a8b9c0c791e',
  blockHeight: 9016598,
  nonce: 514,
  fee: createMoneyFromDecimal(0.002999, 'STX', 6),
  status: 'success',
  chain: 'stacks',
  initiatedByUser: true,
  action: 'swap',
  protocolName: 'Bitflow',
  contract: {
    type: 'call',
    contractId: 'SP000000000000000000FAKE5.router-stableswap-v-1-5',
    functionName: 'swap-helper-b',
  },
  balanceChanges: [sent(usdcxAsset, 1, 1), received(notAsset, 939250000, 1.05)],
};

const contractCall: BlockchainActivity = {
  timestamp: now - 12 * minute,
  txid: '0x2c9a4b7d1e3f5a6b8c0d2e4f6a8b0c1d3e5f7a9b1c3d5e7f9a1b3c5d7e9f0a2b',
  nonce: 519,
  fee: createMoneyFromDecimal(0.0041, 'STX', 6),
  status: 'pending',
  chain: 'stacks',
  initiatedByUser: true,
  action: 'contract-execution',
  protocolName: 'Zest Protocol',
  contract: {
    type: 'call',
    contractId: 'SP000000000000000000FAKE6.pool-borrow',
    functionName: 'supply',
  },
  balanceChanges: [
    sent(stxAsset, 250, 71.5),
    received(ststxAsset, 232.1, 71.9),
    received(alexAsset, 12.5, 0.42),
    received(notAsset, 1200000, 0.14),
  ],
};

const sbtcDeposit: BlockchainActivity = {
  timestamp: now - 40 * minute,
  txid: 'a1b2c3d4e5f60718293a4b5c6d7e8f90112233445566778899aabbccddeeff11',
  status: 'pending',
  chain: 'bitcoin',
  initiatedByUser: true,
  action: 'send',
  fee: createMoneyFromDecimal(0.000012, 'BTC', 8),
  balanceChanges: [sent(btcAsset, 0.005, 546.42)],
};

const contractDeploy: BlockchainActivity = {
  timestamp: now - 9 * day,
  txid: '0x3f5a7b9c1d3e5f7a9b1c3d5e7f9a1b3c5d7e9f1a3b5c7d9e1f3a5b7c9d1e3f5a',
  blockHeight: 8998120,
  nonce: 480,
  fee: createMoneyFromDecimal(0.35, 'STX', 6),
  status: 'success',
  chain: 'stacks',
  initiatedByUser: true,
  action: 'contract-deploy',
  contract: {
    type: 'deploy',
    contractId: 'SP000000000000000000002Q6VF78ANYWAY0PLAY.leather-vault-v1',
  },
  balanceChanges: [],
};

const sbtcDepositOverlay = createSbtcDepositOverlay('accepted');

export const activityDetailsScenarios: ActivityDetailsScenario[] = [
  { id: 'send', label: 'Send', activity: sendStx },
  { id: 'receive', label: 'Receive', activity: receiveBtc },
  {
    id: 'swap',
    label: 'Swap · two assets · requested by a dapp',
    activity: swap,
    requesterOrigin: 'app.bitflow.finance',
  },
  {
    id: 'contract-call',
    label: 'Contract call · four assets · requested by a dapp',
    activity: contractCall,
    requesterOrigin: 'app.zestprotocol.com',
  },
  { id: 'deploy', label: 'Contract deploy · no balance change', activity: contractDeploy },
  {
    id: 'sbtc',
    label: 'sBTC deposit',
    activity: sbtcDeposit,
    ...(sbtcDepositOverlay ? { overlay: sbtcDepositOverlay } : {}),
  },
];
