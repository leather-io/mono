import type { VaultActivityItem } from '~/features/multisig/activity/harmonize-vault-activity';

import type { BlockchainActivityIndicator, BlockchainActivityView } from '@leather.io/features';
import type { MultisigTransactionSummary, Sip10Asset, StxAsset } from '@leather.io/models';
import { createMoneyFromDecimal } from '@leather.io/utils';

// Hand-authored activity items mirroring the live multisig dashboard feed
// (mixed sends/receives across tokens, plus in-flight proposals), so the
// current rendering and any proposed treatment can be compared on the same
// realistic data.
const stxAsset: StxAsset = {
  chain: 'stacks',
  category: 'fungible',
  protocol: 'nativeStx',
  name: 'Stacks',
  symbol: 'STX',
  decimals: 6,
  hasMemo: true,
};

function sip10(name: string, symbol: string, decimals = 6): Sip10Asset {
  return {
    chain: 'stacks',
    category: 'fungible',
    protocol: 'sip10',
    name,
    symbol,
    decimals,
    hasMemo: false,
    canTransfer: true,
    assetId: `${symbol.toLowerCase()}-token`,
    contractId: `SP000000000000000000002Q6VF78.${symbol.toLowerCase()}-token`,
    imageCanonicalUri: '',
  };
}

const nowSeconds = Math.floor(Date.now() / 1000);
const SENDER = 'SP3TB3REBQ8BXW9CQ0N0KVYWH3NM3E00005ZP2H';
// Matches the web activity feed's compact counterparty (first/last three).
const shortSender = `${SENDER.slice(0, 3)}…${SENDER.slice(-3)}`;

interface MockViewInput {
  key: string;
  title: string;
  subtitle: string;
  indicator: BlockchainActivityIndicator;
  asset: StxAsset | Sip10Asset;
  minutesAgo: number;
  quoteUsd?: number;
  cryptoAmount?: number;
  cryptoSymbol?: string;
  status?: BlockchainActivityView['status'];
}

function view(input: MockViewInput): BlockchainActivityView {
  const direction = input.indicator === 'received' ? 'received' : 'sent';
  return {
    key: input.key,
    txid: `0x${input.key}`,
    chain: 'stacks',
    timestamp: nowSeconds - input.minutesAgo * 60,
    action: direction === 'received' ? 'receive' : 'send',
    status: input.status ?? 'success',
    avatar: { kind: 'single', asset: input.asset },
    indicator: input.indicator,
    title: input.title,
    subtitle: input.subtitle,
    amount:
      input.quoteUsd !== undefined
        ? {
            direction,
            quote: createMoneyFromDecimal(input.quoteUsd, 'USD'),
            crypto:
              input.cryptoAmount !== undefined
                ? createMoneyFromDecimal(
                    input.cryptoAmount,
                    input.cryptoSymbol ?? 'STX',
                    input.asset.decimals
                  )
                : undefined,
          }
        : undefined,
  };
}

function proposal(
  id: string,
  status: MultisigTransactionSummary['status'],
  approvalCount: number,
  signedByMe: boolean,
  minutesAgo: number
): VaultActivityItem['multisig'] {
  const transaction: MultisigTransactionSummary = {
    id,
    vaultAccountId: 'account-playground',
    network: 'stx:mainnet',
    proposerUserId: 'u1',
    proposalTimestamp: nowSeconds - minutesAgo * 60,
    nonce: null,
    txId: null,
    status,
    broadcastAt: null,
    createdAt: '',
    updatedAt: '',
    approvalCount,
    signedByMe,
  };
  return {
    transaction,
    payloadContext: {
      network: 'stx:mainnet',
      multisigAddress: 'SM2J6ZY48GV1EZ5V2V5RB9MP66SW86PYKKQABCDEFG',
    },
    vaultId: 'vault-playground',
    vaultName: 'Team Treasury',
    threshold: 2,
  };
}

export const mockVaultNames = new Map([['vault-playground', 'Team Treasury']]);
export const mockAccountNames = new Map([['account-playground', 'Operating account']]);
export const mockAccountThresholds = new Map([['account-playground', '2 of 3']]);

export const mockActivityItems: VaultActivityItem[] = [
  {
    view: view({
      key: 'a1',
      title: 'Send STX',
      subtitle: 'Sending to SP3T…5ZP2H',
      indicator: 'pending',
      asset: stxAsset,
      minutesAgo: 12,
      quoteUsd: 79.6,
      cryptoAmount: 40,
      status: 'pending',
    }),
    multisig: proposal('tx-a1', 'pending', 1, false, 12),
    vaultId: 'vault-playground',
    vaultAccountId: 'account-playground',
  },
  {
    view: view({
      key: 'a2',
      title: 'Send sBTC',
      subtitle: 'Sending to SP3T…5ZP2H',
      indicator: 'pending',
      asset: sip10('sBTC', 'sBTC', 8),
      minutesAgo: 45,
      quoteUsd: 2810,
      cryptoAmount: 0.0425,
      cryptoSymbol: 'sBTC',
      status: 'pending',
    }),
    multisig: proposal('tx-a2', 'pending', 1, false, 45),
    vaultId: 'vault-playground',
    vaultAccountId: 'account-playground',
  },
  {
    view: view({
      key: 'a3',
      title: 'Send stSTX',
      subtitle: 'Sending to SP3T…5ZP2H',
      indicator: 'pending',
      asset: sip10('Stacked STX', 'stSTX'),
      minutesAgo: 90,
      quoteUsd: 0.02,
      cryptoAmount: 0.1,
      cryptoSymbol: 'stSTX',
      status: 'pending',
    }),
    multisig: proposal('tx-a3', 'broadcast', 2, true, 90),
    vaultId: 'vault-playground',
    vaultAccountId: 'account-playground',
  },
  {
    view: view({
      key: 'a4',
      title: 'Receive NOT',
      subtitle: `Received from ${shortSender}`,
      indicator: 'received',
      asset: sip10('Nothing', 'NOT'),
      minutesAgo: 60 * 5,
      quoteUsd: 0.01,
      cryptoAmount: 100000,
      cryptoSymbol: 'NOT',
    }),
    vaultId: 'vault-playground',
    vaultAccountId: 'account-playground',
  },
  {
    view: view({
      key: 'a5',
      title: 'Receive USDh',
      subtitle: `Received from ${shortSender}`,
      indicator: 'received',
      asset: sip10('Hermetica USDh', 'USDh'),
      minutesAgo: 60 * 8,
      quoteUsd: 1,
      cryptoAmount: 1,
      cryptoSymbol: 'USDh',
    }),
    vaultId: 'vault-playground',
    vaultAccountId: 'account-playground',
  },
  {
    view: view({
      key: 'a6',
      title: 'Receive sBTC',
      subtitle: `Received from ${shortSender}`,
      indicator: 'received',
      asset: sip10('sBTC', 'sBTC', 8),
      minutesAgo: 60 * 26,
      quoteUsd: 4.14,
      cryptoAmount: 0.00006,
      cryptoSymbol: 'sBTC',
    }),
    vaultId: 'vault-playground',
    vaultAccountId: 'account-playground',
  },
  {
    view: view({
      key: 'a7',
      title: 'Send stSTX',
      subtitle: 'Sent to SP3T…5ZP2H',
      indicator: 'sent',
      asset: sip10('Stacked STX', 'stSTX'),
      minutesAgo: 60 * 30,
      quoteUsd: 0.01,
      cryptoAmount: 0.001,
      cryptoSymbol: 'stSTX',
    }),
    vaultId: 'vault-playground',
    vaultAccountId: 'account-playground',
  },
  {
    view: view({
      key: 'a9',
      title: 'Stack STX',
      subtitle: 'Stacked via StackingDAO',
      indicator: 'function',
      asset: stxAsset,
      minutesAgo: 60 * 36,
      quoteUsd: 41.25,
      cryptoAmount: 250,
    }),
    vaultId: 'vault-playground',
    vaultAccountId: 'account-playground',
  },
  {
    view: view({
      key: 'a8',
      title: 'Receive STX',
      subtitle: `Received from ${shortSender}`,
      indicator: 'received',
      asset: stxAsset,
      minutesAgo: 60 * 49,
      quoteUsd: 0.66,
      cryptoAmount: 4,
    }),
    vaultId: 'vault-playground',
    vaultAccountId: 'account-playground',
  },
];
