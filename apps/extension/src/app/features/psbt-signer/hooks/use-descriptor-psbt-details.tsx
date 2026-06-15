import { useMemo } from 'react';

import { hexToBytes } from '@noble/hashes/utils';
import * as btc from '@scure/btc-signer';

import {
  compileWshDescriptor,
  getAddressFromOutScript,
  getBtcSignerLibNetworkConfigByMode,
  getDescriptorInputsWithDisallowedSighash,
  getDescriptorMatchingInputIndexes,
  getPsbtTxOutputs,
} from '@leather.io/bitcoin';
import type { Money } from '@leather.io/models';
import { createMoney } from '@leather.io/utils';

import { getBitcoinInputValue } from '@shared/crypto/bitcoin/bitcoin.utils';
import { logger } from '@shared/logger';

import { useCurrentNetwork } from '@app/store/networks/networks.selectors';

interface DescriptorPsbtDestination {
  address: string | null;
  value: Money;
}

export interface DescriptorPsbtDetails {
  policyAddress: string;
  destinations: DescriptorPsbtDestination[];
  amountLeavingPolicy: Money;
  fee: Money;
  hasDisallowedSighash: boolean;
}

// Derives an honest, descriptor-aware view of the PSBT: the policy (P2WSH)
// address being spent from, the amount leaving the policy (policy inputs minus
// change back to the policy), every non-change destination, and the true miner
// fee (all inputs minus all outputs). Returns null if it can't be parsed (e.g.
// no descriptor), so the approval screen can fall back to a raw warning rather
// than misleading numbers.
export function useDescriptorPsbtDetails(
  psbtHex: string,
  descriptor: string
): DescriptorPsbtDetails | null {
  const network = useCurrentNetwork();

  return useMemo(() => {
    try {
      const bitcoinNetwork = getBtcSignerLibNetworkConfigByMode(network.chain.bitcoin.mode);
      const { scriptPubKey } = compileWshDescriptor(descriptor);
      const policyAddress = getAddressFromOutScript(scriptPubKey, bitcoinNetwork);
      if (!policyAddress) return null;

      const tx = btc.Transaction.fromPSBT(hexToBytes(psbtHex));
      const matchedIndexes = getDescriptorMatchingInputIndexes(tx, scriptPubKey);
      const hasDisallowedSighash =
        getDescriptorInputsWithDisallowedSighash(tx, matchedIndexes).length > 0;

      let policyInputTotal = 0;
      let allInputsTotal = 0;
      for (let index = 0; index < tx.inputsLength; index++) {
        const value = getBitcoinInputValue(tx.getInput(index));
        allInputsTotal += value;
        if (matchedIndexes.includes(index)) policyInputTotal += value;
      }

      const outputs = getPsbtTxOutputs(tx).map(output => ({
        address: output.script ? getAddressFromOutScript(output.script, bitcoinNetwork) : null,
        value: Number(output.amount),
      }));
      const allOutputsTotal = outputs.reduce((total, output) => total + output.value, 0);
      const changeTotal = outputs
        .filter(output => output.address === policyAddress)
        .reduce((total, output) => total + output.value, 0);

      return {
        policyAddress,
        destinations: outputs
          .filter(output => output.address !== policyAddress)
          .map(output => ({ address: output.address, value: createMoney(output.value, 'BTC') })),
        amountLeavingPolicy: createMoney(Math.max(0, policyInputTotal - changeTotal), 'BTC'),
        fee: createMoney(Math.max(0, allInputsTotal - allOutputsTotal), 'BTC'),
        hasDisallowedSighash,
      };
    } catch (error) {
      logger.error('Unable to derive descriptor PSBT details', error);
      return null;
    }
  }, [descriptor, network, psbtHex]);
}
