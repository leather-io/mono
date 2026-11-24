import { useState } from 'react';

import { useToastContext } from '@/components/toast/toast-context';
import { BaseStxTxApproverLayout } from '@/features/approver/layouts/base-stx-tx-approver.layout';
import { getTxOptions } from '@/features/approver/utils';
import { useBroadcastStacksTransaction } from '@/queries/stacks/use-broadcast-stacks-transaction';
import { useGetStxNetworkFromRequestParams } from '@/shared/utils';
import { useAccounts } from '@/store/accounts/accounts.read';
import { type App } from '@/store/apps/utils';
import { useStacksSigners } from '@/store/keychains/stacks/stacks-keychains.read';
import { assertStacksSigner } from '@/store/keychains/stacks/utils';
import { t } from '@lingui/core/macro';
import { AuthType, deserializeTransaction } from '@stacks/transactions';

import {
  type RpcRequest,
  type RpcResponse,
  createRpcSuccessResponse,
  type stxDeployContract,
} from '@leather.io/rpc';
import { Callout } from '@leather.io/ui/native';
import { isDefined } from '@leather.io/utils';

import { getStxRequestParams } from '../utils';
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
  const network = useGetStxNetworkFromRequestParams(request.params.network);
  const [txHex, setTxHex] = useState<null | string>(null);
  useDeployContractTxHex({ request, stxRequestParams, setTxHex, accountId, network });

  const { mutateAsync: broadcastTransaction } = useBroadcastStacksTransaction();
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

    if (signedTx.auth.authType === AuthType.Sponsored) {
      sendResult(
        createRpcSuccessResponse('stx_deployContract', {
          id: request.id,
          result: { transaction: signedTx.serialize() },
        })
      );
      return null;
    }

    try {
      const broadcastResult = await broadcastTransaction({ tx: signedTx, stacksNetwork: network });
      const response = createRpcSuccessResponse('stx_deployContract', {
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
      notice={
        isDefined(request.params.clarityVersion) && (
          <Callout variant="warning">
            {t`This app asked for a specific Clarity version. Leather no longer supports that, so the contract will deploy with the latest Clarity version.`}
          </Callout>
        )
      }
      setTxHex={setTxHex}
      txHex={txHex}
      txOptions={txOptions}
    />
  );
}
