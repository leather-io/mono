import { useEffect } from 'react';

import { useToastContext } from '@/components/toast/toast-context';
import { useNextNonce } from '@/queries/stacks/nonce/account-nonces.hooks';
import { useStacksSigners } from '@/store/keychains/stacks/stacks-keychains.read';
import { assertStacksSigner } from '@/store/keychains/stacks/utils';
import { t } from '@lingui/core/macro';

export function NonceLoader({
  accountId,
  children,
}: {
  accountId: string;
  children(nonce: number): React.ReactNode;
}) {
  const { fromAccountId } = useStacksSigners();
  const signer = fromAccountId(accountId)[0];
  const { displayToast } = useToastContext();
  assertStacksSigner(signer);
  const currentStacksAddress = signer.address;

  const {
    data: nonceResponse,
    isLoading: isNonceLoading,
    isError,
  } = useNextNonce(currentStacksAddress);

  useEffect(() => {
    if (!isNonceLoading && (isError || !nonceResponse?.nonce)) {
      // TODO: track this
      displayToast({
        title: t`Failed to load latest nonce`,
        type: 'error',
      });
    }
  }, [displayToast, isError, nonceResponse?.nonce, isNonceLoading]);

  if (isNonceLoading) return null;

  return children(nonceResponse?.nonce || 1);
}
