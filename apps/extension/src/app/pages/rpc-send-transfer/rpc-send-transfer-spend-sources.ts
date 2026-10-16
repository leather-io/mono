import {
  type SpendSourcesBreakdown,
  type SpendSourcesSummary,
  breakDownSpendBySource,
  summarizeSpendSources,
} from '@leather.io/bitcoin';
import type { OwnedUtxo } from '@leather.io/models';
import { createMoney, sumMoney } from '@leather.io/utils';

import type { TransferRecipient } from '@shared/models/form.model';

interface GeneratedSendTransferTx {
  fee: number;
  inputs: OwnedUtxo[];
}

interface RpcSendTransferSpendSources {
  summary: SpendSourcesSummary;
  breakdown: SpendSourcesBreakdown;
}

export function getRpcSendTransferSpendSources(
  tx: GeneratedSendTransferTx,
  recipients: TransferRecipient[]
): RpcSendTransferSpendSources {
  const summary = summarizeSpendSources(tx.inputs);
  const totalSpend = sumMoney([
    createMoney(tx.fee, 'BTC'),
    ...recipients.map(recipient => recipient.amount),
  ]);

  return { summary, breakdown: breakDownSpendBySource(summary, totalSpend) };
}
