import {
  AddressHashMode,
  AddressVersion,
  type StacksTransactionWire,
  addressFromPublicKeys,
  addressToString,
  createStacksPublicKey,
} from '@stacks/transactions';

import type { AuthNetworkId, Money, VaultAccount } from '@leather.io/models';
import { TransactionTypes, generateStacksUnsignedTransaction } from '@leather.io/stacks';
import { createMoney } from '@leather.io/utils';

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

function getOrderedSignerPublicKeys(account: VaultAccount): string[] {
  return [...account.signers]
    .sort((a, b) => a.signerIndex - b.signerIndex)
    .map(signer => signer.signingPubkey);
}

function assertDerivesToMultisigAddress(
  account: VaultAccount,
  publicKeys: string[],
  networkName: StacksNetworkName
) {
  const version =
    networkName === 'mainnet' ? AddressVersion.MainnetMultiSig : AddressVersion.TestnetMultiSig;
  const derivedAddress = addressToString(
    addressFromPublicKeys(
      version,
      AddressHashMode.P2SHNonSequential,
      account.threshold,
      publicKeys.map(createStacksPublicKey)
    )
  );
  if (derivedAddress !== account.multisigAddress)
    throw new Error(
      `Derived multisig sender ${derivedAddress} does not match vault address ${account.multisigAddress}`
    );
}

export async function buildUnsignedMultisigStxTransfer({
  account,
  recipient,
  amount,
  fee = createMoney(0, 'STX'),
  memo,
}: BuildMultisigStxTransferArgs): Promise<StacksTransactionWire> {
  const networkName = getStacksNetworkName(account.network);
  const publicKeys = getOrderedSignerPublicKeys(account);
  assertDerivesToMultisigAddress(account, publicKeys, networkName);
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
