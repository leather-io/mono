import {
  AuthType,
  ClarityType,
  Pc,
  PostConditionMode,
  makeUnsignedContractCall,
  noneCV,
  principalCV,
  privateKeyToPublic,
  publicKeyToHex,
  uintCV,
} from '@stacks/transactions';

import {
  type SbtcSponsoredTransferParams,
  buildSbtcSponsoredTransferPostCondition,
  buildSbtcTransferManyArgs,
  getSbtcSponsoredTransferDetails,
  getSbtcSponsoredTransferTotal,
  isSbtcTransferManyContractCall,
} from './sbtc-sponsored-transfer';

const publicKey = publicKeyToHex(privateKeyToPublic('11'.repeat(32) + '01'));
const sender = 'ST1EXHZSN8MJSJ9DSG994G1V8CNKYXGMK7Z4SA6DH';
const recipient = 'ST2CY5V39NHDPWSXMW9QDT3HC3GD6Q6XX4CFRK9AG';
const feeRecipient = 'ST3PF13W7Z0RRM42A8VZRVFQ75SV1K26RXEP8YGKJ';
const contractAddress = 'ST1F7QA2MDF17S807EPA36TSS8AMEFY4KA9TVGWXT';
const contractName = 'sbtc-token';
const contractId = `${contractAddress}.${contractName}`;

const params: SbtcSponsoredTransferParams = {
  contractAddress,
  contractName,
  sender,
  recipient,
  feeRecipient,
  amount: 2_500_000n,
  feeAmount: 1_500n,
};

type ContractCallOptions = Parameters<typeof makeUnsignedContractCall>[0];

function makeTransferManyTx(overrides: Partial<ContractCallOptions> = {}) {
  return makeUnsignedContractCall({
    contractAddress,
    contractName,
    functionName: 'transfer-many',
    functionArgs: buildSbtcTransferManyArgs(params),
    publicKey,
    fee: 0,
    nonce: 0,
    network: 'testnet',
    sponsored: true,
    postConditionMode: PostConditionMode.Deny,
    postConditions: [buildSbtcSponsoredTransferPostCondition(params)],
    ...overrides,
  });
}

describe(buildSbtcTransferManyArgs.name, () => {
  test('builds a single list of two entries with the same sender', () => {
    const [entries] = buildSbtcTransferManyArgs(params);
    if (entries.type !== ClarityType.List) throw new Error('Expected a list');
    expect(entries.value).toHaveLength(2);
    const [transfer, fee] = entries.value;
    if (transfer.type !== ClarityType.Tuple || fee.type !== ClarityType.Tuple)
      throw new Error('Expected tuples');
    expect(transfer.value.amount).toEqual(uintCV(2_500_000n));
    expect(transfer.value.sender).toEqual(principalCV(sender));
    expect(transfer.value.to).toEqual(principalCV(recipient));
    expect(transfer.value.memo).toEqual(noneCV());
    expect(fee.value.amount).toEqual(uintCV(1_500n));
    expect(fee.value.sender).toEqual(principalCV(sender));
    expect(fee.value.to).toEqual(principalCV(feeRecipient));
    expect(fee.value.memo).toEqual(noneCV());
  });

  test('attaches the memo to the transfer entry only', () => {
    const [entries] = buildSbtcTransferManyArgs({ ...params, memo: 'invoice 42' });
    if (entries.type !== ClarityType.List) throw new Error('Expected a list');
    const [transfer, fee] = entries.value;
    if (transfer.type !== ClarityType.Tuple || fee.type !== ClarityType.Tuple)
      throw new Error('Expected tuples');
    expect(transfer.value.memo.type).toEqual(ClarityType.OptionalSome);
    expect(fee.value.memo).toEqual(noneCV());
  });
});

describe(buildSbtcSponsoredTransferPostCondition.name, () => {
  test('guards the summed amount for the sender on the sbtc asset', () => {
    expect(buildSbtcSponsoredTransferPostCondition(params)).toEqual(
      Pc.principal(sender).willSendEq(2_501_500n).ft(contractId, 'sbtc-token')
    );
  });
});

describe(getSbtcSponsoredTransferTotal.name, () => {
  test('sums amount and fee', () => {
    expect(getSbtcSponsoredTransferTotal(10n, 5n)).toEqual(15n);
  });
});

describe(getSbtcSponsoredTransferDetails.name, () => {
  test('extracts details from a compliant sponsored transfer-many', async () => {
    const tx = await makeTransferManyTx();
    expect(tx.auth.authType).toEqual(AuthType.Sponsored);
    expect(isSbtcTransferManyContractCall(tx)).toBe(true);
    expect(getSbtcSponsoredTransferDetails(tx)).toEqual({
      contractId,
      amount: 2_500_000n,
      feeAmount: 1_500n,
      sender,
      recipient,
      feeRecipient,
      memo: undefined,
    });
  });

  test('decodes the transfer memo', async () => {
    const tx = await makeTransferManyTx({
      functionArgs: buildSbtcTransferManyArgs({ ...params, memo: 'invoice 42' }),
    });
    expect(getSbtcSponsoredTransferDetails(tx)?.memo).toEqual('invoice 42');
  });

  test('rejects a standard (non-sponsored) auth', async () => {
    const tx = await makeTransferManyTx({ sponsored: false });
    expect(getSbtcSponsoredTransferDetails(tx)).toBeNull();
  });

  test('rejects a plain transfer call', async () => {
    const tx = await makeTransferManyTx({
      functionName: 'transfer',
      functionArgs: [uintCV(1), principalCV(sender), principalCV(recipient), noneCV()],
    });
    expect(isSbtcTransferManyContractCall(tx)).toBe(false);
    expect(getSbtcSponsoredTransferDetails(tx)).toBeNull();
  });

  test('rejects a call on a contract that is not sbtc-token', async () => {
    const tx = await makeTransferManyTx({ contractName: 'other-token' });
    expect(getSbtcSponsoredTransferDetails(tx)).toBeNull();
  });

  test('rejects a post condition amount that differs from the summed transfer', async () => {
    const tx = await makeTransferManyTx({
      postConditions: [Pc.principal(sender).willSendEq(2_500_000n).ft(contractId, 'sbtc-token')],
    });
    expect(getSbtcSponsoredTransferDetails(tx)).toBeNull();
  });

  test('rejects a post condition guarding a principal other than the sender', async () => {
    const tx = await makeTransferManyTx({
      postConditions: [Pc.principal(recipient).willSendEq(2_501_500n).ft(contractId, 'sbtc-token')],
    });
    expect(getSbtcSponsoredTransferDetails(tx)).toBeNull();
  });

  test('rejects allow mode', async () => {
    const tx = await makeTransferManyTx({ postConditionMode: PostConditionMode.Allow });
    expect(getSbtcSponsoredTransferDetails(tx)).toBeNull();
  });

  test('rejects entries with different senders', async () => {
    const [transferEntries] = buildSbtcTransferManyArgs(params);
    const [feeEntries] = buildSbtcTransferManyArgs({ ...params, sender: recipient });
    if (transferEntries.type !== ClarityType.List || feeEntries.type !== ClarityType.List)
      throw new Error('Expected lists');
    const tx = await makeTransferManyTx({
      functionArgs: [
        { type: ClarityType.List, value: [transferEntries.value[0], feeEntries.value[1]] },
      ],
    });
    expect(getSbtcSponsoredTransferDetails(tx)).toBeNull();
  });

  test('rejects lists that do not have exactly two entries', async () => {
    const [entries] = buildSbtcTransferManyArgs(params);
    if (entries.type !== ClarityType.List) throw new Error('Expected a list');
    const single = await makeTransferManyTx({
      functionArgs: [{ type: ClarityType.List, value: [entries.value[0]] }],
    });
    const triple = await makeTransferManyTx({
      functionArgs: [{ type: ClarityType.List, value: [...entries.value, entries.value[1]] }],
    });
    expect(getSbtcSponsoredTransferDetails(single)).toBeNull();
    expect(getSbtcSponsoredTransferDetails(triple)).toBeNull();
  });
});
