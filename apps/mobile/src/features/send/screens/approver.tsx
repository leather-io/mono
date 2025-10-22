import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useGlobalSheets } from '@/core/global-sheet-provider';
import { PsbtSigner } from '@/features/psbt-signer/psbt-signer';
import { useSendNavigation, useSendRoute } from '@/features/send/navigation';
import { useSendFlowContext } from '@/features/send/send-flow-provider';

import { makeAccountIdentifer } from '@leather.io/crypto';
import { Box } from '@leather.io/ui/native';

import { Sip10Approver } from '../forms/stx/sip10-approver';
import { StxApprover } from '../forms/stx/stx-approver';

export function SendApprover() {
  const { goBack } = useSendNavigation();
  const route = useSendRoute<'approver'>();
  const txHex = route.params.hex;
  const {
    state: { selectedAsset, currentAccount },
  } = useSendFlowContext();
  const { fingerprint, accountIndex } = currentAccount;
  const accountId = makeAccountIdentifer(fingerprint, accountIndex);
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
          onClose={() => {
            sendSheetRef.current?.dismiss();
          }}
          onResult={() => {
            // sendSheetRef.current?.dismiss();
          }}
        />
      )}
      {selectedAsset.protocol === 'nativeStx' && (
        <StxApprover
          txHex={txHex}
          onEdit={goBack}
          closeApprover={() => {
            sendSheetRef.current?.dismiss();
          }}
          accountId={accountId}
        />
      )}
      {selectedAsset.protocol === 'sip10' && (
        <Sip10Approver
          txHex={txHex}
          onEdit={goBack}
          closeApprover={() => {
            sendSheetRef.current?.dismiss();
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
