import { useCallback } from 'react';

import { getTransferSip10TxHex } from '@/features/approver/utils';
import { useStacksSigners } from '@/store/keychains/stacks/stacks-keychains.read';
import { assertStacksSigner } from '@/store/keychains/stacks/utils';
import { StacksNetwork } from '@stacks/network';

import { useOnMount } from '@leather.io/ui/native';

interface UseTransferSip10FtTxHex {
  amount: number;
  assetId: string;
  recipient: string;
  accountId: string;
  setTxHex(txHex: string): void;
  nonce: number;
  network: StacksNetwork;
  sponsored: boolean | undefined;
}

export function useTransferSip10FtTxHex({
  amount,
  assetId,
  recipient,
  accountId,
  setTxHex,
  nonce,
  network,
  sponsored,
}: UseTransferSip10FtTxHex) {
  const { fromAccountId } = useStacksSigners();

  const getTxHex = useCallback(
    function getTxHex() {
      const signer = fromAccountId(accountId)[0];
      assertStacksSigner(signer);
      return getTransferSip10TxHex({
        signer,
        assetId,
        nonce,
        amount,
        recipient,
        network,
        sponsored,
      });
    },
    [fromAccountId, accountId, nonce, amount, assetId, recipient, network, sponsored]
  );
  useOnMount(() => {
    void getTxHex().then(txHex => setTxHex(txHex));
  });
}
