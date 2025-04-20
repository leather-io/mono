import { memo, useRef } from 'react';

import { RecipientSelector } from '@/features/send/components/recipient/v2/recipient-selector/recipient-selector';
import { RecipientSelectorError } from '@/features/send/components/recipient/v2/recipient-selector/recipient-selector-error';
import { RecipientSheet } from '@/features/send/components/recipient/v2/recipient-sheet';
import { RecipientToggle } from '@/features/send/components/recipient/v2/recipient-toggle';
import {
  matchRelevantActivityResult,
  useRelevantActivity,
} from '@/features/send/components/recipient/v2/use-relevant-activity';
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
  const {
    state: { accounts, selectedAccount },
  } = useSendFlowContext();
  assertExistence(selectedAccount, "'selectedAccount' is required in the recipient flow");
  const relevantActivityResult = useRelevantActivity(selectedAccount, assetInfo);

  function handleSelectAddress(address: string) {
    onChange(address);
    sheetRef.current?.dismiss();
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
    </>
  );
});

Recipient.displayName = 'Recipient';
