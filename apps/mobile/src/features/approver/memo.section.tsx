import { useRef } from 'react';

import { PayloadType, deserializeTransaction } from '@stacks/transactions';

import { Approver, SheetRef } from '@leather.io/ui/native';

import { MemoCard } from './components/memo-card';
import { MemoSheet } from './components/memo-sheet';
import { TxOptions } from './utils';

interface MemoSectionProps {
  txHex: string;
  setTxHex(txHex: string): void;
  txOptions: TxOptions;
  isMemoEditable: boolean;
}

export function MemoSection({ txHex, setTxHex, txOptions, isMemoEditable }: MemoSectionProps) {
  const tx = deserializeTransaction(txHex);
  const memoSheetRef = useRef<SheetRef>(null);

  if (tx.payload.payloadType !== PayloadType.TokenTransfer) return null;

  return (
    <>
      <Approver.Section>
        <MemoCard
          memo={tx.payload.memo.content}
          isEditable={isMemoEditable}
          onPress={() => {
            memoSheetRef.current?.present();
          }}
        />
      </Approver.Section>
      <MemoSheet
        sheetRef={memoSheetRef}
        memo={tx.payload.memo.content}
        txHex={txHex}
        setTxHex={setTxHex}
        txOptions={txOptions}
      />
    </>
  );
}
