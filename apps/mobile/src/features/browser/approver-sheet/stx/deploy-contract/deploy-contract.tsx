import { useState } from 'react';

import { useToastContext } from '@/components/toast/toast-context';
import { BaseStxTxApproverLayout } from '@/features/approver/layouts/base-stx-tx-approver.layout';
import { getTxOptions } from '@/features/approver/utils';
import { useBroadcastStxTransaction } from '@/queries/stacks/use-broadcast-stx-transaction';
import { useAccounts } from '@/store/accounts/accounts.read';
import { App } from '@/store/apps/utils';
import { useStacksSigners } from '@/store/keychains/stacks/stacks-keychains.read';
import { assertStacksSigner } from '@/store/keychains/stacks/utils';
import { useNetworkPreferenceStacksNetwork } from '@/store/settings/settings.read';
import { deserializeTransaction } from '@stacks/transactions';

import {
  RpcRequest,
  RpcResponse,
  createRpcSuccessResponse,
  stxDeployContract,
} from '@leather.io/rpc';

import { getNetworkFromRequestParams, getStxRequestParams } from '../utils';
import { useDeployContractTxHex } from './hooks';

interface DeployContractApproverProps {
  app: App;
  request: RpcRequest<typeof stxDeployContract>;
  sendResult(result: RpcResponse<typeof stxDeployContract>): void;
  closeApprover(): void;
  nonce: number;
  accountId: string;
}

export function DeployContractApprover({
  app,
  request,
  closeApprover,
  sendResult,
  nonce,
  accountId,
}: DeployContractApproverProps) {
  const stxRequestParams = getStxRequestParams(request.params, nonce);
  const defaultNetwork = useNetworkPreferenceStacksNetwork();
  const network = getNetworkFromRequestParams({ params: request.params, defaultNetwork });
  const [txHex, setTxHex] = useState<null | string>(null);
  useDeployContractTxHex({ request, stxRequestParams, setTxHex, accountId });

  const { mutateAsync: broadcastTransaction } = useBroadcastStxTransaction();
  const { displayToast } = useToastContext();

  const { list: accounts } = useAccounts();
  const signer = useStacksSigners().fromAccountId(accountId)[0];
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
          const response = createRpcSuccessResponse('stx_deployContract', {
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
      origin={app.origin}
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
