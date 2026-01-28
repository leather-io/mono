import { useState } from 'react';

import { useToastContext } from '@/components/toast/toast-context';
import { BaseStxTxApproverLayout } from '@/features/approver/layouts/base-stx-tx-approver.layout';
import { getTxOptions } from '@/features/approver/utils';
import { useBroadcastStacksTransaction } from '@/queries/stacks/use-broadcast-stacks-transaction';
import { useAccounts } from '@/store/accounts/accounts.read';
import { App } from '@/store/apps/utils';
import { useStacksSigners } from '@/store/keychains/stacks/stacks-keychains.read';
import { assertStacksSigner } from '@/store/keychains/stacks/utils';
import { useNetworkPreferenceStacksNetwork } from '@/store/settings/settings';
import { deserializeTransaction } from '@stacks/transactions';

import { RpcRequest, RpcResponse, createRpcSuccessResponse, stxTransferStx } from '@leather.io/rpc';

import { useTransferStxTxHex } from './hooks';

interface TransferStxApproverProps {
  app: App;
  request: RpcRequest<typeof stxTransferStx>;
  sendResult(result: RpcResponse<typeof stxTransferStx>): void;
  closeApprover(): void;
  nonce: number;
  accountId: string;
}

export function TransferStxApprover({
  app,
  request,
  closeApprover,
  sendResult,
  nonce,
  accountId,
}: TransferStxApproverProps) {
  const [txHex, setTxHex] = useState<null | string>(null);
  const network = useNetworkPreferenceStacksNetwork();
  useTransferStxTxHex({ request, accountId, setTxHex, nonce, network });
  const { displayToast } = useToastContext();

  const { list: accounts } = useAccounts();
  const signer = useStacksSigners().fromAccountId(accountId)[0];
  const { mutateAsync: broadcastTransaction } = useBroadcastStacksTransaction();

  assertStacksSigner(signer);

  const txOptions = getTxOptions(signer, network);

  if (!txHex) return null;

  const tx = deserializeTransaction(txHex);

  async function onApprove() {
    assertStacksSigner(signer);

    const signedTx = await signer.sign(tx);

    try {
      const broadcastResult = await broadcastTransaction({ tx: signedTx, stacksNetwork: network });

      const response = createRpcSuccessResponse('stx_transferStx', {
        id: request.id,
        result: {
          transaction: signedTx.serialize(),
          txid: broadcastResult.txid,
        },
      });
      sendResult(response);

      return broadcastResult.txid;
    } catch (err) {
      if (err instanceof Error) displayToast({ type: 'error', title: err.message });
      throw err;
    }
  }

  return (
    <BaseStxTxApproverLayout
      accountId={accountId}
      accounts={accounts}
      onApprove={onApprove}
      onBack={closeApprover}
      onCloseApprover={closeApprover}
      origin={app.origin}
      setTxHex={setTxHex}
      txHex={txHex}
      txOptions={txOptions}
    />
  );
}
