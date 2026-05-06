import { useMemo } from 'react';

import type { TransactionInput } from '@scure/btc-signer/psbt';
import { bytesToHex } from '@stacks/common';

import { getBitcoinInputAddress, getBtcSignerLibNetworkConfigByMode } from '@leather.io/bitcoin';
import { isDefined, isUndefined } from '@leather.io/utils';

import { getBitcoinInputValue } from '@shared/crypto/bitcoin/bitcoin.utils';

import { useCurrentAccountNativeSegwitIndexZeroPayer } from '@app/store/accounts/blockchain/bitcoin/native-segwit-account.hooks';
import { useCurrentAccountTaprootIndexZeroPayer } from '@app/store/accounts/blockchain/bitcoin/taproot-account.hooks';
import { useCurrentNetwork } from '@app/store/networks/networks.selectors';

export interface PsbtInput {
  address: string | null;
  index?: number;
  isMutable: boolean;
  toSign: boolean;
  txid: string;
  value: number;
}

interface UseParsedInputsArgs {
  inputs: TransactionInput[];
  indexesToSign?: number[];
}
export function useParsedInputs({ inputs, indexesToSign }: UseParsedInputsArgs) {
  const network = useCurrentNetwork();
  const bitcoinNetwork = getBtcSignerLibNetworkConfigByMode(network.chain.bitcoin.mode);
  const bitcoinAddressNativeSegwit = useCurrentAccountNativeSegwitIndexZeroPayer().address;
  const { address: bitcoinAddressTaproot } = useCurrentAccountTaprootIndexZeroPayer();
  const signAll = isUndefined(indexesToSign);

  const psbtInputs = useMemo(
    () =>
      inputs.map((input, i) => {
        const inputAddress = isDefined(input.index)
          ? getBitcoinInputAddress(input, bitcoinNetwork)
          : null;
        const isCurrentAddress =
          inputAddress === bitcoinAddressNativeSegwit || inputAddress === bitcoinAddressTaproot;
        const canChange =
          isCurrentAddress &&
          !(!input.sighashType || input.sighashType === 0 || input.sighashType === 1);
        const toSignAll = isCurrentAddress && signAll;
        const toSignIndex = isCurrentAddress && !signAll && indexesToSign.includes(i);

        return {
          address: inputAddress,
          index: input.index,
          isMutable: canChange,
          toSign: toSignAll || toSignIndex,
          txid: input.txid ? bytesToHex(input.txid) : '',
          value: isDefined(input.index) ? getBitcoinInputValue(input) : 0,
        };
      }),
    [
      bitcoinAddressNativeSegwit,
      bitcoinAddressTaproot,
      bitcoinNetwork,
      indexesToSign,
      inputs,
      signAll,
    ]
  );

  const isPsbtMutable = useMemo(() => psbtInputs.some(input => input.isMutable), [psbtInputs]);

  return { isPsbtMutable, parsedInputs: psbtInputs };
}
