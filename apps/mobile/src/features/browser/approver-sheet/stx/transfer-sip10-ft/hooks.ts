import { useCallback } from 'react';

import { getTransferSip10TxHex } from '@/features/approver/utils';
import { useStacksSigners } from '@/store/keychains/stacks/stacks-keychains.read';
import { assertStacksSigner } from '@/store/keychains/stacks/utils';

import { useOnMount } from '@leather.io/ui/native';

interface UseTransferSip10FtTxHex {
  amount: number;
  assetId: string;
  recipient: string;
  accountId: string;
  setTxHex(txHex: string): void;
  nonce: number;
}

export function useTransferSip10FtTxHex({
  amount,
  assetId,
  recipient,
  accountId,
  setTxHex,
  nonce,
}: UseTransferSip10FtTxHex) {
  const { fromAccountId } = useStacksSigners();

  const getTxHex = useCallback(
    function getTxHex() {
      const signer = fromAccountId(accountId)[0];
      assertStacksSigner(signer);
      return getTransferSip10TxHex({ signer, assetId, nonce, amount, recipient });
    },
    [fromAccountId, accountId, nonce, amount, assetId, recipient]
  );
  useOnMount(() => {
    void getTxHex().then(txHex => setTxHex(txHex));
  });
}
