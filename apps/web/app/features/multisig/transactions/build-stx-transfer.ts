import { type StacksTransactionWire } from '@stacks/transactions';

import type { AuthNetworkId, Money, VaultAccount } from '@leather.io/models';
import { TransactionTypes, generateStacksUnsignedTransaction } from '@leather.io/stacks';
import { createMoney } from '@leather.io/utils';

import { deriveMultisigAddress, getOrderedSigningPubkeys } from './derive-multisig-address';

const placeholderNonce = 0;

interface BuildMultisigStxTransferArgs {
  account: VaultAccount;
  recipient: string;
  amount: Money;
  fee?: Money;
  memo?: string;
}

type StacksNetworkName = 'mainnet' | 'testnet';

function getStacksNetworkName(network: AuthNetworkId): StacksNetworkName {
  return network === 'stx:mainnet' ? 'mainnet' : 'testnet';
}

export async function buildUnsignedMultisigStxTransfer({
  account,
  recipient,
  amount,
  fee = createMoney(0, 'STX'),
  memo,
}: BuildMultisigStxTransferArgs): Promise<StacksTransactionWire> {
  const networkName = getStacksNetworkName(account.network);
  const publicKeys = getOrderedSigningPubkeys(account);
  if (deriveMultisigAddress(account) !== account.multisigAddress)
    throw new Error(
      `Derived multisig sender does not match vault address ${account.multisigAddress}`
    );
  return generateStacksUnsignedTransaction({
    txType: TransactionTypes.StxTokenTransfer,
    recipient,
    amount,
    fee,
    nonce: placeholderNonce,
    network: networkName,
    publicKeys,
    numSignatures: account.threshold,
    useNonSequentialMultiSig: true,
    memo,
  });
}
