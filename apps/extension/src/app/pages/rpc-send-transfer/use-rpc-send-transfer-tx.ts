import { useMemo } from 'react';

import { useGenerateUnsignedBitcoinTx } from '@app/common/transactions/bitcoin/use-generate-bitcoin-tx';
import { useFeeEditorContext } from '@app/features/fee-editor/fee-editor.context';
import { useCurrentPolicy } from '@app/store/policy/policy.selectors';

import { useRpcSendTransferContext } from './rpc-send-transfer.context';

type GeneratedBitcoinTx = NonNullable<ReturnType<ReturnType<typeof useGenerateUnsignedBitcoinTx>>>;

export interface RpcSendTransferTx {
  tx: GeneratedBitcoinTx | null;
  error: unknown;
}

export function useRpcSendTransferTx(): RpcSendTransferTx {
  const { selectedFee } = useFeeEditorContext();
  const { amount, recipients, utxos } = useRpcSendTransferContext();
  const policy = useCurrentPolicy();
  const generateTx = useGenerateUnsignedBitcoinTx({ throwError: true });
  const isBitcoinPolicy = policy?.chain === 'bitcoin';
  const feeRate = selectedFee?.feeRate;

  return useMemo(() => {
    if (isBitcoinPolicy || !feeRate) return { tx: null, error: null };
    try {
      return { tx: generateTx({ amount, recipients }, feeRate, [...utxos]) ?? null, error: null };
    } catch (error) {
      return { tx: null, error };
    }
  }, [isBitcoinPolicy, feeRate, generateTx, amount, recipients, utxos]);
}
