import { privateKeyToPublic, publicKeyToHex } from '@stacks/transactions';
import { activityCounterpartyOffset } from '~/queries/activity/blockchain-activity.query';

import type { BlockchainActivityView } from '@leather.io/features';
import type { MultisigTransactionSummary } from '@leather.io/models';
import { TransactionTypes, generateStacksUnsignedTransaction } from '@leather.io/stacks';
import { createMoney, truncateMiddle } from '@leather.io/utils';

import {
  type OnchainActivityItem,
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

function onchainItem(
  view: BlockchainActivityView,
  vaultAccountId = 'vault-account-1',
  vaultId = 'vault-1'
): OnchainActivityItem {
  return { view, vaultId, vaultAccountId };
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
    const twin = makeView({ txid: 'abc123', status: 'pending' });
    const item = makeVaultTransaction({ txId: '0xabc123', status: 'broadcast' });

    const items = harmonizeVaultActivity({
      onchain: [onchainItem(twin)],
      multisigTransactions: [item],
    });

    expect(items).toHaveLength(1);
    expect(items[0].view).toBe(twin);
    expect(items[0].multisig).toBe(item);
  });

  test('a confirmed transaction with a twin keeps its multisig context', () => {
    const twin = makeView({ txid: 'abc123', status: 'success' });
    const item = makeVaultTransaction({ txId: '0xABC123', status: 'confirmed' });

    const items = harmonizeVaultActivity({
      onchain: [onchainItem(twin)],
      multisigTransactions: [item],
    });

    expect(items).toHaveLength(1);
    expect(items[0].view).toBe(twin);
    expect(items[0].multisig).toBe(item);
  });

  test('an unmatched pending transaction without a payload synthesizes a placeholder view', () => {
    const items = harmonizeVaultActivity({
      onchain: [],
      multisigTransactions: [makeVaultTransaction()],
    });

    expect(items).toHaveLength(1);
    expect(items[0].view.action).toBe('contract-execution');
    expect(items[0].view.title).toBe('');
    expect(items[0].view.status).toBe('pending');
  });

  test('an unmatched pending transaction with a payload synthesizes the full send view', async () => {
    const rawPayload = await generateStxTransferPayload();

    const items = harmonizeVaultActivity({
      onchain: [],
      multisigTransactions: [makeVaultTransaction()],
      payloadsById: new Map([['multisig-tx-1', rawPayload]]),
    });

    expect(items[0].view.action).toBe('send');
    expect(items[0].view.subtitle).toBe(
      `Sending to ${truncateMiddle(recipient, activityCounterpartyOffset)}`
    );
  });

  test('on-chain rows without a multisig transaction pass through', () => {
    const external = makeView({ txid: 'external1' });

    const items = harmonizeVaultActivity({
      onchain: [onchainItem(external)],
      multisigTransactions: [],
    });

    expect(items).toHaveLength(1);
    expect(items[0].view).toBe(external);
    expect(items[0].multisig).toBeUndefined();
  });

  test('keeps a proposal and a same-txid on-chain view on different accounts separate', () => {
    const receiveView = makeView({ txid: 'shared-tx', action: 'receive' });
    const sendProposal = makeVaultTransaction({ txId: '0xshared-tx', status: 'confirmed' });

    const items = harmonizeVaultActivity({
      onchain: [onchainItem(receiveView, 'receiving-account')],
      multisigTransactions: [sendProposal],
    });

    expect(items).toHaveLength(2);
    const receiveRow = items.find(item => item.multisig === undefined);
    const proposalRow = items.find(item => item.multisig !== undefined);
    expect(receiveRow?.view).toBe(receiveView);
    expect(receiveRow?.vaultAccountId).toBe('receiving-account');
    expect(proposalRow?.vaultAccountId).toBe('vault-account-1');
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

    const items = harmonizeVaultActivity({
      onchain: [],
      multisigTransactions: [older, newer],
      frontier: 1751000000,
    });

    expect(items).toHaveLength(1);
    expect(items[0].multisig?.transaction.id).toBe('newer');
  });

  test('a confirmed twin supersedes a stale broadcasting status and ranks as settled', () => {
    const confirmedTwin = makeView({
      txid: 'settled-tx',
      timestamp: 1750000000,
      status: 'success',
    });
    const staleBroadcast = makeVaultTransaction({
      id: 'stale-broadcast',
      txId: '0xsettled-tx',
      status: 'broadcast',
      proposalTimestamp: 1749000000,
    });
    const newerExternal = makeView({ txid: 'newer-external', timestamp: 1752000000 });

    const items = harmonizeVaultActivity({
      onchain: [onchainItem(confirmedTwin), onchainItem(newerExternal)],
      multisigTransactions: [staleBroadcast],
    });

    expect(items.map(item => item.view.txid)).toEqual(['newer-external', 'settled-tx']);
    expect(items[1].view).toBe(confirmedTwin);
    expect(items[1].multisig?.transaction.id).toBe('stale-broadcast');
  });

  test('never holds back in-flight rows regardless of the frontier', () => {
    const item = makeVaultTransaction({ proposalTimestamp: 1700000000 });

    const items = harmonizeVaultActivity({
      onchain: [],
      multisigTransactions: [item],
      frontier: 1751000000,
    });

    expect(items).toHaveLength(1);
  });

  test('emits terminal synthesized rows freely when no frontier is set', () => {
    const item = makeVaultTransaction({ status: 'cancelled', proposalTimestamp: 1700000000 });

    const items = harmonizeVaultActivity({
      onchain: [],
      multisigTransactions: [item],
    });

    expect(items).toHaveLength(1);
  });

  test('sorts in-flight rows above settled ones, newest first within each group', () => {
    const olderView = makeView({ txid: 'older-view', timestamp: 1750000000 });
    const newerView = makeView({ txid: 'newer-view', timestamp: 1752000000 });
    const olderBroadcast = makeVaultTransaction({
      id: 'older-broadcast',
      status: 'broadcast',
      proposalTimestamp: 1749000000,
    });
    const newerCancelled = makeVaultTransaction({
      id: 'newer-cancelled',
      status: 'cancelled',
      proposalTimestamp: 1753000000,
    });

    const items = harmonizeVaultActivity({
      onchain: [onchainItem(olderView), onchainItem(newerView)],
      multisigTransactions: [olderBroadcast, newerCancelled],
    });

    expect(items.map(item => item.multisig?.transaction.id ?? item.view.txid)).toEqual([
      'older-broadcast',
      'newer-cancelled',
      'newer-view',
      'older-view',
    ]);
  });

  test('sorts an in-flight row by proposal time even when its twin carries no timestamp', () => {
    const pendingTwin = makeView({
      txid: 'btc-pending',
      chain: 'bitcoin',
      timestamp: 0,
      status: 'pending',
    });
    const broadcast = makeVaultTransaction({
      id: 'broadcast',
      txId: 'btc-pending',
      status: 'broadcast',
      proposalTimestamp: 1752000000,
    });
    const confirmedView = makeView({ txid: 'settled', timestamp: 1751000000 });

    const items = harmonizeVaultActivity({
      onchain: [onchainItem(pendingTwin), onchainItem(confirmedView)],
      multisigTransactions: [broadcast],
    });

    expect(items.map(item => item.view.txid)).toEqual(['btc-pending', 'settled']);
  });
});

describe(selectTransactionIdsNeedingPayload.name, () => {
  test('selects transactions without a txid or without an on-chain twin', () => {
    const matched = makeVaultTransaction({ id: 'matched', txId: '0xabc123' });
    const unbroadcast = makeVaultTransaction({ id: 'unbroadcast', txId: null });
    const orphaned = makeVaultTransaction({ id: 'orphaned', txId: '0xdef456' });

    const ids = selectTransactionIdsNeedingPayload(
      [onchainItem(makeView({ txid: 'abc123' }))],
      [matched, unbroadcast, orphaned]
    );

    expect(ids).toEqual(['unbroadcast', 'orphaned']);
  });
});
