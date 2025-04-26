import { memo, useRef, useState } from 'react';
import { Keyboard } from 'react-native';

import {
  GuardResult,
  createRecipientEvaluator,
} from '@/features/send/components/recipient/v2/recipient-evaluator';
import { RecipientGuardSheet } from '@/features/send/components/recipient/v2/recipient-guard-sheet';
import { RecipientSelector } from '@/features/send/components/recipient/v2/recipient-selector/recipient-selector';
import { RecipientSelectorError } from '@/features/send/components/recipient/v2/recipient-selector/recipient-selector-error';
import { RecipientSheet } from '@/features/send/components/recipient/v2/recipient-sheet';
import { RecipientToggle } from '@/features/send/components/recipient/v2/recipient-toggle';
import { isNewAddress } from '@/features/send/components/recipient/v2/recipient.utils';
import {
  matchRelevantActivityResult,
  useRelevantActivity,
} from '@/features/send/components/recipient/v2/use-relevant-activity';
import { useAccountHelpers } from '@/features/send/components/recipient/v2/use-shameful-account-helpers';
import { SendFormLoadingSpinner } from '@/features/send/components/send-form-layout';
import { useSendFlowContext } from '@/features/send/send-flow-provider';
import { type ZodSchema } from 'zod';

import { type FungibleCryptoAssetInfo } from '@leather.io/models';
import { type SheetRef } from '@leather.io/ui/native';
import { assertExistence } from '@leather.io/utils';

interface RecipientProps {
  value: string;
  onChange(value: string): void;
  assetInfo: FungibleCryptoAssetInfo;
  recipientSchema: ZodSchema;
}

export const Recipient = memo(({ value, onChange, assetInfo, recipientSchema }: RecipientProps) => {
  const sheetRef = useRef<SheetRef>(null);
  const guardSheetRef = useRef<SheetRef>(null);
  const {
    state: { accounts, selectedAccount },
  } = useSendFlowContext();
  assertExistence(selectedAccount, "'selectedAccount' is required in the recipient flow");
  const { findAccountByAddress } = useAccountHelpers(accounts, assetInfo);
  const relevantActivityResult = useRelevantActivity(selectedAccount, assetInfo);
  const [guardResult, setGuardResult] = useState<GuardResult>({ severity: 'none' });
  const evaluateRecipient = createRecipientEvaluator({
    schema: recipientSchema,
    canSelfSend: assetInfo.chain === 'bitcoin',
    isNewAddress: (address: string) =>
      isNewAddress({ address, findAccountByAddress, activity: relevantActivityResult.value }),
  });

  function confirmAddressSelection(address: string) {
    onChange(address);
    sheetRef.current?.dismiss();
    guardSheetRef.current?.dismiss();
  }

  async function handleSelectAddress(address: string) {
    Keyboard.dismiss();

    const evaluationResult = await evaluateRecipient(address);

    if (evaluationResult.severity !== 'none') {
      setGuardResult(evaluationResult);
      guardSheetRef.current?.present();
      return;
    }

    confirmAddressSelection(address);
  }

  return (
    <>
      <RecipientToggle value={value} onPress={() => sheetRef.current?.present()} invalid={false} />
      <RecipientSheet sheetRef={sheetRef}>
        {matchRelevantActivityResult({
          result: relevantActivityResult,
          loading: <SendFormLoadingSpinner />,
          error: () => <RecipientSelectorError />,
          success: data => (
            <RecipientSelector
              assetInfo={assetInfo}
              activity={data}
              accounts={accounts}
              selectedAccount={selectedAccount}
              onSelectAddress={handleSelectAddress}
              recipientSchema={recipientSchema}
            />
          ),
        })}
      </RecipientSheet>
      <RecipientGuardSheet
        sheetRef={guardSheetRef}
        config={guardResult}
        onConfirm={confirmAddressSelection}
      />
    </>
  );
});

Recipient.displayName = 'Recipient';
