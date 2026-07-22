import {
  type CoinSelectionRecipient,
  buildUnsignedMultisigBtcPsbt,
  getBtcSignerLibNetworkConfigByMode,
  getWshDescriptorAddress,
} from '@leather.io/bitcoin';
import type { AccountAddresses, BitcoinNetworkModes } from '@leather.io/models';

import { getBitcoinCoinSelectionService } from '../inversify.config';

export interface BuildUnsignedMultisigBtcTransferArgs {
  descriptor: string;
  // Expected sender; re-derived from the descriptor and asserted to match.
  multisigAddress: string;
  network: BitcoinNetworkModes;
  // Coin-selection input — a `fixedAddress` p2wsh entry with multisig sizing
  // info. Each app supplies its own maker (web: createMultisigAccountAddresses,
  // extension: createPolicyAddresses).
  accountAddresses: AccountAddresses;
  recipients: CoinSelectionRecipient[];
  feeRate: number;
  // Send-all: recipients carry the fee-deducted spendable amount and no change
  // output is created, matching the coin-selection service's isMaxSpend contract.
  isMaxSpend?: boolean;
}

// Builds an unsigned P2WSH multisig PSBT (base64) for a policy/vault account:
// coin selection over the multisig address, then descriptor-driven assembly.
// Lives in @leather.io/services (not @leather.io/bitcoin) because it depends on
// the coin-selection service.
export async function buildUnsignedMultisigBtcTransfer(
  {
    descriptor,
    multisigAddress,
    network,
    accountAddresses,
    recipients,
    feeRate,
    isMaxSpend,
  }: BuildUnsignedMultisigBtcTransferArgs,
  signal?: AbortSignal
): Promise<string> {
  if (getWshDescriptorAddress(descriptor, network) !== multisigAddress)
    throw new Error(`Derived multisig address does not match multisig address ${multisigAddress}`);

  const { inputs, outputs } = await getBitcoinCoinSelectionService().performCoinSelection(
    { account: { account: accountAddresses }, recipients, feeRate, isMaxSpend },
    signal
  );

  return buildUnsignedMultisigBtcPsbt({
    descriptor,
    inputs,
    outputs,
    changeAddress: multisigAddress,
    network: getBtcSignerLibNetworkConfigByMode(network),
  });
}
