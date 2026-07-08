import type { VaultAccount } from '@leather.io/models';

export function getMySigningPubkey(account: VaultAccount, myPublicKey: string | undefined): string {
  const mySigner = account.signers.find(signer => signer.publicKey === myPublicKey);
  if (!mySigner) throw new Error('Connected account is not a signer on this vault account');
  return mySigner.signingPubkey;
}
