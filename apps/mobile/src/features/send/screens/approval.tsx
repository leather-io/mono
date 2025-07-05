import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useGlobalSheets } from '@/core/global-sheet-provider';
import { PsbtSigner } from '@/features/psbt-signer/psbt-signer';
import { useSendNavigation, useSendRoute } from '@/features/send/navigation';
import { useSendFlowContext } from '@/features/send/send-flow-provider';
import { StacksTxSigner } from '@/features/stacks-tx-signer/stacks-tx-signer';

import { Box } from '@leather.io/ui/native';

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

  return (
    <>
      <ScrollBuffer />
      {selectedAsset === 'btc' && (
        <PsbtSigner
          feeEditorEnabled={false}
          accountIndex={selectedAccount.accountIndex}
          fingerprint={selectedAccount.fingerprint}
          broadcast
          psbtHex={txHex}
          onBack={goBack}
          onResult={() => {
            sendSheetRef.current?.close();
          }}
        />
      )}
      {selectedAsset === 'stx' && (
        <StacksTxSigner
          txHex={txHex}
          onEdit={goBack}
          onSuccess={() => {
            sendSheetRef.current?.close();
          }}
          accountId={selectedAccount.id}
        />
      )}
    </>
  );
}

// Temporary buffer to prevent approver header from overlapping with iOS status bar
// TODO: test and remove once LEA-2086 is completed.
function ScrollBuffer() {
  const { top } = useSafeAreaInsets();
  if (top === 0) return null;

  return <Box height={top} backgroundColor="ink.background-primary" zIndex="50" />;
}
