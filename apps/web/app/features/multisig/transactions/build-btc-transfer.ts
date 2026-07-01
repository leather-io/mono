import {
  assembleWshMultisigPsbt,
  compileWshDescriptor,
  getBtcSignerLibNetworkConfigByMode,
} from '@leather.io/bitcoin';
import type { Money, VaultAccount } from '@leather.io/models';
import { getBitcoinCoinSelectionService } from '@leather.io/services';

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

export async function buildUnsignedMultisigBtcTransfer({
  account,
  recipient,
  amount,
  feeRate,
}: BuildMultisigBtcTransferArgs): Promise<string> {
  const network = getBtcSignerLibNetworkConfigByMode(resolveBtcNetworkMode(account.network));
  const { scriptPubKey, witnessScript } = compileWshDescriptor(getMultisigDescriptor(account));

  if (deriveMultisigAddress(account) !== account.multisigAddress)
    throw new Error(
      `Derived multisig address does not match vault address ${account.multisigAddress}`
    );

  const { inputs, outputs } = await getBitcoinCoinSelectionService().performCoinSelection({
    account: { account: createMultisigAccountAddresses(account) },
    recipients: [{ address: recipient, amount }],
    feeRate,
  });

  return assembleWshMultisigPsbt({
    scriptPubKey,
    witnessScript,
    inputs,
    outputs,
    changeAddress: account.multisigAddress,
    network,
  });
}
