import { useEffect } from 'react';

import { useToastContext } from '@/components/toast/toast-context';
import { useNextNonce } from '@/queries/stacks/nonce/account-nonces.hooks';
import { useStacksSigners } from '@/store/keychains/stacks/stacks-keychains.read';
import { assertStacksSigner } from '@/store/keychains/stacks/utils';
import { t } from '@lingui/core/macro';
import { captureException } from '@sentry/react-native';

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

  const { data, isLoading, error } = useNextNonce(currentStacksAddress);

  useEffect(() => {
    if (error) {
      captureException(error, { extra: { context: 'nonce-loader' } });
      displayToast({
        title: t`Failed to load latest nonce`,
        type: 'error',
      });
    }
  }, [displayToast, error]);

  if (isLoading) return null;

  return children(data?.nonce ?? 0);
}
