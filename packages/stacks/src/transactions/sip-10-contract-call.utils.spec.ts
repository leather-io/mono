import {
  Pc,
  PostConditionMode,
  boolCV,
  bufferCVFromString,
  makeUnsignedContractCall,
  noneCV,
  principalCV,
  privateKeyToPublic,
  publicKeyToHex,
  someCV,
  uintCV,
} from '@stacks/transactions';

import { getVerifiedSip10TransferDetails } from './sip-10-contract-call.utils';

const publicKey = publicKeyToHex(privateKeyToPublic('11'.repeat(32) + '01'));
const sender = 'ST1EXHZSN8MJSJ9DSG994G1V8CNKYXGMK7Z4SA6DH';
const recipient = 'ST2CY5V39NHDPWSXMW9QDT3HC3GD6Q6XX4CFRK9AG';
const contractAddress = 'ST1F7QA2MDF17S807EPA36TSS8AMEFY4KA9TVGWXT';
const contractName = 'sbtc-token';
const contractId = `${contractAddress}.${contractName}`;
const assetName = 'sbtc-token';
const amount = 2_500_000;

type ContractCallOptions = Parameters<typeof makeUnsignedContractCall>[0];

function makeTransferTx(overrides: Partial<ContractCallOptions> = {}) {
  return makeUnsignedContractCall({
    contractAddress,
    contractName,
    functionName: 'transfer',
    functionArgs: [uintCV(amount), principalCV(sender), principalCV(recipient), noneCV()],
    publicKey,
    fee: 300,
    nonce: 0,
    network: 'testnet',
    postConditionMode: PostConditionMode.Deny,
    postConditions: [Pc.principal(sender).willSendEq(amount).ft(contractId, assetName)],
    ...overrides,
  });
}

describe(getVerifiedSip10TransferDetails.name, () => {
  test('extracts details from a compliant transfer', async () => {
    const tx = await makeTransferTx();

    expect(getVerifiedSip10TransferDetails(tx)).toEqual({
      contractId,
      assetName,
      amount: 2_500_000n,
      sender,
      recipient,
      memo: undefined,
    });
  });

  test('decodes an attached utf8 memo', async () => {
    const tx = await makeTransferTx({
      functionArgs: [
        uintCV(amount),
        principalCV(sender),
        principalCV(recipient),
        someCV(bufferCVFromString('invoice 42')),
      ],
    });

    expect(getVerifiedSip10TransferDetails(tx)?.memo).toEqual('invoice 42');
  });

  test('rejects a transfer without post conditions', async () => {
    const tx = await makeTransferTx({ postConditions: [] });

    expect(getVerifiedSip10TransferDetails(tx)).toBeNull();
  });

  test('rejects a transfer in allow mode', async () => {
    const tx = await makeTransferTx({ postConditionMode: PostConditionMode.Allow });

    expect(getVerifiedSip10TransferDetails(tx)).toBeNull();
  });

  test('rejects a post condition that is not an exact-amount condition', async () => {
    const tx = await makeTransferTx({
      postConditions: [Pc.principal(sender).willSendGte(amount).ft(contractId, assetName)],
    });

    expect(getVerifiedSip10TransferDetails(tx)).toBeNull();
  });

  test('rejects a single post condition that does not guard a fungible token', async () => {
    const tx = await makeTransferTx({
      postConditions: [Pc.principal(sender).willSendEq(amount).ustx()],
    });

    expect(getVerifiedSip10TransferDetails(tx)).toBeNull();
  });

  test('rejects a post condition amount that differs from the transfer amount', async () => {
    const tx = await makeTransferTx({
      postConditions: [Pc.principal(sender).willSendEq(999).ft(contractId, assetName)],
    });

    expect(getVerifiedSip10TransferDetails(tx)).toBeNull();
  });

  test('rejects a post condition guarding a different contract', async () => {
    const tx = await makeTransferTx({
      postConditions: [
        Pc.principal(sender).willSendEq(amount).ft(`${contractAddress}.other-token`, assetName),
      ],
    });

    expect(getVerifiedSip10TransferDetails(tx)).toBeNull();
  });

  test('rejects a post condition guarding a principal other than the sender', async () => {
    const tx = await makeTransferTx({
      postConditions: [Pc.principal(recipient).willSendEq(amount).ft(contractId, assetName)],
    });

    expect(getVerifiedSip10TransferDetails(tx)).toBeNull();
  });

  test('rejects a transfer carrying more than one post condition', async () => {
    const tx = await makeTransferTx({
      postConditions: [
        Pc.principal(sender).willSendEq(amount).ft(contractId, assetName),
        Pc.principal(sender).willSendEq(1).ustx(),
      ],
    });

    expect(getVerifiedSip10TransferDetails(tx)).toBeNull();
  });

  test('rejects a call that does not match the sip10 transfer shape', async () => {
    const tx = await makeTransferTx({
      functionArgs: [boolCV(true), principalCV(sender), principalCV(recipient)],
    });

    expect(getVerifiedSip10TransferDetails(tx)).toBeNull();
  });
});
