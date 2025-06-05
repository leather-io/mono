import { useRef } from 'react';

import { Approver, SheetInstance } from '@leather.io/ui/native';

import { NonceCard } from './components/nonce-card';
import { NonceSheet } from './components/nonce-sheet';

interface NonceSectionProps {
  nonce: string;
  onChangeNonce(nonce: string): void;
}
export function NonceSection({ nonce, onChangeNonce }: NonceSectionProps) {
  const nonceSheetRef = useRef<SheetInstance>(null);

  return (
    <>
      <Approver.Section>
        <NonceCard
          nonce={nonce}
          onPress={() => {
            nonceSheetRef.current?.present();
          }}
        />
      </Approver.Section>
      <NonceSheet sheetRef={nonceSheetRef} nonce={nonce} onChangeNonce={onChangeNonce} />
    </>
  );
}
