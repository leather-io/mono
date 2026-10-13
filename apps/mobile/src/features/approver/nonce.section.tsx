import { useRef } from 'react';

import { Approver, SheetInstance } from '@leather.io/ui/native';

import { NonceCard } from './components/nonce-card';
import { NonceSheet } from './components/nonce-sheet';

interface NonceSectionProps {
  nonce: string;
  onChangeNonce(nonce: string): void;
  disabled?: boolean;
}
export function NonceSection({ nonce, onChangeNonce, disabled }: NonceSectionProps) {
  const nonceSheetRef = useRef<SheetInstance>(null);

  return (
    <>
      <Approver.Section>
        <NonceCard
          nonce={nonce}
          onPress={() => {
            nonceSheetRef.current?.present();
          }}
          disabled={disabled}
        />
      </Approver.Section>
      <NonceSheet sheetRef={nonceSheetRef} nonce={nonce} onChangeNonce={onChangeNonce} />
    </>
  );
}
