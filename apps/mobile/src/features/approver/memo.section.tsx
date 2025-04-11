import { useRef } from 'react';

import { deserializeTransaction } from '@stacks/transactions';

import { Approver, SheetRef } from '@leather.io/ui/native';

import { MemoCard } from './components/memo-card';
import { MemoSheet } from './components/memo-sheet';
import { TxOptions, assertTokenTransferPayload } from './utils';

interface MemoSectionProps {
  txHex: string;
  setTxHex(txHex: string): void;
  txOptions: TxOptions;
  isMemoEditable: boolean;
}

export function MemoSection({ txHex, setTxHex, txOptions, isMemoEditable }: MemoSectionProps) {
  const tx = deserializeTransaction(txHex);
  const memoSheetRef = useRef<SheetRef>(null);
  assertTokenTransferPayload(tx.payload);
  const { memo } = tx.payload;

  return (
    <>
      <Approver.Section>
        <MemoCard
          memo={memo.content}
          isEditable={isMemoEditable}
          onPress={() => {
            memoSheetRef.current?.present();
          }}
        />
      </Approver.Section>
      <MemoSheet
        sheetRef={memoSheetRef}
        memo={memo.content}
        txHex={txHex}
        setTxHex={setTxHex}
        txOptions={txOptions}
      />
    </>
  );
}
