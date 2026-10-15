import { useGetStxTransactionById } from '@/queries/transaction/transactions-by-id.query';
import dayjs from 'dayjs';

import { isStacksMempoolTransaction } from '@leather.io/models';

import { StatusRowBase } from './status-row-base';
import { getStxTxStatus } from './utils';

export function StxStatusRow({ txid }: { txid: string }) {
  const { value: txData } = useGetStxTransactionById(txid);

  const status = getStxTxStatus(txData?.status);
  function getDate() {
    if (!txData) return null;
    if (isStacksMempoolTransaction(txData)) {
      if (txData.status !== 'pending') return null;
      return dayjs.unix(txData.receipt_time).format('MMMM D, YYYY, h:mmA');
    }
    return dayjs.unix(txData.block.time).format('MMMM D, YYYY, h:mmA');
  }

  return <StatusRowBase date={getDate()} status={status} />;
}
