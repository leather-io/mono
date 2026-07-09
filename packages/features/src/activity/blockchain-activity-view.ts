import { stxAsset } from '@leather.io/constants';
import type {
  BlockchainActivity,
  BlockchainActivityBalanceChange,
  CryptoAsset,
  OnChainActivityStatus,
  StacksProtocolAction,
} from '@leather.io/models';
import { sumMoney, truncateMiddle } from '@leather.io/utils';

import type { FormatMoney } from './activity-balance';
import {
  buildBlockchainActivityDeployTitle,
  buildBlockchainActivitySubtitle,
  interpolateActivityTemplate,
} from './blockchain-activity-copy';
import type {
  BlockchainActivityAmount,
  BlockchainActivityAvatar,
  BlockchainActivityIndicator,
  BlockchainActivityTranslate,
  BlockchainActivityView,
} from './blockchain-activity-view.types';

type AssetSlot = 'sent' | 'received' | 'stx';

interface RowShape {
  avatar:
    | { kind: 'single'; from: AssetSlot }
    | { kind: 'pair' }
    | { kind: 'icon'; icon: 'contract-call' | 'contract-deploy' };
  indicator: 'sent' | 'received' | 'swap' | 'function';
  title:
    | { kind: 'symbol'; from: AssetSlot }
    | { kind: 'two-leg' }
    | { kind: 'symbol-pair'; from: 'sent' | 'received' }
    | { kind: 'function-name' }
    | { kind: 'deploy-verb' };
  amount:
    | { kind: 'none' }
    | { kind: 'single'; from: 'sent' | 'received' }
    | { kind: 'combined-quote'; from: 'sent' | 'received' };
}

const baseRowShapes: Record<StacksProtocolAction, RowShape> = {
  send: {
    avatar: { kind: 'single', from: 'sent' },
    indicator: 'sent',
    title: { kind: 'symbol', from: 'sent' },
    amount: { kind: 'single', from: 'sent' },
  },
  receive: {
    avatar: { kind: 'single', from: 'received' },
    indicator: 'received',
    title: { kind: 'symbol', from: 'received' },
    amount: { kind: 'single', from: 'received' },
  },
  'contract-execution': {
    avatar: { kind: 'icon', icon: 'contract-call' },
    indicator: 'function',
    title: { kind: 'function-name' },
    amount: { kind: 'none' },
  },
  'contract-deploy': {
    avatar: { kind: 'icon', icon: 'contract-deploy' },
    indicator: 'function',
    title: { kind: 'deploy-verb' },
    amount: { kind: 'none' },
  },
  swap: {
    avatar: { kind: 'pair' },
    indicator: 'swap',
    title: { kind: 'two-leg' },
    amount: { kind: 'none' },
  },
  bridge: {
    avatar: { kind: 'pair' },
    indicator: 'swap',
    title: { kind: 'two-leg' },
    amount: { kind: 'none' },
  },
  deposit: {
    avatar: { kind: 'single', from: 'sent' },
    indicator: 'sent',
    title: { kind: 'symbol', from: 'sent' },
    amount: { kind: 'single', from: 'sent' },
  },
  withdraw: {
    avatar: { kind: 'single', from: 'received' },
    indicator: 'received',
    title: { kind: 'symbol', from: 'received' },
    amount: { kind: 'single', from: 'received' },
  },
  'claim-rewards': {
    avatar: { kind: 'single', from: 'received' },
    indicator: 'received',
    title: { kind: 'symbol', from: 'received' },
    amount: { kind: 'single', from: 'received' },
  },
  'add-liquidity': {
    avatar: { kind: 'single', from: 'sent' },
    indicator: 'function',
    title: { kind: 'symbol', from: 'sent' },
    amount: { kind: 'single', from: 'sent' },
  },
  'remove-liquidity': {
    avatar: { kind: 'single', from: 'received' },
    indicator: 'function',
    title: { kind: 'symbol', from: 'received' },
    amount: { kind: 'single', from: 'received' },
  },
  'stake-lp': {
    avatar: { kind: 'single', from: 'sent' },
    indicator: 'sent',
    title: { kind: 'symbol', from: 'sent' },
    amount: { kind: 'none' },
  },
  'unstake-lp': {
    avatar: { kind: 'single', from: 'received' },
    indicator: 'received',
    title: { kind: 'symbol', from: 'received' },
    amount: { kind: 'none' },
  },
  stack: {
    avatar: { kind: 'single', from: 'stx' },
    indicator: 'sent',
    title: { kind: 'symbol', from: 'stx' },
    amount: { kind: 'single', from: 'sent' },
  },
  'initiate-unstack': {
    avatar: { kind: 'single', from: 'stx' },
    indicator: 'function',
    title: { kind: 'symbol', from: 'stx' },
    amount: { kind: 'none' },
  },
  'complete-unstack': {
    avatar: { kind: 'single', from: 'stx' },
    indicator: 'function',
    title: { kind: 'symbol', from: 'stx' },
    amount: { kind: 'single', from: 'received' },
  },
  'liquid-stack': {
    avatar: { kind: 'pair' },
    indicator: 'function',
    title: { kind: 'two-leg' },
    amount: { kind: 'none' },
  },
  'liquid-unstack': {
    avatar: { kind: 'pair' },
    indicator: 'function',
    title: { kind: 'two-leg' },
    amount: { kind: 'none' },
  },
  borrow: {
    avatar: { kind: 'single', from: 'received' },
    indicator: 'received',
    title: { kind: 'symbol', from: 'received' },
    amount: { kind: 'single', from: 'received' },
  },
  repay: {
    avatar: { kind: 'single', from: 'sent' },
    indicator: 'sent',
    title: { kind: 'symbol', from: 'sent' },
    amount: { kind: 'single', from: 'sent' },
  },
};

const twoTokenAddLiquidity: RowShape = {
  avatar: { kind: 'pair' },
  indicator: 'function',
  title: { kind: 'symbol-pair', from: 'sent' },
  amount: { kind: 'combined-quote', from: 'sent' },
};

const twoTokenRemoveLiquidity: RowShape = {
  avatar: { kind: 'pair' },
  indicator: 'function',
  title: { kind: 'symbol-pair', from: 'received' },
  amount: { kind: 'combined-quote', from: 'received' },
};

const degradedAvatar: BlockchainActivityAvatar = { kind: 'icon', icon: 'contract-call' };

function getRowShape(
  action: StacksProtocolAction,
  sent: BlockchainActivityBalanceChange[],
  received: BlockchainActivityBalanceChange[]
): RowShape {
  if (action === 'add-liquidity' && sent.length >= 2) return twoTokenAddLiquidity;
  if (action === 'remove-liquidity' && received.length >= 2) return twoTokenRemoveLiquidity;
  return baseRowShapes[action];
}

function assetSymbol(asset: CryptoAsset): string {
  return asset.category === 'fungible' ? asset.symbol : '';
}

function pickAsset(
  slot: AssetSlot,
  sent: BlockchainActivityBalanceChange[],
  received: BlockchainActivityBalanceChange[]
): CryptoAsset | null {
  if (slot === 'stx') return stxAsset;
  if (slot === 'sent') return sent[0]?.asset ?? null;
  return received[0]?.asset ?? null;
}

function buildPairAvatar(
  sent: BlockchainActivityBalanceChange[],
  received: BlockchainActivityBalanceChange[]
): BlockchainActivityAvatar | null {
  if (sent.length >= 1 && received.length >= 1) {
    return {
      kind: 'pair',
      back: { asset: sent[0].asset, dimmed: true },
      front: { asset: received[0].asset, dimmed: false },
    };
  }
  if (sent.length >= 2) {
    return {
      kind: 'pair',
      back: { asset: sent[0].asset, dimmed: false },
      front: { asset: sent[1].asset, dimmed: false },
    };
  }
  if (received.length >= 2) {
    return {
      kind: 'pair',
      back: { asset: received[0].asset, dimmed: false },
      front: { asset: received[1].asset, dimmed: false },
    };
  }
  return null;
}

function buildAvatar(
  shape: RowShape,
  sent: BlockchainActivityBalanceChange[],
  received: BlockchainActivityBalanceChange[]
): BlockchainActivityAvatar {
  switch (shape.avatar.kind) {
    case 'icon':
      return { kind: 'icon', icon: shape.avatar.icon };
    case 'single': {
      const asset = pickAsset(shape.avatar.from, sent, received);
      return asset ? { kind: 'single', asset } : degradedAvatar;
    }
    case 'pair':
      return buildPairAvatar(sent, received) ?? degradedAvatar;
    default:
      return degradedAvatar;
  }
}

function degradedTitle(activity: BlockchainActivity): string {
  return activity.contract?.type === 'call' ? activity.contract.functionName : '';
}

function buildTitle(
  shape: RowShape,
  activity: BlockchainActivity,
  sent: BlockchainActivityBalanceChange[],
  received: BlockchainActivityBalanceChange[],
  formatMoney: FormatMoney,
  t: BlockchainActivityTranslate
): string {
  switch (shape.title.kind) {
    case 'symbol': {
      const asset = pickAsset(shape.title.from, sent, received);
      return asset ? assetSymbol(asset) : degradedTitle(activity);
    }
    case 'two-leg': {
      if (sent.length >= 1 && received.length >= 1) {
        const from = `${formatMoney(sent[0].amount.crypto)} ${assetSymbol(sent[0].asset)}`;
        const to = `${formatMoney(received[0].amount.crypto)} ${assetSymbol(received[0].asset)}`;
        return `${from} → ${to}`;
      }
      return degradedTitle(activity);
    }
    case 'symbol-pair': {
      const changes = shape.title.from === 'sent' ? sent : received;
      return changes.length >= 2
        ? `${assetSymbol(changes[0].asset)} · ${assetSymbol(changes[1].asset)}`
        : degradedTitle(activity);
    }
    case 'function-name':
      return degradedTitle(activity);
    case 'deploy-verb':
      return buildBlockchainActivityDeployTitle(activity.status, t);
    default:
      return degradedTitle(activity);
  }
}

function buildAmount(
  shape: RowShape,
  sent: BlockchainActivityBalanceChange[],
  received: BlockchainActivityBalanceChange[]
): BlockchainActivityAmount | undefined {
  switch (shape.amount.kind) {
    case 'none':
      return undefined;
    case 'single': {
      const change = (shape.amount.from === 'sent' ? sent : received)[0];
      if (!change) return undefined;
      return {
        direction: change.direction,
        quote: change.amount.quote,
        crypto: change.amount.crypto,
      };
    }
    case 'combined-quote': {
      const changes = shape.amount.from === 'sent' ? sent : received;
      if (changes.length === 0) return undefined;
      return { direction: shape.amount.from, quote: sumMoney(changes.map(c => c.amount.quote)) };
    }
    default:
      return undefined;
  }
}

function resolveIndicator(
  status: OnChainActivityStatus,
  successIndicator: RowShape['indicator']
): BlockchainActivityIndicator {
  if (status === 'pending') return 'pending';
  if (status === 'failed') return 'failed';
  return successIndicator;
}

function getContractName(activity: BlockchainActivity): string | undefined {
  return activity.contract ? activity.contract.contractId.split('.')[1] : undefined;
}

function truncateCounterparty(counterparty: string): string {
  const truncated = truncateMiddle(counterparty);
  return truncated.length < counterparty.length ? truncated : counterparty;
}

export function createBlockchainActivityView(
  activity: BlockchainActivity,
  deps: { formatMoney: FormatMoney; translate?: BlockchainActivityTranslate }
): BlockchainActivityView {
  const t = deps.translate ?? interpolateActivityTemplate;
  const { formatMoney } = deps;

  const sent = activity.balanceChanges.filter(change => change.direction === 'sent');
  const received = activity.balanceChanges.filter(change => change.direction === 'received');
  const shape = getRowShape(activity.action, sent, received);

  const amount = buildAmount(shape, sent, received);

  return {
    key: `${activity.chain}:${activity.txid}`,
    txid: activity.txid,
    chain: activity.chain,
    timestamp: activity.timestamp,
    action: activity.action,
    status: activity.status,
    avatar: buildAvatar(shape, sent, received),
    indicator: resolveIndicator(activity.status, shape.indicator),
    title: buildTitle(shape, activity, sent, received, formatMoney, t),
    subtitle: buildBlockchainActivitySubtitle(
      {
        action: activity.action,
        status: activity.status,
        protocolName: activity.protocolName,
        counterparty: activity.counterparty
          ? truncateCounterparty(activity.counterparty)
          : undefined,
        contractName: getContractName(activity),
      },
      t
    ),
    ...(amount ? { amount } : {}),
  };
}
