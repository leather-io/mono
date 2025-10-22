import { useGetBtcTransactionById } from '@/queries/transaction/transactions-by-id.query';
import dayjs from 'dayjs';

import { StatusRowBase } from './status-row-base';
import { getBtcTxStatus } from './utils';

export function BtcStatusRow({ txid }: { txid: string }) {
  const { value: txData } = useGetBtcTransactionById(txid);

  const status = getBtcTxStatus(txData);

  function getDate() {
    if (status === 'pending' && txData?.time) {
      return dayjs.unix(txData.time).format('MMMM D, YYYY, h:mmA');
    }
    return null;
  }

  return <StatusRowBase date={getDate()} status={status} />;
}
