import { useRef, useState } from 'react';
import { Keyboard } from 'react-native';

import {
  GuardResult,
  useRecipientEvaluator,
} from '@/features/send/components/recipient/use-recipient-evaluator';
import { useRelevantActivity } from '@/features/send/components/recipient/use-relevant-activity';
import { useSendFlowContext } from '@/features/send/send-flow-provider';
import type { ZodSchema } from 'zod';

import { FungibleCryptoAssetInfo, SupportedBlockchains } from '@leather.io/models';
import { SheetRef } from '@leather.io/ui/native';
import { assertExistence } from '@leather.io/utils';

interface UseRecipientStateParams {
  recipientSchema: ZodSchema;
  assetInfo: FungibleCryptoAssetInfo;
  onChange: (address: string) => void;
}

export function useRecipientState({
  assetInfo,
  recipientSchema,
  onChange,
}: UseRecipientStateParams) {
  const sheetRef = useRef<SheetRef>(null);
  const guardSheetRef = useRef<SheetRef>(null);
  const scannerSheetRef = useRef<SheetRef>(null);
  const {
    state: { accounts, selectedAccount },
  } = useSendFlowContext();
  assertExistence(selectedAccount, "'selectedAccount' is required in the recipient flow");
  const relevantActivityResult = useRelevantActivity(selectedAccount, assetInfo);
  const [guardResult, setGuardResult] = useState<GuardResult>({ severity: 'none' });
  const { evaluateRecipient } = useRecipientEvaluator({
    recipientSchema,
    activity: relevantActivityResult.value,
    accounts,
    assetInfo,
  });

  function openRecipientSheet() {
    sheetRef.current?.present();
  }

  function closeRecipientSheet() {
    sheetRef.current?.dismiss();
  }

  function openGuardSheet() {
    guardSheetRef.current?.present();
  }

  function closeGuardSheet() {
    guardSheetRef.current?.dismiss();
  }

  function openScannerSheet() {
    scannerSheetRef.current?.present();
  }

  function closeScannerSheet() {
    scannerSheetRef.current?.dismiss();
  }

  function confirmAddressSelection(address: string) {
    onChange(address);
    closeRecipientSheet();
    closeGuardSheet();
  }

  async function onSelectAddress(address: string) {
    Keyboard.dismiss();
    const evaluationResult = await evaluateRecipient(address);

    if (evaluationResult.severity !== 'none') {
      setGuardResult(evaluationResult);
      openGuardSheet();
      return;
    }

    confirmAddressSelection(address);
  }

  async function onQrScanned(data: { address: string; chain: SupportedBlockchains }) {
    closeScannerSheet();
    closeRecipientSheet();

    const evaluationResult = await evaluateRecipient(data.address);

    if (evaluationResult.severity !== 'none') {
      onChange('');
      setGuardResult(evaluationResult);
      openGuardSheet();
      return;
    }

    confirmAddressSelection(data.address);
  }

  return {
    sheetRef,
    guardSheetRef,
    scannerSheetRef,
    guardResult,
    confirmAddressSelection,
    onSelectAddress,
    onQrScanned,
    accounts,
    selectedAccount,
    relevantActivityResult,
    openRecipientSheet,
    closeRecipientSheet,
    openScannerSheet,
    closeScannerSheet,
  };
}
