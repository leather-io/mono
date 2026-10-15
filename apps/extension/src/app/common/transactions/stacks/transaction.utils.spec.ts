import { STACKS_MAINNET, STACKS_TESTNET } from '@stacks/network';
import { makeUnsignedSTXTokenTransfer } from '@stacks/transactions';

import type {
  StacksConfirmedTransaction,
  StacksConfirmedTransactionStatus,
  StacksMempoolTransaction,
  StacksMempoolTransactionStatus,
} from '@leather.io/models';
import { deriveStxMultisigAddress } from '@leather.io/stacks';

import {
  getTxSenderAddress,
  getTxTitle,
  getTxValue,
  isNonSequentialMultisigTransaction,
  isPendingTx,
  statusFromTx,
} from './transaction.utils';

const publicKeys = [
  '0250863ad64a87ae8a2fe83c1af1a8403cb53f53e486d8511dad8a04887e5b2352',
  '03774ae7f858a9411e5ef4246b70c65aac5649980be5c17891bbec17895da008cb',
  '02f9308a019258c31049344f85f89d5229b531c845836f99b08601f113bce036f9',
];

const recipient = 'ST2CY5V39NHDPWSXMW9QDT3HC3GD6Q6XX4CFRK9AG';

describe(isNonSequentialMultisigTransaction.name, () => {
  test('is true for a non-sequential multisig transaction', async () => {
    const tx = await makeUnsignedSTXTokenTransfer({
      recipient,
      amount: 1_000_000,
      fee: 3000,
      nonce: 0,
      network: STACKS_TESTNET,
      publicKeys,
      numSignatures: 2,
      useNonSequentialMultiSig: true,
    });
    expect(isNonSequentialMultisigTransaction(tx)).toEqual(true);
  });

  test('is false for a sequential multisig transaction', async () => {
    const tx = await makeUnsignedSTXTokenTransfer({
      recipient,
      amount: 1_000_000,
      fee: 3000,
      nonce: 0,
      network: STACKS_TESTNET,
      publicKeys,
      numSignatures: 2,
    });
    expect(isNonSequentialMultisigTransaction(tx)).toEqual(false);
  });

  test('is false for a singlesig transaction', async () => {
    const tx = await makeUnsignedSTXTokenTransfer({
      recipient,
      amount: 1_000_000,
      fee: 3000,
      nonce: 0,
      network: STACKS_TESTNET,
      publicKey: publicKeys[0],
    });
    expect(isNonSequentialMultisigTransaction(tx)).toEqual(false);
  });
});

describe(getTxSenderAddress.name, () => {
  test.each([STACKS_TESTNET, STACKS_MAINNET])(
    'matches the derived multisig policy address on chainId $chainId',
    async network => {
      const threshold = 2;
      const tx = await makeUnsignedSTXTokenTransfer({
        recipient,
        amount: 1_000_000,
        fee: 3000,
        nonce: 0,
        network,
        publicKeys,
        numSignatures: threshold,
        useNonSequentialMultiSig: true,
      });
      expect(getTxSenderAddress(tx)).toEqual(
        deriveStxMultisigAddress({ publicKeys, threshold, chainId: network.chainId })
      );
    }
  );
});

function createConfirmedTransaction(
  status: StacksConfirmedTransactionStatus = 'success'
): StacksConfirmedTransaction {
  return {
    tx_id: '0x1',
    sender: { address: recipient, nonce: 2 },
    sponsor: null,
    fee_rate: '180',
    block: { height: 120, hash: '0x', index_hash: '0x', time: 1_700_000_000, tx_index: 0 },
    bitcoin_block: { height: 800_000, time: 1_700_000_000 },
    status,
    parent_block: { hash: '0x', index_hash: '0x' },
    event_count: 0,
    execution_cost: { read_count: 0, read_length: 0, runtime: 0, write_count: 0, write_length: 0 },
    vm_error: null,
    type: 'contract_call',
    contract_call: {
      contract_id: 'SP000000000000000000002Q6VF78.pox-4',
      function_name: 'stack-stx',
    },
  };
}

function createMempoolTransaction(
  status: StacksMempoolTransactionStatus = 'pending'
): StacksMempoolTransaction {
  return {
    tx_id: '0x2',
    sender: { address: recipient, nonce: 3 },
    sponsor: null,
    fee_rate: '180',
    receipt_time: 1_700_000_000,
    receipt_block_height: 120,
    status,
    replaced_by_tx_id: null,
    type: 'token_transfer',
    token_transfer: { recipient, amount: '1000000', memo: null },
  };
}

describe(statusFromTx.name, () => {
  it('maps a pending mempool transaction to pending', () => {
    expect(statusFromTx(createMempoolTransaction())).toBe('pending');
  });

  it('maps a dropped mempool transaction to failed', () => {
    expect(statusFromTx(createMempoolTransaction('dropped_replace_by_fee'))).toBe('failed');
  });

  it('maps a successful transaction to success', () => {
    expect(statusFromTx(createConfirmedTransaction())).toBe('success');
  });

  it.each<StacksConfirmedTransactionStatus>([
    'abort_by_response',
    'abort_by_post_condition',
    'problematic_skipped',
  ])('maps %s to failed', status => {
    expect(statusFromTx(createConfirmedTransaction(status))).toBe('failed');
  });
});

describe(isPendingTx.name, () => {
  it('is true only for pending transactions', () => {
    expect(isPendingTx(createMempoolTransaction())).toBe(true);
    expect(isPendingTx(createMempoolTransaction('dropped_too_expensive'))).toBe(false);
    expect(isPendingTx(createConfirmedTransaction())).toBe(false);
  });
});

describe(getTxTitle.name, () => {
  it('uses the function name for contract calls', () => {
    expect(getTxTitle(createConfirmedTransaction())).toBe('stack-stx');
  });

  it('includes the block height for a confirmed coinbase', () => {
    const tx: StacksConfirmedTransaction = {
      ...createConfirmedTransaction(),
      type: 'coinbase',
      coinbase: { payload: '0x', alt_recipient: null, vrf_proof: null },
    };
    expect(getTxTitle(tx)).toBe('Coinbase 120');
  });

  it('omits the block height for a mempool coinbase', () => {
    const tx: StacksMempoolTransaction = { ...createMempoolTransaction(), type: 'coinbase' };
    expect(getTxTitle(tx)).toBe('Coinbase');
  });
});

describe(getTxValue.name, () => {
  it('formats a token transfer amount as negative for the originator', () => {
    expect(getTxValue(createMempoolTransaction(), true)).toBe('-1');
  });

  it('formats a token transfer amount as positive for the recipient', () => {
    expect(getTxValue(createMempoolTransaction(), false)).toBe('1');
  });

  it('returns null for contract calls', () => {
    expect(getTxValue(createConfirmedTransaction(), true)).toBeNull();
  });
});
