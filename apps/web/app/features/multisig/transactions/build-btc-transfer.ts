import {
  assembleWshMultisigPsbt,
  compileWshDescriptor,
  getAddressFromOutScript,
  getBtcSignerLibNetworkConfigByMode,
} from '@leather.io/bitcoin';
import type { AuthNetworkId, BitcoinNetworkModes, Money, VaultAccount } from '@leather.io/models';
import { getBitcoinCoinSelectionService } from '@leather.io/services';

import { createMultisigAccountAddresses } from '../vaults/multisig-account-addresses';
import { getMultisigDescriptor } from './btc-multisig-descriptor';

interface BuildMultisigBtcTransferArgs {
  account: VaultAccount;
  recipient: string;
  amount: Money;
  feeRate: number;
}

function getBitcoinNetworkMode(network: AuthNetworkId): BitcoinNetworkModes {
  return network === 'btc:mainnet' ? 'mainnet' : 'testnet';
}

export async function buildUnsignedMultisigBtcTransfer({
  account,
  recipient,
  amount,
  feeRate,
}: BuildMultisigBtcTransferArgs): Promise<string> {
  const network = getBtcSignerLibNetworkConfigByMode(getBitcoinNetworkMode(account.network));
  const { scriptPubKey, witnessScript } = compileWshDescriptor(getMultisigDescriptor(account));

  const derivedAddress = getAddressFromOutScript(scriptPubKey, network);
  if (derivedAddress !== account.multisigAddress)
    throw new Error(
      `Derived multisig address ${derivedAddress} does not match vault address ${account.multisigAddress}`
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
