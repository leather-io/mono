import { useNextNonce } from '@/queries/stacks/nonce/account-nonces.hooks';
import { useStacksSigners } from '@/store/keychains/stacks/stacks-keychains.read';
import { assertStacksSigner } from '@/store/keychains/stacks/utils';

export function NonceLoader({
  accountId,
  children,
}: {
  accountId: string;
  children(nonce: number): React.ReactNode;
}) {
  const { fromAccountId } = useStacksSigners();
  const signer = fromAccountId(accountId)[0];
  assertStacksSigner(signer);
  const currentStacksAddress = signer.address;

  const {
    data: nonceResponse,
    isLoading: isNonceLoading,
    isError,
  } = useNextNonce(currentStacksAddress);
  if (isNonceLoading) return null;
  if (isError || !nonceResponse?.nonce) {
    // TODO: track this
    throw new Error('Nonce request failed');
  }

  return children(nonceResponse?.nonce);
}
