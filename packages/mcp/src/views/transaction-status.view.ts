import type { BitcoinTransaction, StacksTx } from '@leather.io/models';

import { bitcoinExplorerTxUrl, stacksExplorerTxUrl } from '../explorer';

interface TransactionStatusView {
  txid: string;
  chain: 'stacks' | 'bitcoin';
  status: 'confirmed' | 'pending' | 'failed' | 'not_found';
  blockHeight?: number;
  failureReason?: string;
  result?: string;
  explorerUrl?: string;
}

export function buildStacksTxStatusView(txid: string, tx: StacksTx | null): TransactionStatusView {
  if (!tx) return { txid, chain: 'stacks', status: 'not_found' };
  const explorerUrl = stacksExplorerTxUrl(txid);
  if (tx.tx_status === 'success')
    return {
      txid,
      chain: 'stacks',
      status: 'confirmed',
      blockHeight: tx.block_height,
      result: tx.tx_result.repr,
      explorerUrl,
    };
  if (tx.tx_status === 'pending') return { txid, chain: 'stacks', status: 'pending', explorerUrl };
  if (tx.tx_status === 'abort_by_response' || tx.tx_status === 'abort_by_post_condition')
    return {
      txid,
      chain: 'stacks',
      status: 'failed',
      failureReason: tx.tx_status,
      blockHeight: tx.block_height,
      result: tx.tx_result.repr,
      explorerUrl,
    };
  return { txid, chain: 'stacks', status: 'failed', failureReason: tx.tx_status, explorerUrl };
}

export function buildBitcoinTxStatusView(
  txid: string,
  tx: BitcoinTransaction | null
): TransactionStatusView {
  if (!tx) return { txid, chain: 'bitcoin', status: 'not_found' };
  const explorerUrl = bitcoinExplorerTxUrl(txid);
  if (typeof tx.height === 'number' && tx.height > 0)
    return { txid, chain: 'bitcoin', status: 'confirmed', blockHeight: tx.height, explorerUrl };
  return { txid, chain: 'bitcoin', status: 'pending', explorerUrl };
}
