import type { Money, VaultAccount } from '@leather.io/models';
import { buildUnsignedMultisigBtcTransfer as buildSharedMultisigBtcTransfer } from '@leather.io/services';

import { resolveBtcNetworkMode } from '../network/resolve-btc-network-mode';
import { createMultisigAccountAddresses } from '../vaults/multisig-account-addresses';
import { getMultisigDescriptor } from './btc-multisig-descriptor';
import { deriveMultisigAddress } from './derive-multisig-address';

interface BuildMultisigBtcTransferArgs {
  account: VaultAccount;
  recipient: string;
  amount: Money;
  feeRate: number;
}

export function buildUnsignedMultisigBtcTransfer({
  account,
  recipient,
  amount,
  feeRate,
}: BuildMultisigBtcTransferArgs): Promise<string> {
  if (deriveMultisigAddress(account) !== account.multisigAddress)
    throw new Error(
      `Derived multisig address does not match vault address ${account.multisigAddress}`
    );
  return buildSharedMultisigBtcTransfer({
    descriptor: getMultisigDescriptor(account),
    multisigAddress: account.multisigAddress,
    network: resolveBtcNetworkMode(account.network),
    accountAddresses: createMultisigAccountAddresses(account),
    recipients: [{ address: recipient, amount }],
    feeRate,
  });
}
