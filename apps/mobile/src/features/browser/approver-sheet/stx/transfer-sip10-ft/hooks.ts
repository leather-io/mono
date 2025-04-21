import { useCallback } from 'react';

import { useStacksSigners } from '@/store/keychains/stacks/stacks-keychains.read';
import { assertStacksSigner } from '@/store/keychains/stacks/utils';
import { bytesToHex } from '@stacks/common';
import { Pc, serializeCV } from '@stacks/transactions';

import { RpcRequest, stxTransferSip10Ft } from '@leather.io/rpc';
import {
  TransactionTypes,
  createSip10FnArgs,
  formatContractIdString,
  generateStacksUnsignedTransaction,
  getStacksAssetStringParts,
} from '@leather.io/stacks';
import { useOnMount } from '@leather.io/ui/native';

import { getDefaultFee } from '../utils';

interface UseTransferSip10FtTxHex {
  request: RpcRequest<typeof stxTransferSip10Ft>;
  accountId: string;
  setTxHex(txHex: string): void;
  nonce: number;
}

export function useTransferSip10FtTxHex({
  request,
  accountId,
  setTxHex,
  nonce,
}: UseTransferSip10FtTxHex) {
  const { fromAccountId } = useStacksSigners();

  const getTxHex = useCallback(
    async function getTxHex() {
      const signer = fromAccountId(accountId)[0];
      const fee = getDefaultFee();
      assertStacksSigner(signer);

      const { contractAddress, contractAssetName, contractName } = getStacksAssetStringParts(
        request.params.asset
      );

      const currentStacksAddress = signer.address;

      const fnArgs = createSip10FnArgs({
        amount: request.params.amount,
        senderStacksAddress: currentStacksAddress,
        recipientStacksAddress: request.params.recipient,
      });

      const tx = await generateStacksUnsignedTransaction({
        txType: TransactionTypes.ContractCall,
        publicKey: bytesToHex(signer.publicKey),
        contractAddress,
        contractName,
        functionArgs: fnArgs.map(arg => serializeCV(arg)),
        functionName: 'transfer',
        nonce,
        fee,
        postConditions: [
          Pc.principal(currentStacksAddress)
            .willSendEq(request.params.amount)
            .ft(formatContractIdString({ contractAddress, contractName }), contractAssetName),
        ],
      });

      const txHex = tx.serialize();
      return txHex;
    },
    [
      fromAccountId,
      request.params.asset,
      request.params.recipient,
      request.params.amount,
      accountId,
      nonce,
    ]
  );
  useOnMount(() => {
    void getTxHex().then(txHex => setTxHex(txHex));
  });
}
