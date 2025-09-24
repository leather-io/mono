import { useCallback } from 'react';

import { useStacksSigners } from '@/store/keychains/stacks/stacks-keychains.read';
import { assertStacksSigner } from '@/store/keychains/stacks/utils';
import { bytesToHex } from '@stacks/common';
import { StacksNetwork } from '@stacks/network';

import { RpcRequest, stxDeployContract } from '@leather.io/rpc';
import { TransactionTypes, generateStacksUnsignedTransaction } from '@leather.io/stacks';
import { useOnMount } from '@leather.io/ui/native';

import { StxRequestParams } from '../utils';

interface UseDeployContractTxHex {
  request: RpcRequest<typeof stxDeployContract>;
  stxRequestParams: StxRequestParams;
  setTxHex(txHex: string): void;
  accountId: string;
  network: StacksNetwork;
}

export function useDeployContractTxHex({
  request,
  stxRequestParams,
  setTxHex,
  accountId,
  network,
}: UseDeployContractTxHex) {
  const { fromAccountId } = useStacksSigners();

  const getTxHex = useCallback(
    async function getTxHex() {
      const signer = fromAccountId(accountId)[0];
      assertStacksSigner(signer);

      const tx = await generateStacksUnsignedTransaction({
        ...stxRequestParams,
        network,
        txType: TransactionTypes.ContractDeploy,
        contractName: request.params.name,
        codeBody: request.params.clarityCode,
        clarityVersion: request.params.clarityVersion,
        publicKey: bytesToHex(signer.publicKey),
      });
      const txHex = tx.serialize();
      return txHex;
    },
    [
      fromAccountId,
      request.params.clarityCode,
      request.params.clarityVersion,
      request.params.name,
      stxRequestParams,
      accountId,
      network,
    ]
  );
  useOnMount(() => {
    void getTxHex().then(txHex => setTxHex(txHex));
  });
}
