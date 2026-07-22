import { STACKS_TESTNET } from '@stacks/network';
import {
  AddressHashMode,
  AddressVersion,
  FungibleConditionCode,
  PostConditionMode,
  PostConditionType,
  addressFromPublicKeys,
  addressToString,
  createStacksPublicKey,
  cvToString,
} from '@stacks/transactions';

import { isSip10TransferContactCall } from '@leather.io/stacks';
import { createMoney } from '@leather.io/utils';

import {
  buildUnsignedPolicySip10Transfer,
  buildUnsignedPolicyStxTransfer,
} from './build-policy-stacks-transfer';

const publicKeys = [
  '0250863ad64a87ae8a2fe83c1af1a8403cb53f53e486d8511dad8a04887e5b2352',
  '03774ae7f858a9411e5ef4246b70c65aac5649980be5c17891bbec17895da008cb',
  '02f9308a019258c31049344f85f89d5229b531c845836f99b08601f113bce036f9',
];

const recipient = 'ST2CY5V39NHDPWSXMW9QDT3HC3GD6Q6XX4CFRK9AG';
const assetId = 'ST1F7QA2MDF17S807EPA36TSS8AMEFY4KA9TVGWXT.sbtc-token::sbtc-token';

function deriveTestnetAddress(threshold: number, keys: string[]) {
  return addressToString(
    addressFromPublicKeys(
      AddressVersion.TestnetMultiSig,
      AddressHashMode.P2SHNonSequential,
      threshold,
      keys.map(createStacksPublicKey)
    )
  );
}

const policyAddress = deriveTestnetAddress(2, publicKeys);

function makePolicy() {
  return {
    id: `deadbeef/0/${policyAddress}/testnet`,
    parentAccountId: 'deadbeef/0',
    networkId: 'testnet',
    address: policyAddress,
    role: 'signer' as const,
    chain: 'stacks' as const,
    publicKeys,
    threshold: 2,
  };
}

describe(buildUnsignedPolicyStxTransfer.name, () => {
  test('builds a non-sequential multisig transfer with placeholder nonce 0', async () => {
    const tx = await buildUnsignedPolicyStxTransfer({
      policy: makePolicy(),
      network: STACKS_TESTNET,
      recipient,
      amount: createMoney(1_000_000, 'STX'),
      fee: createMoney(3000, 'STX'),
    });

    const { spendingCondition } = tx.auth;
    expect(spendingCondition.hashMode).toEqual(AddressHashMode.P2SHNonSequential);
    expect(Number(spendingCondition.nonce)).toEqual(0);
    expect(Number(spendingCondition.fee)).toEqual(3000);
    expect(
      'signaturesRequired' in spendingCondition && spendingCondition.signaturesRequired
    ).toEqual(2);
  });

  test('defaults the fee to zero for the estimation pass', async () => {
    const tx = await buildUnsignedPolicyStxTransfer({
      policy: makePolicy(),
      network: STACKS_TESTNET,
      recipient,
      amount: createMoney(1_000_000, 'STX'),
    });

    expect(Number(tx.auth.spendingCondition.fee)).toEqual(0);
  });
});

describe(buildUnsignedPolicySip10Transfer.name, () => {
  test('builds a non-sequential multisig contract call with placeholder nonce 0', async () => {
    const tx = await buildUnsignedPolicySip10Transfer({
      policy: makePolicy(),
      network: STACKS_TESTNET,
      assetId,
      recipient,
      baseUnitAmount: '2500000',
      fee: createMoney(3000, 'STX'),
    });

    const { spendingCondition } = tx.auth;
    expect(spendingCondition.hashMode).toEqual(AddressHashMode.P2SHNonSequential);
    expect(Number(spendingCondition.nonce)).toEqual(0);
    expect(Number(spendingCondition.fee)).toEqual(3000);
    expect(
      'signaturesRequired' in spendingCondition && spendingCondition.signaturesRequired
    ).toEqual(2);
  });

  test('calls transfer on the token contract with the policy as sender', async () => {
    const tx = await buildUnsignedPolicySip10Transfer({
      policy: makePolicy(),
      network: STACKS_TESTNET,
      assetId,
      recipient,
      baseUnitAmount: '2500000',
    });

    if (!isSip10TransferContactCall(tx)) throw new Error('Expected a SIP-10 transfer call');
    expect(addressToString(tx.payload.contractAddress)).toEqual(
      'ST1F7QA2MDF17S807EPA36TSS8AMEFY4KA9TVGWXT'
    );
    expect(tx.payload.contractName.content).toEqual('sbtc-token');
    expect(tx.payload.functionName.content).toEqual('transfer');
    expect(cvToString(tx.payload.functionArgs[0])).toEqual('u2500000');
    expect(cvToString(tx.payload.functionArgs[1])).toEqual(policyAddress);
    expect(cvToString(tx.payload.functionArgs[2])).toEqual(recipient);
    expect(cvToString(tx.payload.functionArgs[3])).toEqual('none');
  });

  test('attaches a deny-mode FT post condition for the exact amount from the policy', async () => {
    const tx = await buildUnsignedPolicySip10Transfer({
      policy: makePolicy(),
      network: STACKS_TESTNET,
      assetId,
      recipient,
      baseUnitAmount: '2500000',
    });

    expect(tx.postConditionMode).toEqual(PostConditionMode.Deny);
    expect(tx.postConditions.values).toHaveLength(1);
    const postCondition = tx.postConditions.values[0];
    if (postCondition.conditionType !== PostConditionType.Fungible)
      throw new Error('Expected a fungible token post condition');
    expect(postCondition.conditionCode).toEqual(FungibleConditionCode.Equal);
    expect(Number(postCondition.amount)).toEqual(2_500_000);
    expect(postCondition.asset.assetName.content).toEqual('sbtc-token');
    if (!('address' in postCondition.principal))
      throw new Error('Expected a standard principal post condition');
    expect(addressToString(postCondition.principal.address)).toEqual(policyAddress);
  });
});
