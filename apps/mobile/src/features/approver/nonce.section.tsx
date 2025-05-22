import { useRef } from 'react';

import { Approver, SheetRef } from '@leather.io/ui/native';

import { NonceCard } from './components/nonce-card';
import { NonceSheet } from './components/nonce-sheet';

interface NonceSectionProps {
  nonce: string;
  onChangeNonce(nonce: string): void;
}
export function NonceSection({ nonce, onChangeNonce }: NonceSectionProps) {
  const nonceSheetRef = useRef<SheetRef>(null);

  return (
    <>
      <Approver.Section borderTop>
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
