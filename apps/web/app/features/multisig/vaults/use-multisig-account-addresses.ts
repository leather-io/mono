import type {
  AccountAddresses,
  AccountId,
  VaultAccount,
  VaultAccountSummary,
} from '@leather.io/models';

const emptyAccountAddresses: AccountAddresses = {
  id: { fingerprint: 'multisig:none', accountIndex: 0 },
};

export function useMultisigAccountAddresses(
  account?: VaultAccount | VaultAccountSummary
): AccountAddresses {
  if (!account) return emptyAccountAddresses;

  const id: AccountId = {
    fingerprint: account.id,
    accountIndex: account.accountIndex,
  };
  const signerCount = 'signers' in account ? account.signers.length : account.signerCount;
  return account.network.startsWith('btc')
    ? {
        id,
        bitcoin: {
          type: 'fixedAddress',
          address: account.multisigAddress,
          paymentType: 'p2wsh',
          multisig: { threshold: account.threshold, signerCount },
        },
      }
    : {
        id,
        stacks: { stxAddress: account.multisigAddress },
      };
}
