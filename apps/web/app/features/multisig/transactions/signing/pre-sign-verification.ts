import type { MultisigTransaction, VaultAccount } from '@leather.io/models';

interface PreSignVerificationArgs {
  transaction: MultisigTransaction;
  account: VaultAccount;
}

// §7 pre-signing verification — the first step of the signing ceremony, run at the
// top of every sign path so it can never be bypassed (§7.5). It re-derives the
// multisig address from the served signer set and asserts it matches the account,
// confirms the proposer is a signer, and verifies the proposer's commitment over
// the payload — throwing on any failure. Body is deferred to the verification PR;
// the signature is fixed now so each sign call passes the data the full flow needs.
export function preSignVerification({ transaction, account }: PreSignVerificationArgs): void {
  void transaction;
  void account;
}
