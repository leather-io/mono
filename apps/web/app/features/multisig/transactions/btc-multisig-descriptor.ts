import type { VaultAccount, VaultAccountSigner } from '@leather.io/models';

// Expresses a signer as a descriptor key.
function getSignerKeyExpression(signer: VaultAccountSigner): string {
  if (signer.xpub && signer.derivationIndex !== null)
    return `${signer.xpub}/0/${signer.derivationIndex}`;
  return signer.signingPubkey;
}

// Builds the `wsh(sortedmulti(...))` descriptor for a BTC vault account.
export function getMultisigDescriptor(account: VaultAccount): string {
  const keys = [...account.signers]
    .sort((a, b) => a.signerIndex - b.signerIndex)
    .map(getSignerKeyExpression);
  return `wsh(sortedmulti(${account.threshold},${keys.join(',')}))`;
}
