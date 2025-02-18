import { BitcoinNetworkModes } from '@leather.io/models';
import { createMoney, subtractMoney } from '@leather.io/utils';

import { getPsbtTxInputs, getPsbtTxOutputs } from '../utils/bitcoin.utils';
import { BitcoinAddress } from '../validation/bitcoin-address';
import { getParsedInputs } from './psbt-inputs';
import { getParsedOutputs } from './psbt-outputs';
import { getPsbtTotals } from './psbt-totals';
import { getPsbtAsTransaction } from './utils';

interface GetPsbtDetailsArgs {
  psbtHex: string;
  psbtAddresses: BitcoinAddress[];
  networkMode: BitcoinNetworkModes;
  indexesToSign?: number[];
}
export function getPsbtDetails({
  psbtHex,
  networkMode,
  indexesToSign,
  psbtAddresses,
}: GetPsbtDetailsArgs) {
  const tx = getPsbtAsTransaction(psbtHex);
  const inputs = getPsbtTxInputs(tx);
  const outputs = getPsbtTxOutputs(tx);

  const { isPsbtMutable, parsedInputs } = getParsedInputs({
    inputs,
    indexesToSign,
    networkMode,
    psbtAddresses,
  });
  const parsedOutputs = getParsedOutputs({ isPsbtMutable, outputs, networkMode, psbtAddresses });

  const {
    inputsTotalNativeSegwit,
    inputsTotalTaproot,
    outputsTotalNativeSegwit,
    outputsTotalTaproot,
    psbtInputsTotal,
    psbtOutputsTotal,
  } = getPsbtTotals({
    psbtAddresses,
    parsedInputs,
    parsedOutputs,
  });
  function getFee() {
    if (psbtInputsTotal.amount.isGreaterThan(psbtOutputsTotal.amount))
      return subtractMoney(psbtInputsTotal, psbtOutputsTotal);
    return createMoney(0, 'BTC');
  }
  return {
    addressNativeSegwitTotal: subtractMoney(inputsTotalNativeSegwit, outputsTotalNativeSegwit),
    addressTaprootTotal: subtractMoney(inputsTotalTaproot, outputsTotalTaproot),
    fee: getFee(),
    isPsbtMutable,
    psbtInputs: parsedInputs,
    psbtOutputs: parsedOutputs,
  };
}
