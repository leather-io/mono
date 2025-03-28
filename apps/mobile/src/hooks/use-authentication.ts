import { useToastContext } from '@/components/toast/toast-context';
import { t } from '@lingui/macro';
import * as LocalAuthentication from 'expo-local-authentication';

async function assertEnrolled() {
  const enrollment = await LocalAuthentication.getEnrolledLevelAsync();
  if (enrollment === LocalAuthentication.SecurityLevel.NONE) {
    throw new Error('USER_NOT_ENROLLED');
  }
}

export function useAuthentication() {
  const { displayToast } = useToastContext();

  function displayError() {
    displayToast({
      title: t({
        id: 'authentication.user-not-enrolled',
        message: 'Device is not enrolled with PIN or biometrics',
      }),
      type: 'error',
    });
  }

  async function callIfEnrolled<T extends (...args: any) => any>(
    cb: T
  ): Promise<ReturnType<T> | undefined> {
    try {
      await assertEnrolled();
      return cb();
    } catch {
      displayError();
      return;
    }
  }

  return {
    callIfEnrolled,
    async authenticate() {
      return await callIfEnrolled(LocalAuthentication.authenticateAsync);
    },
  };
}
