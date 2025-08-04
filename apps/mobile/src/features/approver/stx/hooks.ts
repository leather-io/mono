import { useToastContext } from '@/components/toast/toast-context';
import { t } from '@lingui/core/macro';

export function useStxTransactionUpdatesHandler() {
  const { displayToast } = useToastContext();
  function changeMemoToastHandler(onChangeMemo: (memo: string) => void) {
    return function (memo: string) {
      try {
        onChangeMemo(memo);
        displayToast({
          title: t`Memo updated`,
          type: 'success',
        });
      } catch {
        displayToast({
          title: t`Failed to change memo`,
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
          title: t`Fee updated`,
          type: 'success',
        });
      } catch {
        displayToast({
          title: t`Failed to change fee`,
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
          title: t`Nonce updated`,
          type: 'success',
        });
      } catch {
        displayToast({
          title: t`Failed to change nonce`,
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
