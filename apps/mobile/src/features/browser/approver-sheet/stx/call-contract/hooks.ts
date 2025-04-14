import { useCallback } from 'react';

import { useStacksSigners } from '@/store/keychains/stacks/stacks-keychains.read';
import { assertStacksSigner } from '@/store/keychains/stacks/utils';
import { bytesToHex } from '@stacks/common';

import { RpcRequest, stxCallContract } from '@leather.io/rpc';
import {
  TransactionTypes,
  generateStacksUnsignedTransaction,
  getStacksAssetStringParts,
} from '@leather.io/stacks';
import { useOnMount } from '@leather.io/ui/native';

import { StxRequestParams } from '../utils';

interface UseCallContractTxHex {
  request: RpcRequest<typeof stxCallContract>;
  stxRequestParams: StxRequestParams;
  setTxHex(txHex: string): void;
  accountId: string;
}

export function useCallContractTxHex({
  request,
  stxRequestParams,
  setTxHex,
  accountId,
}: UseCallContractTxHex) {
  const { fromAccountId } = useStacksSigners();
  const signer = fromAccountId(accountId)[0];

  const getTxHex = useCallback(
    async function getTxHex() {
      assertStacksSigner(signer);

      const { contractAddress, contractName } = getStacksAssetStringParts(request.params.contract);
      const tx = await generateStacksUnsignedTransaction({
        ...stxRequestParams,
        txType: TransactionTypes.ContractCall,
        contractAddress,
        contractName,
        functionName: request.params.functionName,
        functionArgs: request.params.functionArgs ?? [],
        publicKey: bytesToHex(signer.publicKey),
      });
      const txHex = tx.serialize();
      return txHex;
    },
    [
      signer,
      request.params.contract,
      request.params.functionName,
      request.params.functionArgs,
      stxRequestParams,
    ]
  );
  useOnMount(() => {
    void getTxHex().then(txHex => setTxHex(txHex));
  });
}
