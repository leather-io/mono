import { privateKeyToPublic, publicKeyToHex } from '@stacks/transactions';

import type { BlockchainActivityView } from '@leather.io/features';
import type { MultisigTransactionSummary } from '@leather.io/models';
import { TransactionTypes, generateStacksUnsignedTransaction } from '@leather.io/stacks';
import { createMoney } from '@leather.io/utils';

import {
  type VaultMultisigTransaction,
  harmonizeVaultActivity,
  selectTransactionIdsNeedingPayload,
} from './harmonize-vault-activity';

const privateKeys = ['11'.repeat(32) + '01', '22'.repeat(32) + '01'];
const publicKeys = privateKeys.map(key => publicKeyToHex(privateKeyToPublic(key)));
const recipient = 'ST1EXHZSN8MJSJ9DSG994G1V8CNKYXGMK7Z4SA6DH';

const stxContext = {
  network: 'stx:testnet',
  multisigAddress: 'ST2CY5V39NHDPWSXMW9QDT3HC3GD6Q6XX4CFRK9AG',
} as const;

async function generateStxTransferPayload() {
  const tx = await generateStacksUnsignedTransaction({
    txType: TransactionTypes.StxTokenTransfer,
    recipient,
    amount: createMoney(1000, 'STX'),
    fee: createMoney(250, 'STX'),
    nonce: 0,
    publicKeys,
    numSignatures: 2,
    useNonSequentialMultiSig: true,
  });
  return tx.serialize();
}

function makeView(
  overrides: Partial<BlockchainActivityView> & { txid: string }
): BlockchainActivityView {
  return {
    key: overrides.txid,
    chain: 'stacks',
    timestamp: 1751000000,
    action: 'receive',
    status: 'success',
    avatar: { kind: 'icon', icon: 'contract-call' },
    indicator: 'received',
    title: 'STX',
    subtitle: `Received from ${recipient}`,
    ...overrides,
  };
}

function makeTransaction(
  overrides: Partial<MultisigTransactionSummary> = {}
): MultisigTransactionSummary {
  return {
    id: 'multisig-tx-1',
    vaultAccountId: 'vault-account-1',
    network: 'stx:testnet',
    proposerUserId: 'user-1',
    proposalTimestamp: 1751000000,
    nonce: 0,
    txId: null,
    status: 'pending',
    broadcastAt: null,
    createdAt: '2026-06-27T00:00:00Z',
    updatedAt: '2026-06-27T00:00:00Z',
    approvalCount: 1,
    ...overrides,
  };
}

function makeVaultTransaction(
  overrides: Partial<MultisigTransactionSummary> = {}
): VaultMultisigTransaction {
  return {
    transaction: makeTransaction(overrides),
    payloadContext: stxContext,
    vaultId: 'vault-1',
    vaultName: 'Treasury',
    threshold: 2,
  };
}

describe(harmonizeVaultActivity.name, () => {
  test('the on-chain view wins for a broadcast transaction and is not duplicated', () => {
    const twin = makeView({ txid: 'abc123', status: 'pending', title: 'STX from chain' });
    const item = makeVaultTransaction({ txId: '0xabc123', status: 'broadcast' });

    const result = harmonizeVaultActivity({
      onchain: [twin],
      multisigTransactions: [item],
    });

    expect(result.active).toHaveLength(1);
    expect(result.active[0].view).toBe(twin);
    expect(result.active[0].multisig).toBe(item);
    expect(result.history).toHaveLength(0);
  });

  test('a confirmed transaction with a twin lands in history with multisig context', () => {
    const twin = makeView({ txid: 'abc123', status: 'success' });
    const item = makeVaultTransaction({ txId: '0xABC123', status: 'confirmed' });

    const result = harmonizeVaultActivity({
      onchain: [twin],
      multisigTransactions: [item],
    });

    expect(result.active).toHaveLength(0);
    expect(result.history).toHaveLength(1);
    expect(result.history[0].view).toBe(twin);
    expect(result.history[0].multisig).toBe(item);
  });

  test('an unmatched pending transaction without a payload synthesizes a placeholder view', () => {
    const result = harmonizeVaultActivity({
      onchain: [],
      multisigTransactions: [makeVaultTransaction()],
    });

    expect(result.active).toHaveLength(1);
    expect(result.active[0].view.action).toBe('contract-execution');
    expect(result.active[0].view.title).toBe('');
    expect(result.active[0].view.status).toBe('pending');
  });

  test('an unmatched pending transaction with a payload synthesizes the full send view', async () => {
    const rawPayload = await generateStxTransferPayload();

    const result = harmonizeVaultActivity({
      onchain: [],
      multisigTransactions: [makeVaultTransaction()],
      payloadsById: new Map([['multisig-tx-1', rawPayload]]),
    });

    expect(result.active[0].view.action).toBe('send');
    expect(result.active[0].view.subtitle).toBe(`Sending to ${recipient}`);
  });

  test('on-chain rows without a multisig transaction pass through to history', () => {
    const external = makeView({ txid: 'external1' });

    const result = harmonizeVaultActivity({
      onchain: [external],
      multisigTransactions: [],
    });

    expect(result.history).toHaveLength(1);
    expect(result.history[0].view).toBe(external);
    expect(result.history[0].multisig).toBeUndefined();
  });

  test('holds back terminal synthesized rows older than the frontier', () => {
    const older = makeVaultTransaction({
      id: 'older',
      status: 'cancelled',
      proposalTimestamp: 1750000000,
    });
    const newer = makeVaultTransaction({
      id: 'newer',
      status: 'cancelled',
      proposalTimestamp: 1752000000,
    });

    const result = harmonizeVaultActivity({
      onchain: [],
      multisigTransactions: [older, newer],
      frontier: 1751000000,
    });

    expect(result.history).toHaveLength(1);
    expect(result.history[0].multisig?.transaction.id).toBe('newer');
  });

  test('never holds back active rows regardless of the frontier', () => {
    const item = makeVaultTransaction({ proposalTimestamp: 1700000000 });

    const result = harmonizeVaultActivity({
      onchain: [],
      multisigTransactions: [item],
      frontier: 1751000000,
    });

    expect(result.active).toHaveLength(1);
  });

  test('emits terminal synthesized rows freely when no frontier is set', () => {
    const item = makeVaultTransaction({ status: 'cancelled', proposalTimestamp: 1700000000 });

    const result = harmonizeVaultActivity({
      onchain: [],
      multisigTransactions: [item],
    });

    expect(result.history).toHaveLength(1);
  });

  test('sorts both tiers newest first', () => {
    const olderView = makeView({ txid: 'older-view', timestamp: 1750000000 });
    const newerView = makeView({ txid: 'newer-view', timestamp: 1752000000 });
    const olderActive = makeVaultTransaction({ id: 'older-active', proposalTimestamp: 1750000000 });
    const newerActive = makeVaultTransaction({ id: 'newer-active', proposalTimestamp: 1752000000 });

    const result = harmonizeVaultActivity({
      onchain: [olderView, newerView],
      multisigTransactions: [olderActive, newerActive],
    });

    expect(result.active.map(row => row.multisig?.transaction.id)).toEqual([
      'newer-active',
      'older-active',
    ]);
    expect(result.history.map(row => row.view.txid)).toEqual(['newer-view', 'older-view']);
  });
});

describe(selectTransactionIdsNeedingPayload.name, () => {
  test('selects transactions without a txid or without an on-chain twin', () => {
    const matched = makeVaultTransaction({ id: 'matched', txId: '0xabc123' });
    const unbroadcast = makeVaultTransaction({ id: 'unbroadcast', txId: null });
    const orphaned = makeVaultTransaction({ id: 'orphaned', txId: '0xdef456' });

    const ids = selectTransactionIdsNeedingPayload(
      [makeView({ txid: 'abc123' })],
      [matched, unbroadcast, orphaned]
    );

    expect(ids).toEqual(['unbroadcast', 'orphaned']);
  });
});
