import type { BitcoinNetworkModes, Money, VaultAccount } from '@leather.io/models';
import { buildUnsignedMultisigBtcTransfer as buildSharedMultisigBtcTransfer } from '@leather.io/services';

import { createMultisigAccountAddresses } from '../vaults/multisig-account-addresses';
import { getMultisigDescriptor } from './btc-multisig-descriptor';
import { deriveMultisigAddress } from './derive-multisig-address';

interface BuildMultisigBtcTransferArgs {
  account: VaultAccount;
  recipient: string;
  amount: Money;
  feeRate: number;
}

function getBitcoinNetworkMode(network: VaultAccount['network']): BitcoinNetworkModes {
  return network === 'btc:mainnet' ? 'mainnet' : 'testnet';
}

export async function buildUnsignedMultisigBtcTransfer({
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
    network: getBitcoinNetworkMode(account.network),
    accountAddresses: createMultisigAccountAddresses(account),
    recipients: [{ address: recipient, amount }],
    feeRate,
  });
}
