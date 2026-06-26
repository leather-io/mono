import { useQuery } from '@tanstack/react-query';
import { useUserSettings } from '~/hooks/use-user-settings';

import type { AuthNetworkId, BitcoinTransaction, Money, StacksTx } from '@leather.io/models';
import {
  createBitcoinTransactionByTxIdQueryConfig,
  createStacksTransactionByIdQueryConfig,
} from '@leather.io/queries';
import { createMoney } from '@leather.io/utils';

type OnChainStatus = 'confirmed' | 'pending' | 'failed';

interface OnChainTransaction {
  recipient?: string;
  amount?: Money;
  fee?: Money;
  status?: OnChainStatus;
}

function stacksStatus(txStatus: string): OnChainStatus {
  if (txStatus === 'success') return 'confirmed';
  if (txStatus === 'pending') return 'pending';
  return 'failed';
}

function normalizeStacksTransaction(tx: StacksTx): OnChainTransaction {
  const status = stacksStatus(tx.tx_status);
  const fee = createMoney(Number(tx.fee_rate), 'STX');
  if (tx.tx_type !== 'token_transfer') return { fee, status };
  return {
    recipient: tx.token_transfer.recipient_address,
    amount: createMoney(Number(tx.token_transfer.amount), 'STX'),
    fee,
    status,
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
  multisigAddress: string
): OnChainTransaction {
  const settings = useUserSettings();
  const isBitcoin = network.startsWith('btc');

  const stxQuery = useQuery({
    ...createStacksTransactionByIdQueryConfig(txId ?? '', settings),
    enabled: Boolean(txId) && !isBitcoin,
  });
  const btcQuery = useQuery({
    ...createBitcoinTransactionByTxIdQueryConfig(txId ?? '', settings),
    enabled: Boolean(txId) && isBitcoin,
  });

  if (isBitcoin) {
    return btcQuery.data ? normalizeBitcoinTransaction(btcQuery.data, multisigAddress) : {};
  }
  return stxQuery.data ? normalizeStacksTransaction(stxQuery.data) : {};
}
