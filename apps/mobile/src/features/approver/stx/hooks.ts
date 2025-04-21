import { useToastContext } from '@/components/toast/toast-context';
import { t } from '@lingui/macro';

export function useStxTransactionUpdatesHandler() {
  const { displayToast } = useToastContext();
  function changeMemoToastHandler(onChangeMemo: (memo: string) => void) {
    return function (memo: string) {
      try {
        onChangeMemo(memo);
        displayToast({
          title: t({
            id: 'approver.send.stx.success.change-memo',
            message: 'Memo updated',
          }),
          type: 'success',
        });
      } catch {
        displayToast({
          title: t({
            id: 'approver.send.stx.error.change-memo',
            message: 'Failed to change memo',
          }),
          type: 'error',
        });
      }
    };
  }
  function changeFeeToastHandler(onChangeFee: (fee: number) => void) {
    return function (fee: number) {
      try {
        onChangeFee(fee);
        displayToast({
          title: t({
            id: 'approver.send.stx.success.change-fee',
            message: 'Fee updated',
          }),
          type: 'success',
        });
      } catch {
        displayToast({
          title: t({
            id: 'approver.send.stx.error.change-fee',
            message: 'Failed to change fee',
          }),
          type: 'error',
        });
      }
    };
  }
  function changeNonceToastHandler(onChangeNonce: (nonce: string) => void) {
    return function (nonce: string) {
      try {
        onChangeNonce(nonce);

        displayToast({
          title: t({
            id: 'approver.send.stx.error.change-fee',
            message: 'Nonce updated',
          }),
          type: 'success',
        });
      } catch {
        displayToast({
          title: t({
            id: 'approver.send.stx.error.change-nonce',
            message: 'Failed to change nonce',
          }),
          type: 'error',
        });
      }
    };
  }
  return {
    changeMemoToastHandler,
    changeFeeToastHandler,
    changeNonceToastHandler,
  };
}
