import { useRef } from 'react';

import { deserializeTransaction } from '@stacks/transactions';

import { Approver, SheetRef } from '@leather.io/ui/native';

import { NonceCard } from './components/nonce-card';
import { NonceSheet } from './components/nonce-sheet';

interface NonceSectionProps {
  txHex: string;
  setTxHex(txHex: string): void;
}
export function NonceSection({ txHex, setTxHex }: NonceSectionProps) {
  const tx = deserializeTransaction(txHex);
  const nonceSheetRef = useRef<SheetRef>(null);

  return (
    <>
      <Approver.Section>
        <NonceCard
          nonce={tx.auth.spendingCondition.nonce.toString()}
          onPress={() => {
            nonceSheetRef.current?.present();
          }}
        />
      </Approver.Section>
      <NonceSheet
        sheetRef={nonceSheetRef}
        nonce={tx.auth.spendingCondition.nonce.toString()}
        txHex={txHex}
        setTxHex={setTxHex}
      />
    </>
  );
}
