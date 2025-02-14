import type { TransactionOutput } from '@scure/btc-signer/psbt';
import { getBtcSignerLibNetworkConfigByMode } from 'utils/bitcoin.network';
import { getAddressFromOutScript } from 'utils/bitcoin.utils';

import { BitcoinAddress, BitcoinNetworkModes, createBitcoinAddress } from '@leather.io/models';
import { isDefined, isUndefined } from '@leather.io/utils';

export interface PsbtOutput {
  address: BitcoinAddress;
  isMutable: boolean;
  toSign: boolean;
  value: number;
}

interface GetParsedOutputsArgs {
  isPsbtMutable: boolean;
  outputs: TransactionOutput[];
  networkMode: BitcoinNetworkModes;
  psbtAddresses: BitcoinAddress[];
}

export function getParsedOutputs({
  isPsbtMutable,
  outputs,
  networkMode,
  psbtAddresses,
}: GetParsedOutputsArgs): PsbtOutput[] {
  const bitcoinNetwork = getBtcSignerLibNetworkConfigByMode(networkMode);

  return outputs
    .map(output => {
      if (isUndefined(output.script)) {
        // TODO: handle error here
        // logger.error('Output has no script');
        return;
      }
      const outputAddress = createBitcoinAddress(
        getAddressFromOutScript(output.script, bitcoinNetwork)
      );

      const isCurrentAddress = psbtAddresses.includes(outputAddress);

      return {
        address: outputAddress,
        isMutable: isPsbtMutable,
        toSign: isCurrentAddress,
        value: Number(output.amount),
      };
    })
    .filter(isDefined);
}
