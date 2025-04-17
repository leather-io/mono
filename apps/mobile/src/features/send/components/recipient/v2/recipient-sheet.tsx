import { RefObject, memo, useState } from 'react';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { RecipientInput } from '@/features/send/components/recipient/v2/recipient-input';
import { RecipientSuggestions } from '@/features/send/components/recipient/v2/recipient-suggestions';
import { useRecipientSuggestions } from '@/features/send/components/recipient/v2/use-recipient-suggestions';
import { useSettings } from '@/store/settings/settings';
import { ZodSchema } from 'zod';

import { Box, Sheet, SheetRef } from '@leather.io/ui/native';

interface RecipientSheetProps {
  value: string;
  onChange(value: string): void;
  sheetRef: RefObject<SheetRef>;
  recipientSchema: ZodSchema;
}

function RecipientSheetImplementation({ sheetRef, value }: RecipientSheetProps) {
  const { themeDerivedFromThemePreference } = useSettings();
  const [editingValue, setEditingValue] = useState(value);
  const suggestions = useRecipientSuggestions();
  const hasSuggestions = suggestions.length > 0;
  const sheetBehaviorProps = getSheetBehaviorProps({ hasSuggestions });
  const safeAreaInsets = useSafeAreaInsets();

  return (
    <Sheet
      ref={sheetRef}
      safeAreaInsets={safeAreaInsets}
      themeVariant={themeDerivedFromThemePreference}
      {...sheetBehaviorProps}
    >
      <Box px="5" pt="5" pb="2">
        <RecipientInput
          value={editingValue}
          onChange={setEditingValue}
          autoFocus={!hasSuggestions}
        />
      </Box>
      {hasSuggestions && <RecipientSuggestions suggestions={suggestions} />}
    </Sheet>
  );
}

interface GetSheetSnapBehaviorParams {
  hasSuggestions: boolean;
}

function getSheetBehaviorProps({ hasSuggestions }: GetSheetSnapBehaviorParams) {
  if (!hasSuggestions) {
    return {
      shouldHaveContainer: true,
      enableDynamicSizing: true,
    } as const;
  }

  return {
    shouldHaveContainer: false,
    enableDynamicSizing: false,
    snapPoints: ['90%'],
    keyboardBehavior: 'extend' as const,
  };
}

export const RecipientSheet = memo(RecipientSheetImplementation);
