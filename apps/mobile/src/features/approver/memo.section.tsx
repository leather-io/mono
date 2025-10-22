import { useRef } from 'react';

import { Approver, SheetInstance } from '@leather.io/ui/native';

import { MemoCard } from './components/memo-card';
import { MemoSheet } from './components/memo-sheet';

interface MemoSectionProps {
  memo: string;
  disabled?: boolean;
  onChangeMemo(memo: string): void;
}

export function MemoSection({ memo, disabled, onChangeMemo }: MemoSectionProps) {
  const memoSheetRef = useRef<SheetInstance>(null);

  return (
    <>
      <Approver.Section>
        <MemoCard
          memo={memo}
          disabled={disabled}
          onPress={() => {
            memoSheetRef.current?.present();
          }}
        />
      </Approver.Section>
      <MemoSheet onChangeMemo={onChangeMemo} sheetRef={memoSheetRef} memo={memo} />
    </>
  );
}
