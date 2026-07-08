import { STACKS_TESTNET } from '@stacks/network';
import { type StacksTransactionWire } from '@stacks/transactions';
import { customNetworkConfig } from '~/constants/custom-network-config';

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

// Custom network keeps the testnet address version but signs with its own chain id.
function getStxTransactionNetwork(network: AuthNetworkId) {
  if (network === 'stx:mainnet') return 'mainnet';
  if (customNetworkConfig?.stacksChainId !== undefined)
    return { ...STACKS_TESTNET, chainId: customNetworkConfig.stacksChainId };
  return 'testnet';
}

export async function buildUnsignedMultisigStxTransfer({
  account,
  recipient,
  amount,
  fee = createMoney(0, 'STX'),
  memo,
}: BuildMultisigStxTransferArgs): Promise<StacksTransactionWire> {
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
    network: getStxTransactionNetwork(account.network),
    publicKeys,
    numSignatures: account.threshold,
    useNonSequentialMultiSig: true,
    memo,
  });
}
