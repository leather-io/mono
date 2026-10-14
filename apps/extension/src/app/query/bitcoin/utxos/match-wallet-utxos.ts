import { bytesToHex } from '@stacks/common';

import type { OwnedUtxo } from '@leather.io/models';
import { isDefined } from '@leather.io/utils';

interface TransactionInputOutpoint {
  txid?: Uint8Array;
  index?: number;
}

export function matchInputsToWalletUtxos(
  inputs: TransactionInputOutpoint[],
  walletUtxos: OwnedUtxo[]
): OwnedUtxo[] {
  return inputs
    .map(input => {
      if (!input.txid) return undefined;
      const txid = bytesToHex(input.txid);
      return walletUtxos.find(utxo => utxo.txid === txid && utxo.vout === input.index);
    })
    .filter(isDefined);
}
