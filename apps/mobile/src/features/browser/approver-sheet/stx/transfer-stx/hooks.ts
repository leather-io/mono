import { useCallback } from 'react';

import { useStacksSigners } from '@/store/keychains/stacks/stacks-keychains.read';
import { assertStacksSigner } from '@/store/keychains/stacks/utils';
import { bytesToHex } from '@stacks/common';

import { RpcRequest, stxTransferStx } from '@leather.io/rpc';
import { TransactionTypes, generateStacksUnsignedTransaction } from '@leather.io/stacks';
import { useOnMount } from '@leather.io/ui/native';
import { createMoney } from '@leather.io/utils';

import { getDefaultFee } from '../utils';

interface UseTransferStxTxHex {
  request: RpcRequest<typeof stxTransferStx>;
  setTxHex(txHex: string): void;
  nonce: number;
  accountId: string;
}

export function useTransferStxTxHex({ request, setTxHex, nonce, accountId }: UseTransferStxTxHex) {
  const { fromAccountId } = useStacksSigners();
  const signer = fromAccountId(accountId)[0];
  const fee = getDefaultFee();
  assertStacksSigner(signer);

  const getTxHex = useCallback(
    async function getTxHex() {
      const signer = fromAccountId(accountId)[0];
      assertStacksSigner(signer);

      const tx = await generateStacksUnsignedTransaction({
        txType: TransactionTypes.StxTokenTransfer,
        amount: createMoney(request.params.amount, 'STX'),
        memo: request.params.memo,
        recipient: request.params.recipient,
        publicKey: bytesToHex(signer.publicKey),
        fee,
        nonce,
      });
      return tx.serialize();
    },
    [fromAccountId, request.params, nonce, fee, accountId]
  );
  useOnMount(() => {
    void getTxHex().then(txHex => setTxHex(txHex));
  });
}
