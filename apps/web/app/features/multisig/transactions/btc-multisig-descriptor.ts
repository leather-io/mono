import type { VaultAccount, VaultAccountSigner } from '@leather.io/models';

// Expresses a signer as a descriptor key: the xpub child at `0/accountIndex`.
function getSignerKeyExpression(signer: VaultAccountSigner, accountIndex: number): string {
  if (!signer.xpub) throw new Error('BTC multisig signer is missing its xpub');
  return `${signer.xpub}/0/${accountIndex}`;
}

// Builds the `wsh(sortedmulti(...))` descriptor for a BTC vault account.
export function getMultisigDescriptor(account: VaultAccount): string {
  const keys = [...account.signers]
    .sort((a, b) => a.signerIndex - b.signerIndex)
    .map(signer => getSignerKeyExpression(signer, account.accountIndex));
  return `wsh(sortedmulti(${account.threshold},${keys.join(',')}))`;
}
