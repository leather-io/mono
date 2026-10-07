import { useMemo } from 'react';

import { useGenerateUnsignedBitcoinTx } from '@app/common/transactions/bitcoin/use-generate-bitcoin-tx';
import { useFeeEditorContext } from '@app/features/fee-editor/fee-editor.context';
import { useCurrentPolicy } from '@app/store/policy/policy.selectors';

import { useRpcSendTransferContext } from './rpc-send-transfer.context';

export type RpcSendTransferTx = ReturnType<typeof useRpcSendTransferTx>;

export function useRpcSendTransferTx() {
  const { selectedFee } = useFeeEditorContext();
  const { amount, recipients, utxos } = useRpcSendTransferContext();
  const policy = useCurrentPolicy();
  const generateTx = useGenerateUnsignedBitcoinTx();
  const isBitcoinPolicy = policy?.chain === 'bitcoin';
  const feeRate = selectedFee?.feeRate;

  return useMemo(() => {
    if (isBitcoinPolicy || !feeRate) return null;
    return generateTx({ amount, recipients }, feeRate, [...utxos]) ?? null;
  }, [isBitcoinPolicy, feeRate, generateTx, amount, recipients, utxos]);
}
