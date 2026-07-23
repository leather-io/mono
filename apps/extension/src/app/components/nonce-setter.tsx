import { useAsync } from 'react-async-hook';

import { useFormikContext } from 'formik';

import { isDefined } from '@leather.io/utils';

import {
  StacksSendFormValues,
  StacksTransactionFormValues,
  type SwapFormValues,
} from '@shared/models/form.model';

import { useNextNonce } from '@app/query/stacks/nonce/account-nonces.hooks';
import { useCurrentStacksAccountAddress } from '@app/store/accounts/blockchain/stacks/stacks-account.hooks';
import { useCurrentPolicy } from '@app/store/policy/policy.selectors';

export function NonceSetter() {
  const { setFieldValue, touched, values } = useFormikContext<
    StacksSendFormValues | StacksTransactionFormValues | SwapFormValues
  >();
  const stxAddress = useCurrentStacksAccountAddress();
  const { data: nextNonce } = useNextNonce(stxAddress);
  const policy = useCurrentPolicy();
  const isStacksPolicy = policy?.chain === 'stacks';

  useAsync(async () => {
    if (isStacksPolicy) return;
    if (isDefined(nextNonce?.nonce) && !touched.nonce && values.nonce !== nextNonce?.nonce) {
      return await setFieldValue('nonce', nextNonce?.nonce);
    }
    return;
  }, [nextNonce?.nonce, isStacksPolicy]);

  return <></>;
}
