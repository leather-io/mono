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
  stxCallContract,
} from '@leather.io/rpc';

import { getNetworkFromRequestParams, getStxRequestParams } from '../utils';
import { useCallContractTxHex } from './hooks';

interface CallContractApproverProps {
  request: RpcRequest<typeof stxCallContract>;
  sendResult(result: RpcResponse<typeof stxCallContract>): void;
  closeApprover(): void;
  nonce: number;
  accountId: string;
}

export function CallContractApprover({
  request,
  closeApprover,
  sendResult,
  nonce,
  accountId,
}: CallContractApproverProps) {
  const { displayToast } = useToastContext();
  const defaultNetwork = useNetworkPreferenceStacksNetwork();
  const network = getNetworkFromRequestParams({ params: request.params, defaultNetwork });
  const stxRequestParams = getStxRequestParams(request.params, nonce);
  const [txHex, setTxHex] = useState<null | string>(null);
  useCallContractTxHex({ request, stxRequestParams, setTxHex, accountId });

  const { list: accounts } = useAccounts('active');
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
          const response = createRpcSuccessResponse('stx_callContract', {
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
