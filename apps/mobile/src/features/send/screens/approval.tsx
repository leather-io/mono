import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useGlobalSheets } from '@/core/global-sheet-provider';
import { PsbtSigner } from '@/features/psbt-signer/psbt-signer';
import { useSendNavigation, useSendRoute } from '@/features/send/navigation';
import { useSendFlowContext } from '@/features/send/send-flow-provider';
import { StacksTxSigner } from '@/features/stacks-tx-signer/stacks-tx-signer';

import { Box } from '@leather.io/ui/native';

import { Sip10Approver } from '../forms/stx/sip10-approval';

export function Approval() {
  const { goBack } = useSendNavigation();
  const route = useSendRoute<'approval'>();
  const txHex = route.params.hex;
  const {
    state: { selectedAsset, currentAccount },
  } = useSendFlowContext();
  const { fingerprint, accountIndex, id: accountId } = currentAccount;
  const { sendSheetRef } = useGlobalSheets();

  if (!selectedAsset || !txHex) {
    // TODO: This only can happen due to developer error. Find the best way to log & represent this.
    return null;
  }

  return (
    <>
      <ScrollBuffer />
      {selectedAsset.protocol === 'nativeBtc' && (
        <PsbtSigner
          feeEditorEnabled
          fingerprint={fingerprint}
          accountIndex={accountIndex}
          broadcast
          psbtHex={txHex}
          onBack={goBack}
          onResult={() => {
            sendSheetRef.current?.close();
          }}
        />
      )}
      {selectedAsset.protocol === 'nativeStx' && (
        <StacksTxSigner
          txHex={txHex}
          onEdit={goBack}
          onSuccess={() => {
            sendSheetRef.current?.close();
          }}
          fingerprint={fingerprint}
          accountIndex={accountIndex}
        />
      )}
      {selectedAsset.protocol === 'sip10' && (
        <Sip10Approver
          txHex={txHex}
          onEdit={goBack}
          onSuccess={() => {
            sendSheetRef.current?.close();
          }}
          accountId={accountId}
        />
      )}
    </>
  );
}

// Prevent approver header from overlapping with iOS status bar
function ScrollBuffer() {
  const { top } = useSafeAreaInsets();
  if (top === 0) return null;

  return <Box height={top} backgroundColor="ink.background-primary" zIndex="50" />;
}
