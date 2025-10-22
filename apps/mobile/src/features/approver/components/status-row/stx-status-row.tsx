import { useGetStxTransactionById } from '@/queries/transaction/transactions-by-id.query';
import dayjs from 'dayjs';

import { StatusRowBase } from './status-row-base';
import { getStxTxStatus } from './utils';

export function StxStatusRow({ txid }: { txid: string }) {
  const { value: txData } = useGetStxTransactionById(txid);

  const status = getStxTxStatus(txData?.tx_status);
  function getDate() {
    if (txData?.tx_status === 'pending') {
      return dayjs.unix(txData.receipt_time).format('MMMM D, YYYY, h:mmA');
    } else if (txData?.tx_status === 'success') {
      return dayjs.unix(txData.block_time).format('MMMM D, YYYY, h:mmA');
    } else if (txData && 'block_time' in txData) {
      return dayjs.unix(txData?.block_time).format('MMMM D, YYYY, h:mmA');
    }
    return null;
  }

  return <StatusRowBase date={getDate()} status={status} />;
}
