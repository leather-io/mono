import { useState } from 'react';

import { BaseStxTxApproverLayout } from '@/features/approver/layouts/base-stx-tx-approver.layout';
import { getTxOptions } from '@/features/approver/utils';
import { useAccounts } from '@/store/accounts/accounts.read';
import { App } from '@/store/apps/utils';
import { useStacksSigners } from '@/store/keychains/stacks/stacks-keychains.read';
import { useNetworkPreferenceStacksNetwork } from '@/store/settings/settings.read';
import { deserializeTransaction } from '@stacks/transactions';

import {
  RpcRequest,
  RpcResponse,
  createRpcSuccessResponse,
  stxSignTransaction,
} from '@leather.io/rpc';

import { getNormalizedParams } from './utils';

interface SignTransactionApproverProps {
  app: App;
  message: RpcRequest<typeof stxSignTransaction>;
  sendResult(result: RpcResponse<typeof stxSignTransaction>): void;
  origin: string;
  closeApprover(): void;
}

export function SignTransactionApprover({
  message,
  app,
  closeApprover,
  sendResult,
}: SignTransactionApproverProps) {
  const network = useNetworkPreferenceStacksNetwork();
  const normalizedParams = getNormalizedParams(message, app);

  const { list: accounts } = useAccounts();
  const [txHex, setTxHex] = useState(normalizedParams.txHex);
  const signer = useStacksSigners().fromAccountId(normalizedParams.accountId)[0];
  if (!signer) throw new Error('No signer found');

  const txOptions = getTxOptions(signer, network);

  const tx = deserializeTransaction(txHex);

  async function onApprove() {
    if (!signer) throw new Error('No signer found');
    const signedTx = await signer?.sign(tx);

    const response = createRpcSuccessResponse('stx_signTransaction', {
      id: message.id,
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
      accountId={normalizedParams.accountId}
      accounts={accounts}
      onApprove={onApprove}
    />
  );
}
