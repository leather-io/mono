import { privateKeyToPublic, publicKeyToHex } from '@stacks/transactions';

import {
  type MultisigTransactionStatus,
  type MultisigTransactionSummary,
  type OnChainActivityStatus,
  createMarketData,
  createMarketPair,
} from '@leather.io/models';
import { TransactionTypes, generateStacksUnsignedTransaction } from '@leather.io/stacks';
import { createMoney } from '@leather.io/utils';

import { createMultisigTransactionActivityView } from './multisig-transaction-activity-view';

const privateKeys = ['11'.repeat(32) + '01', '22'.repeat(32) + '01'];
const publicKeys = privateKeys.map(key => publicKeyToHex(privateKeyToPublic(key)));
const recipient = 'ST1EXHZSN8MJSJ9DSG994G1V8CNKYXGMK7Z4SA6DH';

const stxContext = {
  network: 'stx:testnet',
  multisigAddress: 'ST2CY5V39NHDPWSXMW9QDT3HC3GD6Q6XX4CFRK9AG',
} as const;

const stxMarketData = createMarketData(
  createMarketPair('STX', 'USD'),
  createMoney(2_500_000, 'USD')
);

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

async function generateContractCallPayload() {
  const tx = await generateStacksUnsignedTransaction({
    txType: TransactionTypes.ContractCall,
    contractAddress: 'ST000000000000000000002AMW42H',
    contractName: 'pox-4',
    functionName: 'delegate-stx',
    functionArgs: [],
    fee: createMoney(250, 'STX'),
    nonce: 0,
    publicKey: publicKeys[0],
  });
  return tx.serialize();
}

async function generateContractDeployPayload() {
  const tx = await generateStacksUnsignedTransaction({
    txType: TransactionTypes.ContractDeploy,
    contractName: 'my-contract',
    codeBody: '(define-read-only (noop) true)',
    fee: createMoney(250, 'STX'),
    nonce: 0,
    publicKey: publicKeys[0],
  });
  return tx.serialize();
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

describe(createMultisigTransactionActivityView.name, () => {
  test('builds the full send view from a decoded payload and market data', async () => {
    const rawPayload = await generateStxTransferPayload();
    const view = createMultisigTransactionActivityView(stxContext, makeTransaction(), {
      rawPayload,
      marketData: stxMarketData,
    });

    expect(view.action).toBe('send');
    expect(view.status).toBe('pending');
    expect(view.chain).toBe('stacks');
    expect(view.timestamp).toBe(1751000000);
    expect(view.title).toBe('STX');
    expect(view.subtitle).toBe(`Sending to ${recipient}`);
    expect(view.avatar).toEqual({
      kind: 'single',
      asset: expect.objectContaining({ symbol: 'STX' }),
    });
    expect(view.indicator).toBe('pending');
    expect(view.amount?.direction).toBe('sent');
    expect(view.amount?.crypto?.amount.toNumber()).toBe(1000);
    expect(view.amount?.quote.symbol).toBe('USD');
  });

  test('renders a blank placeholder view without a payload', () => {
    const view = createMultisigTransactionActivityView(stxContext, makeTransaction());

    expect(view.action).toBe('contract-execution');
    expect(view.title).toBe('');
    expect(view.subtitle).toBe('');
    expect(view.amount).toBeUndefined();
    expect(view.avatar).toEqual({ kind: 'icon', icon: 'contract-call' });
  });

  test('renders an unclassified contract call from its payload', async () => {
    const rawPayload = await generateContractCallPayload();
    const view = createMultisigTransactionActivityView(stxContext, makeTransaction(), {
      rawPayload,
    });

    expect(view.action).toBe('contract-execution');
    expect(view.title).toBe('delegate-stx');
    expect(view.subtitle).toBe('pox-4');
    expect(view.amount).toBeUndefined();
  });

  test('renders a classified contract call with its protocol action', async () => {
    const rawPayload = await generateContractCallPayload();
    const view = createMultisigTransactionActivityView(stxContext, makeTransaction(), {
      rawPayload,
      classification: { action: 'stack', protocolName: 'Fast Pool' },
    });

    expect(view.action).toBe('stack');
    expect(view.title).toBe('STX');
    expect(view.subtitle).toBe('Stacking via Fast Pool');
  });

  test('renders a contract deploy from its payload', async () => {
    const rawPayload = await generateContractDeployPayload();
    const view = createMultisigTransactionActivityView(stxContext, makeTransaction(), {
      rawPayload,
    });

    expect(view.action).toBe('contract-deploy');
    expect(view.title).toBe('Deploying');
    expect(view.subtitle).toBe('my-contract');
  });

  test('keeps the decoded counterparty without market data', async () => {
    const rawPayload = await generateStxTransferPayload();
    const view = createMultisigTransactionActivityView(stxContext, makeTransaction(), {
      rawPayload,
    });

    expect(view.subtitle).toBe(`Sending to ${recipient}`);
    expect(view.amount).toBeUndefined();
  });

  test.each<[MultisigTransactionStatus, OnChainActivityStatus]>([
    ['queued', 'pending'],
    ['pending', 'pending'],
    ['signed', 'pending'],
    ['broadcast', 'pending'],
    ['confirmed', 'success'],
    ['failed', 'failed'],
    ['dropped', 'failed'],
    ['cancelled', 'failed'],
  ])('maps multisig status %s to on-chain status %s', (status, expected) => {
    const view = createMultisigTransactionActivityView(stxContext, makeTransaction({ status }));
    expect(view.status).toBe(expected);
  });

  test('uses the broadcast txid when present and falls back to the multisig id', () => {
    const withTxId = createMultisigTransactionActivityView(
      stxContext,
      makeTransaction({ txId: '0xabc123' })
    );
    const withoutTxId = createMultisigTransactionActivityView(stxContext, makeTransaction());

    expect(withTxId.txid).toBe('0xabc123');
    expect(withoutTxId.txid).toBe('multisig-tx-1');
  });

  test('maps bitcoin accounts to the bitcoin chain', () => {
    const view = createMultisigTransactionActivityView(
      { network: 'btc:mainnet', multisigAddress: 'bc1qexample' },
      makeTransaction({ network: 'btc:mainnet' })
    );

    expect(view.chain).toBe('bitcoin');
    expect(view.subtitle).toBe('');
  });
});
