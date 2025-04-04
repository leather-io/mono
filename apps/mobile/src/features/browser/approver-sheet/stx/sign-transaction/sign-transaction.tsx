import { useState } from 'react';

import { getTxOptions } from '@/features/approver/utils';
import { useAccounts } from '@/store/accounts/accounts.read';
import { App } from '@/store/apps/utils';
import { useStacksSigners } from '@/store/keychains/stacks/stacks-keychains.read';
import {
  getStacksNetworkFromName,
  useNetworkPreferenceStacksNetwork,
} from '@/store/settings/settings.read';
import { destructAccountIdentifier } from '@/store/utils';
import { StacksNetworks } from '@stacks/network';
import { deserializeTransaction } from '@stacks/transactions';

import {
  RpcRequest,
  RpcResponse,
  createRpcSuccessResponse,
  stxSignTransaction,
} from '@leather.io/rpc';

import { SignTransactionApproverLayout } from './sign-transaction.layout';

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
  function getNetwork() {
    if (!message.params.network) {
      return network;
    }
    const stacksNetworkName = StacksNetworks.find(n => n === message.params.network);
    if (stacksNetworkName) {
      return getStacksNetworkFromName(stacksNetworkName);
    }
    throw new Error('Wrong network');
  }

  function getDefaultAccountId() {
    if (!('accountId' in app)) throw new Error('We should always have an accountId here');

    return app.accountId;
  }
  function getTxHex() {
    if ('txHex' in message.params) {
      return message.params.txHex;
    }
    return message.params.transaction;
  }
  const { list: accounts } = useAccounts();
  const [txHex, setTxHex] = useState(getTxHex());
  const defaultAccountId = getDefaultAccountId();
  const { fingerprint, accountIndex } = destructAccountIdentifier(defaultAccountId);
  const signer = useStacksSigners().fromAccountIndex(fingerprint, accountIndex)[0];
  if (!signer) throw new Error('No signer found');

  const txOptions = getTxOptions(signer, getNetwork());

  const tx = deserializeTransaction(txHex);

  return (
    <SignTransactionApproverLayout
      txHex={txHex}
      setTxHex={setTxHex}
      txOptions={txOptions}
      onCloseApprover={closeApprover}
      accountId={defaultAccountId}
      accounts={accounts}
      onApprove={async () => {
        const signedTx = await signer?.sign(tx);

        const response = createRpcSuccessResponse('stx_signTransaction', {
          id: message.id,
          result: {
            txHex: signedTx.serialize(),
            transaction: signedTx.serialize(),
          },
        });
        sendResult(response);
      }}
    />
  );
}
