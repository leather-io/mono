import { bytesToHex } from '@stacks/common';
import { Pc, serializeCV } from '@stacks/transactions';

import { Money } from '@leather.io/models';

import { StacksSigner } from '../signer/signer';
import { formatContractIdString, getStacksAssetStringParts } from '../stacks.utils';
import { generateStacksUnsignedTransaction } from './generate-unsigned-transaction';
import { createSip10FnArgs } from './get-contract-fn-args';
import { TransactionTypes } from './transaction.types';

interface CreateTransferSip10TxHex {
  signer: StacksSigner;
  assetId: string;
  recipient: string;
  amount: number;
  nonce: number;
  fee: Money;
  memo?: string;
}

export async function createTransferSip10TxHex({
  signer,
  assetId,
  recipient,
  amount,
  nonce,
  fee,
  memo,
}: CreateTransferSip10TxHex) {
  const { contractAddress, contractAssetName, contractName } = getStacksAssetStringParts(assetId);

  const currentStacksAddress = signer.address;

  const fnArgs = createSip10FnArgs({
    amount: amount,
    senderStacksAddress: currentStacksAddress,
    recipientStacksAddress: recipient,
    memo,
  });

  const tx = await generateStacksUnsignedTransaction({
    txType: TransactionTypes.ContractCall,
    publicKey: bytesToHex(signer.publicKey),
    contractAddress,
    contractName,
    functionArgs: fnArgs.map(arg => serializeCV(arg)),
    functionName: 'transfer',
    nonce,
    fee,
    postConditions: [
      Pc.principal(currentStacksAddress)
        .willSendEq(amount)
        .ft(formatContractIdString({ contractAddress, contractName }), contractAssetName),
    ],
  });

  const txHex = tx.serialize();
  return txHex;
}
