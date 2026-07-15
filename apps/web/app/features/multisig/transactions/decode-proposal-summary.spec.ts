import {
  AddressHashMode,
  AddressVersion,
  Pc,
  PostConditionMode,
  addressFromPublicKeys,
  addressToString,
  createStacksPublicKey,
  makeUnsignedContractCall,
  noneCV,
  principalCV,
  uintCV,
} from '@stacks/transactions';

import type { MultisigTransaction, VaultAccount, VaultAccountSigner } from '@leather.io/models';
import { createMoney } from '@leather.io/utils';

import { buildUnsignedMultisigSip10Transfer } from './build-sip10-transfer';
import { decodeProposalPayload, decodeProposalSummary } from './decode-proposal-summary';

const publicKeys = [
  '0250863ad64a87ae8a2fe83c1af1a8403cb53f53e486d8511dad8a04887e5b2352',
  '03774ae7f858a9411e5ef4246b70c65aac5649980be5c17891bbec17895da008cb',
  '02f9308a019258c31049344f85f89d5229b531c845836f99b08601f113bce036f9',
];

const recipient = 'ST2CY5V39NHDPWSXMW9QDT3HC3GD6Q6XX4CFRK9AG';
const assetId = 'ST1F7QA2MDF17S807EPA36TSS8AMEFY4KA9TVGWXT.sbtc-token::sbtc-token';
const contractId = 'ST1F7QA2MDF17S807EPA36TSS8AMEFY4KA9TVGWXT.sbtc-token';

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

function makeSigner(signerIndex: number, signingPubkey: string): VaultAccountSigner {
  return {
    network: 'stx:testnet',
    publicKey: signingPubkey,
    address: 'ST000000000000000000002AMW42H',
    id: `signer-${signerIndex}`,
    userId: `user-${signerIndex}`,
    xpub: null,
    xpubOriginFingerprint: null,
    xpubOriginPath: null,
    signerIndex,
    signingPubkey,
  };
}

function makeAccount(): VaultAccount {
  return {
    id: 'va-1',
    vaultId: 'v-1',
    name: 'Test vault account',
    icon: null,
    network: 'stx:testnet',
    threshold: 2,
    multisigAddress: deriveTestnetAddress(2, publicKeys),
    accountIndex: 0,
    createdAt: '2026-01-01T00:00:00.000Z',
    signers: publicKeys.map((key, index) => makeSigner(index, key)),
    pendingTransactionCount: 0,
    queuedTransactionCount: 0,
  };
}

function makeTransaction(proposalRawPayload: string): MultisigTransaction {
  return {
    id: 'mtx-1',
    vaultAccountId: 'va-1',
    network: 'stx:testnet',
    proposerUserId: 'user-0',
    proposalRawPayload,
    proposalSignature: '00'.repeat(65),
    proposalTimestamp: 1_750_000_000,
    proposalHash: '11'.repeat(32),
    nonce: null,
    txId: null,
    status: 'pending',
    signatures: [],
    broadcastAt: null,
    createdAt: '2026-01-02T00:00:00.000Z',
    updatedAt: '2026-01-02T00:00:00.000Z',
  };
}

async function buildProposalPayload() {
  const account = makeAccount();
  const tx = await buildUnsignedMultisigSip10Transfer({
    account,
    assetId,
    recipient,
    amount: createMoney(2_500_000, 'sBTC', 8),
    fee: createMoney(3000, 'STX'),
  });
  return { account, rawPayload: tx.serialize() };
}

describe(decodeProposalPayload.name, () => {
  test('degrades to a contract call when the sender is not the vault', async () => {
    const account = makeAccount();
    const otherSender = 'ST1EXHZSN8MJSJ9DSG994G1V8CNKYXGMK7Z4SA6DH';
    const tx = await makeUnsignedContractCall({
      contractAddress: 'ST1F7QA2MDF17S807EPA36TSS8AMEFY4KA9TVGWXT',
      contractName: 'sbtc-token',
      functionName: 'transfer',
      functionArgs: [uintCV(2_500_000), principalCV(otherSender), principalCV(recipient), noneCV()],
      publicKey: publicKeys[0],
      fee: 3000,
      nonce: 0,
      network: 'testnet',
      postConditionMode: PostConditionMode.Deny,
      postConditions: [
        Pc.principal(otherSender).willSendEq(2_500_000).ft(contractId, 'sbtc-token'),
      ],
    });

    expect(
      decodeProposalPayload(
        { network: account.network, multisigAddress: account.multisigAddress },
        tx.serialize()
      )
    ).toEqual({
      type: 'contractCall',
      contractId,
      functionName: 'transfer',
      fee: createMoney(3000, 'STX'),
    });
  });

  test('round-trips a proposal built by the sip10 transfer builder', async () => {
    const { account, rawPayload } = await buildProposalPayload();

    expect(
      decodeProposalPayload(
        { network: account.network, multisigAddress: account.multisigAddress },
        rawPayload
      )
    ).toEqual({
      type: 'sip10Transfer',
      token: { contractId, assetName: 'sbtc-token', baseUnitAmount: 2_500_000n },
      sender: account.multisigAddress,
      recipient,
      memo: undefined,
      fee: createMoney(3000, 'STX'),
    });
  });
});

describe(decodeProposalSummary.name, () => {
  test('summarizes a sip10 transfer proposal as a token transfer', async () => {
    const { account, rawPayload } = await buildProposalPayload();

    const summary = decodeProposalSummary(account, makeTransaction(rawPayload));

    expect(summary.kind).toEqual('transfer');
    expect(summary.recipient).toEqual(recipient);
    expect(summary.amount).toBeUndefined();
    expect(summary.fee).toEqual(createMoney(3000, 'STX'));
    expect(summary.token).toEqual({
      contractId,
      assetName: 'sbtc-token',
      baseUnitAmount: 2_500_000n,
    });
  });
});
