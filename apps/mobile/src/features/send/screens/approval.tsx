import { useGlobalSheets } from '@/core/global-sheet-provider';
import { PsbtSigner } from '@/features/psbt-signer/psbt-signer';
import { useSendNavigation, useSendRoute } from '@/features/send/navigation';
import { useSendFlowContext } from '@/features/send/send-flow-provider';
import { StacksTxSigner } from '@/features/stacks-tx-signer/stacks-tx-signer';

export function Approval() {
  const { goBack } = useSendNavigation();
  const route = useSendRoute<'approval'>();
  const txHex = route.params.hex;
  const {
    state: { selectedAsset, selectedAccount },
  } = useSendFlowContext();
  const { sendSheetRef } = useGlobalSheets();

  if (!selectedAsset || !selectedAccount || !txHex) {
    // TODO: This only can happen due to developer error. Find the best way to log & represent this.
    return null;
  }

  if (selectedAsset === 'btc') {
    return (
      <PsbtSigner
        accountIndex={selectedAccount.accountIndex}
        fingerprint={selectedAccount.fingerprint}
        broadcast
        psbtHex={txHex}
        onBack={goBack}
        onResult={() => {
          sendSheetRef.current?.close();
        }}
      />
    );
  }

  if (selectedAsset === 'stx') {
    return (
      <StacksTxSigner
        txHex={txHex}
        onEdit={goBack}
        onSuccess={() => {
          sendSheetRef.current?.close();
        }}
        accountId={selectedAccount.id}
      />
    );
  }

  // TODO: Use pattern matching once we add support for remaining tokens
  return null;
}
