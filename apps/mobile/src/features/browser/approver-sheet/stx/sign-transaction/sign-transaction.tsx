import { useState } from 'react';

import { BaseStxTxApproverLayout } from '@/features/approver/layouts/base-stx-tx-approver.layout';
import { getTxOptions } from '@/features/approver/utils';
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
  stxSignTransaction,
} from '@leather.io/rpc';

import { getTxHexFromRequest } from './utils';

interface SignTransactionApproverProps {
  app: App;
  request: RpcRequest<typeof stxSignTransaction>;
  sendResult(result: RpcResponse<typeof stxSignTransaction>): void;
  closeApprover(): void;
  accountId: string;
}

export function SignTransactionApprover({
  app,
  request,
  closeApprover,
  sendResult,
  accountId,
}: SignTransactionApproverProps) {
  const network = useNetworkPreferenceStacksNetwork();
  const requestTxHex = getTxHexFromRequest(request);

  const { list: accounts } = useAccounts();
  const [txHex, setTxHex] = useState(requestTxHex);
  const signer = useStacksSigners().fromAccountId(accountId)[0];
  assertStacksSigner(signer);

  const txOptions = getTxOptions(signer, network);

  const tx = deserializeTransaction(txHex);

  async function onApprove() {
    assertStacksSigner(signer);
    const signedTx = await signer?.sign(tx);

    const response = createRpcSuccessResponse('stx_signTransaction', {
      id: request.id,
      result: {
        txHex: signedTx.serialize(),
        transaction: signedTx.serialize(),
      },
    });
    sendResult(response);
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
      origin={app.origin}
    />
  );
}
