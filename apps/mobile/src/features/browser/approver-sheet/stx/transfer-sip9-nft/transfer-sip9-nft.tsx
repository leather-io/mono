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

import {
  RpcRequest,
  RpcResponse,
  createRpcSuccessResponse,
  stxTransferSip9Nft,
} from '@leather.io/rpc';

import { useTransferSip9NftTxHex } from './hooks';

interface TransferSip9NftApproverProps {
  app: App;
  request: RpcRequest<typeof stxTransferSip9Nft>;
  sendResult(result: RpcResponse<typeof stxTransferSip9Nft>): void;
  closeApprover(): void;
  accountId: string;
  nonce: number;
}

export function TransferSip9NftApprover({
  app,
  request,
  closeApprover,
  sendResult,
  accountId,
  nonce,
}: TransferSip9NftApproverProps) {
  const { displayToast } = useToastContext();
  const network = useNetworkPreferenceStacksNetwork();

  const { list: accounts } = useAccounts();
  const [txHex, setTxHex] = useState<null | string>(null);
  useTransferSip9NftTxHex({ request, accountId, setTxHex, nonce, network });
  const signer = useStacksSigners().fromAccountId(accountId)[0];
  const { mutateAsync: broadcastTransaction } = useBroadcastStacksTransaction();

  assertStacksSigner(signer);
  if (!txHex) return null;

  const txOptions = getTxOptions(signer, network);

  const tx = deserializeTransaction(txHex);

  async function onApprove() {
    assertStacksSigner(signer);
    const signedTx = await signer?.sign(tx);

    try {
      const broadcastResult = await broadcastTransaction({ tx: signedTx, stacksNetwork: network });
      const response = createRpcSuccessResponse('stx_transferSip9Nft', {
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
