import type { OnChainActivityStatus, StacksProtocolAction } from '@leather.io/models';

import type { BlockchainActivityTranslate } from './blockchain-activity-view.types';

export function interpolateActivityTemplate(
  template: string,
  values: Record<string, string> = {}
): string {
  return template.replace(/{(\w+)}/g, (_match, key) => values[key] ?? '');
}

type StatusTemplates = Record<OnChainActivityStatus, string>;

const protocolActionSubtitles: Partial<Record<StacksProtocolAction, StatusTemplates>> = {
  swap: {
    pending: 'Swapping via {protocol}',
    success: 'Swapped via {protocol}',
    failed: 'Swap failed via {protocol}',
  },
  bridge: {
    pending: 'Swapping via {protocol}',
    success: 'Swapped via {protocol}',
    failed: 'Swap failed via {protocol}',
  },
  deposit: {
    pending: 'Depositing via {protocol}',
    success: 'Deposited via {protocol}',
    failed: 'Deposit failed via {protocol}',
  },
  withdraw: {
    pending: 'Withdrawing via {protocol}',
    success: 'Withdrew via {protocol}',
    failed: 'Withdraw failed via {protocol}',
  },
  'claim-rewards': {
    pending: 'Claiming rewards via {protocol}',
    success: 'Claimed rewards via {protocol}',
    failed: 'Claim rewards failed via {protocol}',
  },
  'add-liquidity': {
    pending: 'Adding liquidity via {protocol}',
    success: 'Added liquidity via {protocol}',
    failed: 'Add liquidity failed via {protocol}',
  },
  'remove-liquidity': {
    pending: 'Removing liquidity via {protocol}',
    success: 'Removed liquidity via {protocol}',
    failed: 'Remove liquidity failed via {protocol}',
  },
  'stake-lp': {
    pending: 'Staking LP tokens via {protocol}',
    success: 'Staked LP tokens via {protocol}',
    failed: 'Stake LP tokens failed via {protocol}',
  },
  'unstake-lp': {
    pending: 'Unstaking LP tokens via {protocol}',
    success: 'Unstaked LP tokens via {protocol}',
    failed: 'Unstake LP tokens failed via {protocol}',
  },
  stack: {
    pending: 'Stacking via {protocol}',
    success: 'Stacked via {protocol}',
    failed: 'Stacking failed via {protocol}',
  },
  'initiate-unstack': {
    pending: 'Initiating unstack via {protocol}',
    success: 'Initiated unstack via {protocol}',
    failed: 'Initiate unstack failed via {protocol}',
  },
  'complete-unstack': {
    pending: 'Completing unstack via {protocol}',
    success: 'Completed unstack via {protocol}',
    failed: 'Complete unstack failed via {protocol}',
  },
  'liquid-stack': {
    pending: 'Liquid stacking via {protocol}',
    success: 'Liquid stacked via {protocol}',
    failed: 'Liquid stack failed via {protocol}',
  },
  'liquid-unstack': {
    pending: 'Liquid unstacking via {protocol}',
    success: 'Liquid unstacked via {protocol}',
    failed: 'Liquid unstack failed via {protocol}',
  },
  borrow: {
    pending: 'Borrowing via {protocol}',
    success: 'Borrowed via {protocol}',
    failed: 'Borrow failed via {protocol}',
  },
  repay: {
    pending: 'Repaying via {protocol}',
    success: 'Repaid via {protocol}',
    failed: 'Repay failed via {protocol}',
  },
};

const transferSubtitles: Record<'sent' | 'received', StatusTemplates> = {
  sent: {
    pending: 'Sending to {counterparty}',
    success: 'Sent to {counterparty}',
    failed: 'Sending failed to {counterparty}',
  },
  received: {
    pending: 'Receiving from {counterparty}',
    success: 'Received from {counterparty}',
    failed: 'Receive failed from {counterparty}',
  },
};

const transferSubtitlesWithoutCounterparty: Record<'sent' | 'received', StatusTemplates> = {
  sent: {
    pending: 'Sending',
    success: 'Sent',
    failed: 'Sending failed',
  },
  received: {
    pending: 'Receiving',
    success: 'Received',
    failed: 'Receive failed',
  },
};

const deployTitles: StatusTemplates = {
  pending: 'Deploying',
  success: 'Deployed',
  failed: 'Deploy failed',
};

const viaProtocolSuffix = ' via {protocol}';

const protocolActionTitles: Partial<Record<StacksProtocolAction, string>> = {
  swap: 'Swap',
  bridge: 'Bridge',
  deposit: 'Deposit',
  withdraw: 'Withdraw',
  'claim-rewards': 'Claim rewards',
  'add-liquidity': 'Add liquidity',
  'remove-liquidity': 'Remove liquidity',
  'stake-lp': 'Stake LP',
  'unstake-lp': 'Unstake LP',
  stack: 'Stack',
  'initiate-unstack': 'Initiate unstack',
  'complete-unstack': 'Complete unstack',
  'liquid-stack': 'Liquid stack',
  'liquid-unstack': 'Liquid unstack',
  borrow: 'Borrow',
  repay: 'Repay',
};

export function buildBlockchainActivityActionTitle(
  action: StacksProtocolAction,
  t: BlockchainActivityTranslate
): string {
  const title = protocolActionTitles[action];
  return title ? t(title) : '';
}

interface SubtitleParams {
  action: StacksProtocolAction;
  status: OnChainActivityStatus;
  protocolName?: string;
  counterparty?: string;
  contractName?: string;
  actionInTitle?: boolean;
}

export function buildBlockchainActivitySubtitle(
  params: SubtitleParams,
  t: BlockchainActivityTranslate
): string {
  const { action, status, protocolName, counterparty, contractName, actionInTitle } = params;

  switch (action) {
    case 'send':
      return counterparty
        ? t(transferSubtitles.sent[status], { counterparty })
        : t(transferSubtitlesWithoutCounterparty.sent[status]);
    case 'receive':
      return counterparty
        ? t(transferSubtitles.received[status], { counterparty })
        : t(transferSubtitlesWithoutCounterparty.received[status]);
    case 'contract-execution':
      return protocolName
        ? t('{contract} - {protocol}', { protocol: protocolName, contract: contractName ?? '' })
        : t('{contract}', { contract: contractName ?? '' });
    case 'contract-deploy':
      return t('{contract}', { contract: contractName ?? '' });
    default: {
      const entry = protocolActionSubtitles[action];
      if (!entry) return '';
      if (actionInTitle) {
        return protocolName ? t('via {protocol}', { protocol: protocolName }) : '';
      }
      const template = protocolName ? entry[status] : entry[status].replace(viaProtocolSuffix, '');
      return t(template, protocolName ? { protocol: protocolName } : {});
    }
  }
}

export function buildBlockchainActivityDeployTitle(
  status: OnChainActivityStatus,
  t: BlockchainActivityTranslate
): string {
  return t(deployTitles[status]);
}
