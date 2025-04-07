import { useRef } from 'react';

import { RecipientSheet } from '@/features/send/components/recipient/v2/recipient-sheet';
import { RecipientToggle } from '@/features/send/components/recipient/v2/recipient-toggle';
import { ZodSchema } from 'zod';

import { SheetRef } from '@leather.io/ui/native';

interface RecipientProps {
  value: string;
  onChange(value: string): void;
  recipientSchema: ZodSchema;
}

export function Recipient({ onChange, value, recipientSchema }: RecipientProps) {
  const sheetRef = useRef<SheetRef>(null);
  return (
    <>
      <RecipientToggle value={value} onPress={() => sheetRef.current?.present()} invalid={false} />
      <RecipientSheet
        sheetRef={sheetRef}
        value={value}
        onChange={onChange}
        recipientSchema={recipientSchema}
      />
    </>
  );
}
