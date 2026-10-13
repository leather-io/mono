import { useRef, useState } from 'react';
import { Keyboard } from 'react-native';

import {
  GuardResult,
  useRecipientEvaluator,
} from '@/features/send/components/recipient/use-recipient-evaluator';
import { useRelevantActivity } from '@/features/send/components/recipient/use-relevant-activity';
import type { ZodSchema } from 'zod';

import { AccountId, FungibleCryptoAsset, SupportedBlockchains } from '@leather.io/models';
import { SheetInstance } from '@leather.io/ui/native';

interface UseRecipientStateParams {
  recipientSchema: ZodSchema;
  asset: FungibleCryptoAsset;
  onChange: (address: string) => void;
  currentAccount: AccountId;
}

export function useRecipientState({
  asset,
  recipientSchema,
  onChange,
  currentAccount,
}: UseRecipientStateParams) {
  const sheetRef = useRef<SheetInstance>(null);
  const guardSheetRef = useRef<SheetInstance>(null);
  const scannerSheetRef = useRef<SheetInstance>(null);

  const relevantActivityResult = useRelevantActivity({ asset, currentAccount });
  const [guardResult, setGuardResult] = useState<GuardResult>({ severity: 'none' });
  const { evaluateRecipient } = useRecipientEvaluator({
    recipientSchema,
    activity: relevantActivityResult.value,
    asset,
  });

  function openRecipientSheet() {
    sheetRef.current?.present();
  }

  function closeRecipientSheet() {
    setGuardResult({ severity: 'none' });
    sheetRef.current?.dismiss();
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
    relevantActivityResult,
    openRecipientSheet,
    closeRecipientSheet,
    openScannerSheet,
    closeScannerSheet,
  };
}
