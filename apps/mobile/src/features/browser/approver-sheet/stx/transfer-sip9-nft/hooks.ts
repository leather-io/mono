import { useCallback } from 'react';

import { useStacksSigners } from '@/store/keychains/stacks/stacks-keychains.read';
import { assertStacksSigner } from '@/store/keychains/stacks/utils';
import { bytesToHex } from '@stacks/common';
import { Pc, hexToCV, serializeCV } from '@stacks/transactions';

import { RpcRequest, stxTransferSip9Nft } from '@leather.io/rpc';
import {
  TransactionTypes,
  createSip9FnArgs,
  formatAssetString,
  generateStacksUnsignedTransaction,
  getStacksAssetStringParts,
} from '@leather.io/stacks';
import { useOnMount } from '@leather.io/ui/native';

import { getDefaultFee } from '../utils';

interface UseTransferSip9NftTxHex {
  request: RpcRequest<typeof stxTransferSip9Nft>;
  setTxHex(txHex: string): void;
  nonce: number;
  accountId: string;
}

export function useTransferSip9NftTxHex({
  request,
  accountId,
  setTxHex,
  nonce,
}: UseTransferSip9NftTxHex) {
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

      const fnArgs = createSip9FnArgs({
        assetId: request.params.assetId,
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
            .willSendAsset()
            .nft(
              formatAssetString({
                contractName,
                contractAddress,
                assetName: contractAssetName,
              }),
              hexToCV(request.params.assetId)
            ),
        ],
      });
      const txHex = tx.serialize();
      return txHex;
    },
    [
      fromAccountId,
      request.params.asset,
      request.params.assetId,
      request.params.recipient,
      accountId,
      nonce,
    ]
  );
  useOnMount(() => {
    void getTxHex().then(txHex => setTxHex(txHex));
  });
}
