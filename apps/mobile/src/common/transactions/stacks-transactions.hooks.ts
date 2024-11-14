import { useNetworkPreferenceStacksNetwork } from '@/store/settings/settings.read';
import { AnchorMode } from '@stacks/transactions';

import {
  StacksUnsignedTokenTransferOptions,
  TransactionTypes,
  generateUnsignedTransaction,
} from '@leather.io/stacks';
import { createMoney } from '@leather.io/utils';

export function useStxAccountTransferDetails(address: string, publicKey: string) {
  const network = useNetworkPreferenceStacksNetwork();

  return {
    network,
    publicKey,
    // Fallback for fee estimation
    recipient: address,
  };
}

const defaultRequiredStxTokenTransferOptions = {
  amount: createMoney(0, 'STX'),
  anchorMode: AnchorMode.Any,
  fee: createMoney(0, 'STX'),
  nonce: '',
};

export function useGenerateStxTokenTransferUnsignedTransaction(
  stxAccountDetails: ReturnType<typeof useStxAccountTransferDetails>
) {
  return (values: Partial<StacksUnsignedTokenTransferOptions>) =>
    generateUnsignedTransaction({
      txType: TransactionTypes.StxTokenTransfer,
      ...defaultRequiredStxTokenTransferOptions,
      ...stxAccountDetails,
      ...values,
    });
}
