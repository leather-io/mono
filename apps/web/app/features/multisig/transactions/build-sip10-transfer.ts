import {
  Pc,
  PostConditionMode,
  type StacksTransactionWire,
  serializeCV,
} from '@stacks/transactions';

import type { Money, VaultAccount } from '@leather.io/models';
import {
  TransactionTypes,
  createSip10FnArgs,
  formatContractIdString,
  generateStacksUnsignedTransaction,
  getStacksAssetStringParts,
} from '@leather.io/stacks';
import { createMoney } from '@leather.io/utils';

import { getStxTransactionNetwork } from './build-stx-transfer';
import { deriveMultisigAddress, getOrderedSigningPubkeys } from './derive-multisig-address';

const placeholderNonce = 0;

interface BuildMultisigSip10TransferArgs {
  account: VaultAccount;
  assetId: string;
  recipient: string;
  amount: Money;
  fee?: Money;
  memo?: string;
}

export async function buildUnsignedMultisigSip10Transfer({
  account,
  assetId,
  recipient,
  amount,
  fee = createMoney(0, 'STX'),
  memo,
}: BuildMultisigSip10TransferArgs): Promise<StacksTransactionWire> {
  const publicKeys = getOrderedSigningPubkeys(account);
  if (deriveMultisigAddress(account) !== account.multisigAddress)
    throw new Error(
      `Derived multisig sender does not match vault address ${account.multisigAddress}`
    );

  const { contractAddress, contractAssetName, contractName } = getStacksAssetStringParts(assetId);
  const baseUnitAmount = amount.amount.toFixed();

  const functionArgs = createSip10FnArgs({
    amount: baseUnitAmount,
    senderStacksAddress: account.multisigAddress,
    recipientStacksAddress: recipient,
    memo,
  });

  return generateStacksUnsignedTransaction({
    txType: TransactionTypes.ContractCall,
    contractAddress,
    contractName,
    functionName: 'transfer',
    functionArgs: functionArgs.map(arg => serializeCV(arg)),
    postConditions: [
      Pc.principal(account.multisigAddress)
        .willSendEq(baseUnitAmount)
        .ft(formatContractIdString({ contractAddress, contractName }), contractAssetName),
    ],
    postConditionMode: PostConditionMode.Deny,
    fee,
    nonce: placeholderNonce,
    network: getStxTransactionNetwork(account.network),
    publicKeys,
    numSignatures: account.threshold,
    useNonSequentialMultiSig: true,
  });
}
