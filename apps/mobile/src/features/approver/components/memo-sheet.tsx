import { InputSheetLayout } from '@/components/sheets/input-sheet.layout';
import { RpcStacksSelectors } from '@/shared/selectors/rpc-stacks.selectors';
import { t } from '@lingui/core/macro';

import { SheetRef } from '@leather.io/ui/native';

interface MemoSheetProps {
  sheetRef: SheetRef;
  memo: string;
  onChangeMemo(memo: string): void;
}
export function MemoSheet({ sheetRef, memo, onChangeMemo }: MemoSheetProps) {
  return (
    <InputSheetLayout
      sheetRef={sheetRef}
      initialValue={memo}
      title={t`Add memo`}
      placeholder={t`Memo`}
      submitTitle={t`Confirm`}
      inputTestId={RpcStacksSelectors.MemoSheetInput}
      submitTestId={RpcStacksSelectors.MemoSheetConfirmButton}
      onSubmit={value => {
        onChangeMemo(value);
        sheetRef.current?.close();
      }}
    />
  );
}
