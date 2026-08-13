import { useQuery } from '@tanstack/react-query';
import { useUserSettings } from '~/hooks/use-user-settings';
import { useBlockchainActivityByTxIdDetailQuery } from '~/queries/activity/blockchain-activity.query';

import type { BlockchainActivityItem } from '@leather.io/features';
import type {
  AuthNetworkId,
  BitcoinTransaction,
  BlockchainActivity,
  Money,
  VaultAccount,
} from '@leather.io/models';
import { createBitcoinTransactionByTxIdQueryConfig } from '@leather.io/queries';
import { createMoney } from '@leather.io/utils';

import { getMultisigAccountAddresses } from '../vaults/multisig-account-addresses';

type OnChainStatus = 'confirmed' | 'pending' | 'failed';

interface OnChainTransaction {
  recipient?: string;
  amount?: Money;
  fee?: Money;
  nonce?: number;
  status?: OnChainStatus;
}

interface OnChainTransactionResult extends OnChainTransaction {
  detail?: BlockchainActivityItem;
  isLoading: boolean;
}

function activityStatus(status: BlockchainActivity['status']): OnChainStatus {
  if (status === 'success') return 'confirmed';
  if (status === 'pending') return 'pending';
  return 'failed';
}

function normalizeStacksActivity(activity: BlockchainActivity): OnChainTransaction {
  const base = {
    fee: activity.fee,
    nonce: activity.nonce,
    status: activityStatus(activity.status),
  };
  if (activity.contract !== undefined) return base;
  const stxSent = activity.balanceChanges.find(
    change => change.direction === 'sent' && change.asset.protocol === 'nativeStx'
  );
  return {
    ...base,
    recipient: activity.counterparty,
    amount: stxSent?.amount.crypto,
  };
}

function normalizeBitcoinTransaction(
  tx: BitcoinTransaction,
  multisigAddress: string
): OnChainTransaction {
  const recipientOutput = tx.vout.find(
    output => output.address && output.address !== multisigAddress
  );
  const inputTotal = tx.vin.reduce((sum, input) => sum + Number(input.value), 0);
  const outputTotal = tx.vout.reduce((sum, output) => sum + Number(output.value), 0);
  return {
    recipient: recipientOutput?.address,
    amount: recipientOutput ? createMoney(Number(recipientOutput.value), 'BTC') : undefined,
    fee: createMoney(Math.max(inputTotal - outputTotal, 0), 'BTC'),
    status: tx.height ? 'confirmed' : 'pending',
  };
}

// Enriches a broadcast multisig transaction with on-chain data (recipient,
// amount, fee, and the canonical chain status) by looking it up by txId. Returns
// an empty object until the transaction has a txId — i.e. before broadcast there
// is nothing on-chain to read.
export function useOnChainTransaction(
  network: AuthNetworkId,
  txId: string | null,
  account: VaultAccount | undefined
): OnChainTransactionResult {
  const settings = useUserSettings();
  const isBitcoin = network.startsWith('btc');

  const stxActivity = useBlockchainActivityByTxIdDetailQuery(
    getMultisigAccountAddresses(account),
    txId ?? '',
    settings,
    Boolean(txId && account) && !isBitcoin
  );
  const btcQuery = useQuery({
    ...createBitcoinTransactionByTxIdQueryConfig(txId ?? '', settings),
    enabled: Boolean(txId) && isBitcoin,
  });

  if (isBitcoin) {
    return {
      ...(btcQuery.data
        ? normalizeBitcoinTransaction(btcQuery.data, account?.multisigAddress ?? '')
        : {}),
      isLoading: btcQuery.isLoading,
    };
  }
  const detail = stxActivity.data ?? undefined;
  return {
    ...(detail ? normalizeStacksActivity(detail.activity) : {}),
    detail,
    isLoading: stxActivity.isLoading,
  };
}
