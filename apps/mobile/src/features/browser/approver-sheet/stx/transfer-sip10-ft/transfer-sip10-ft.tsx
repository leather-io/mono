import { useState } from 'react';

import { useToastContext } from '@/components/toast/toast-context';
import { BaseStxTxApproverLayout } from '@/features/approver/layouts/base-stx-tx-approver.layout';
import { getTxOptions } from '@/features/approver/utils';
import { useBroadcastStxTransaction } from '@/queries/stacks/use-broadcast-stx-transaction';
import { useAccounts } from '@/store/accounts/accounts.read';
import { useStacksSigners } from '@/store/keychains/stacks/stacks-keychains.read';
import { assertStacksSigner } from '@/store/keychains/stacks/utils';
import { useNetworkPreferenceStacksNetwork } from '@/store/settings/settings.read';
import { deserializeTransaction } from '@stacks/transactions';

import {
  RpcRequest,
  RpcResponse,
  createRpcSuccessResponse,
  stxTransferSip10Ft,
} from '@leather.io/rpc';

import { useTransferSip10FtTxHex } from './hooks';

interface TransferSip10FtApproverProps {
  request: RpcRequest<typeof stxTransferSip10Ft>;
  sendResult(result: RpcResponse<typeof stxTransferSip10Ft>): void;
  closeApprover(): void;
  nonce: number;
  accountId: string;
}

export function TransferSip10FtApprover({
  request,
  closeApprover,
  sendResult,
  nonce,
  accountId,
}: TransferSip10FtApproverProps) {
  const { displayToast } = useToastContext();
  const network = useNetworkPreferenceStacksNetwork();

  const { list: accounts } = useAccounts('active');
  const [txHex, setTxHex] = useState<null | string>(null);
  useTransferSip10FtTxHex({ request, accountId, setTxHex, nonce });
  const signer = useStacksSigners().fromAccountId(accountId)[0];
  const { mutateAsync: broadcastTransaction } = useBroadcastStxTransaction();

  assertStacksSigner(signer);
  if (!txHex) return null;

  const txOptions = getTxOptions(signer, network);

  const tx = deserializeTransaction(txHex);

  async function onApprove() {
    assertStacksSigner(signer);
    const signedTx = await signer?.sign(tx);

    await broadcastTransaction(
      { tx: signedTx, stacksNetwork: network },
      {
        onError(err) {
          displayToast({ type: 'error', title: err.message });
        },
        onSuccess(resp) {
          const response = createRpcSuccessResponse('stx_transferSip10Ft', {
            id: request.id,
            result: {
              transaction: signedTx.serialize(),
              txid: resp.txid,
            },
          });
          sendResult(response);
        },
      }
    );
  }

  return (
    <BaseStxTxApproverLayout
      txHex={txHex}
      setTxHex={setTxHex}
      txOptions={txOptions}
      onCloseApprover={closeApprover}
      accountId={accountId}
      accounts={accounts}
      onApprove={onApprove}
    />
  );
}
