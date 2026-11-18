import { useStacksTransactionFees } from '@/queries/stacks/fees/stacks-transaction-fees.query';
import { useStacksSigners } from '@/store/keychains/stacks/stacks-keychains.read';
import { assertStacksSigner } from '@/store/keychains/stacks/utils';
import { useNetworkPreferenceStacksNetwork } from '@/store/settings/settings';
import { bytesToHex } from '@stacks/common';
import { deserializeTransaction } from '@stacks/transactions';
import { useQuery } from '@tanstack/react-query';

import { type AccountId, type Sip10Asset } from '@leather.io/models';
import {
  TransactionTypes,
  createTransferSip10TxHex,
  generateStacksUnsignedTransaction,
} from '@leather.io/stacks';
import { createMoney } from '@leather.io/utils';

const placeholderNonce = 0;
const placeholderAmount = 0;
const zeroStx = createMoney(0, 'STX');

function useAccountStacksSigner({ fingerprint, accountIndex }: AccountId) {
  return useStacksSigners().fromAccountIndex(fingerprint, accountIndex)[0];
}

export function useStxTransferFees(account: AccountId) {
  const signer = useAccountStacksSigner(account);
  const stacksNetwork = useNetworkPreferenceStacksNetwork();

  const { data: unsignedTx } = useQuery({
    queryKey: ['stx-transfer-fee-estimation-tx', signer?.address, stacksNetwork.chainId],
    queryFn() {
      assertStacksSigner(signer);
      return generateStacksUnsignedTransaction({
        txType: TransactionTypes.StxTokenTransfer,
        amount: zeroStx,
        fee: zeroStx,
        nonce: placeholderNonce,
        recipient: signer.address,
        publicKey: bytesToHex(signer.publicKey),
        network: stacksNetwork,
      });
    },
    enabled: !!signer,
    staleTime: Infinity,
  });

  return useStacksTransactionFees(unsignedTx);
}

export function useSip10TransferFees(account: AccountId, asset: Sip10Asset) {
  const signer = useAccountStacksSigner(account);
  const stacksNetwork = useNetworkPreferenceStacksNetwork();

  const { data: unsignedTx } = useQuery({
    queryKey: [
      'sip10-transfer-fee-estimation-tx',
      signer?.address,
      stacksNetwork.chainId,
      asset.assetId,
    ],
    async queryFn() {
      assertStacksSigner(signer);
      const txHex = await createTransferSip10TxHex({
        signer,
        assetId: asset.assetId,
        recipient: signer.address,
        amount: placeholderAmount,
        nonce: placeholderNonce,
        fee: zeroStx,
      });
      return deserializeTransaction(txHex);
    },
    enabled: !!signer,
    staleTime: Infinity,
  });

  return useStacksTransactionFees(unsignedTx);
}
