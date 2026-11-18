import { useAsync } from 'react-async-hook';
import { useFormContext } from 'react-hook-form';

import { isDefined } from '@leather.io/utils';

import {
  type StacksSendFormValues,
  type StacksTransactionFormValues,
} from '@shared/models/form.model';

import { useNextNonce } from '@app/query/stacks/nonce/account-nonces.hooks';
import { useCurrentStacksAccountAddress } from '@app/store/accounts/blockchain/stacks/stacks-account.hooks';
import { useCurrentPolicy } from '@app/store/policy/policy.selectors';

export function NonceSetter() {
  const { formState, getFieldState, setValue, watch } = useFormContext<
    StacksSendFormValues | StacksTransactionFormValues
  >();
  const nonce = watch('nonce');
  const { isTouched } = getFieldState('nonce', formState);
  const stxAddress = useCurrentStacksAccountAddress();
  const { data: nextNonce } = useNextNonce(stxAddress);
  const policy = useCurrentPolicy();
  const isStacksPolicy = policy?.chain === 'stacks';

  useAsync(async () => {
    if (isStacksPolicy) return;
    if (isDefined(nextNonce?.nonce) && !isTouched && nonce !== nextNonce.nonce) {
      setValue('nonce', nextNonce.nonce);
    }
    return Promise.resolve();
  }, [nextNonce?.nonce, isStacksPolicy]);

  return <></>;
}
