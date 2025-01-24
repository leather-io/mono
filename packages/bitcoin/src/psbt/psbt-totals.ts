import { inferPaymentTypeFromAddress } from 'utils/bitcoin.utils';

import { createMoney, sumNumbers } from '@leather.io/utils';

import { PsbtInput } from './psbt-inputs';
import { PsbtOutput } from './psbt-outputs';

function calculateAddressInputsTotal(addresses: string[], inputs: PsbtInput[]) {
  const sumsByAddress = addresses.map(address =>
    inputs
      .filter(input => input.address === address)
      .map(input => input.value)
      .reduce((acc, curVal) => acc + curVal, 0)
  );

  return createMoney(sumNumbers(sumsByAddress), 'BTC');
}

function calculateAddressOutputsTotal(addresses: string[], outputs: PsbtOutput[]) {
  const sumsByAddress = addresses.map(address =>
    outputs
      .filter(output => output.address === address)
      .map(output => Number(output.value))
      .reduce((acc, curVal) => acc + curVal, 0)
  );
  return createMoney(sumNumbers(sumsByAddress), 'BTC');
}

function calculatePsbtInputsTotal(inputs: PsbtInput[]) {
  return createMoney(sumNumbers(inputs.map(input => input.value)), 'BTC');
}

function calculatePsbtOutputsTotal(outputs: PsbtOutput[]) {
  return createMoney(sumNumbers(outputs.map(output => output.value)), 'BTC');
}

interface GetPsbtTotalsProps {
  psbtAddresses: string[];
  parsedInputs: PsbtInput[];
  parsedOutputs: PsbtOutput[];
}
export function getPsbtTotals({ psbtAddresses, parsedInputs, parsedOutputs }: GetPsbtTotalsProps) {
  const nativeSegwitAddresses = psbtAddresses.filter(
    addr => inferPaymentTypeFromAddress(addr) === 'p2wpkh'
  );
  const taprootAddresses = psbtAddresses.filter(
    addr => inferPaymentTypeFromAddress(addr) === 'p2tr'
  );

  return {
    inputsTotalNativeSegwit: calculateAddressInputsTotal(nativeSegwitAddresses, parsedInputs),
    inputsTotalTaproot: calculateAddressInputsTotal(taprootAddresses, parsedInputs),
    outputsTotalNativeSegwit: calculateAddressOutputsTotal(nativeSegwitAddresses, parsedOutputs),
    outputsTotalTaproot: calculateAddressOutputsTotal(taprootAddresses, parsedOutputs),
    psbtInputsTotal: calculatePsbtInputsTotal(parsedInputs),
    psbtOutputsTotal: calculatePsbtOutputsTotal(parsedOutputs),
  };
}
