import type {
  ContractCallTransaction,
  MempoolTokenTransferTransaction,
  SmartContractTransaction,
  TokenTransferTransaction,
} from '@stacks/stacks-blockchain-api-types';
import { describe, expect, it } from 'vitest';

import type { BlockchainActivityBalanceChange, CryptoAsset, StacksTx } from '@leather.io/models';

import type {
  HiroPrincipalTransaction,
  HiroPrincipalTransactionsResultItem,
} from '../infrastructure/api/hiro/hiro-stacks-api.types';
import {
  buildConfirmedStacksActivity,
  buildOnchainStacksActivity,
  buildStacksActivity,
  buildStxBalanceChange,
  isStacksActivityResultItem,
  mapStacksActivityStatus,
  reclassifySip10Transfer,
} from './stacks-activity.utils';

function baseTx() {
  return {
    tx_id: '0x1',
    sender: { address: 'SP1', nonce: 0 },
    sponsor: null,
    fee_rate: '100',
    block: { height: 1, hash: '0x', index_hash: '0x', time: 1000, tx_index: 0 },
    bitcoin_block: { height: 1, time: 1000 },
    status: 'success' as const,
  };
}

function item(transaction: HiroPrincipalTransaction): HiroPrincipalTransactionsResultItem {
  return {
    transaction,
    involvement: 'sender',
    balance_changes: { stx: { sent: '0', received: '0', net: '0' } },
    affected_balances: { stx: true, ft: false, nft: false },
  };
}

describe('isStacksActivityResultItem', () => {
  it('keeps token_transfer, contract_call and smart_contract', () => {
    expect(
      isStacksActivityResultItem(
        item({
          ...baseTx(),
          type: 'token_transfer',
          token_transfer: { recipient: 'SP2', amount: '1', memo: null },
        })
      )
    ).toBe(true);
    expect(
      isStacksActivityResultItem(
        item({
          ...baseTx(),
          type: 'contract_call',
          contract_call: { contract_id: 'SP.c', function_name: 'f' },
        })
      )
    ).toBe(true);
    expect(
      isStacksActivityResultItem(
        item({
          ...baseTx(),
          type: 'smart_contract',
          smart_contract: { contract_id: 'SP.c', clarity_version: null },
        })
      )
    ).toBe(true);
  });

  it('filters out coinbase, tenure_change and poison_microblock', () => {
    expect(
      isStacksActivityResultItem(
        item({ ...baseTx(), type: 'coinbase', coinbase: { alt_recipient: null } })
      )
    ).toBe(false);
    expect(
      isStacksActivityResultItem(
        item({ ...baseTx(), type: 'tenure_change', tenure_change: { cause: 'block_found' } })
      )
    ).toBe(false);
    expect(isStacksActivityResultItem(item({ ...baseTx(), type: 'poison_microblock' }))).toBe(
      false
    );
  });
});

describe('mapStacksActivityStatus', () => {
  it('maps success to success and aborts to failed', () => {
    expect(mapStacksActivityStatus('success')).toBe('success');
    expect(mapStacksActivityStatus('abort_by_response')).toBe('failed');
    expect(mapStacksActivityStatus('abort_by_post_condition')).toBe('failed');
  });
});

describe('buildStxBalanceChange', () => {
  it('returns a sent change for a negative net', () => {
    const change = buildStxBalanceChange('-100050');
    expect(change?.direction).toBe('sent');
    expect(change?.amount.crypto.amount.toString()).toBe('100050');
    expect(change?.amount.crypto.symbol).toBe('STX');
  });

  it('returns a received change for a positive net', () => {
    expect(buildStxBalanceChange('100')?.direction).toBe('received');
  });

  it('returns null for a zero net', () => {
    expect(buildStxBalanceChange('0')).toBeNull();
  });
});

describe(buildStacksActivity.name, () => {
  const common = {
    txid: '0x1',
    timestamp: 1000,
    status: 'success' as const,
    initiatedByUser: true,
  };

  it('uses the recipient as counterparty for a sent token transfer', () => {
    const result = buildStacksActivity({
      common,
      core: { kind: 'token_transfer', recipient: 'SP_TO', sender: 'SP_FROM' },
      action: 'send',
      balanceChanges: [],
    });
    expect(result.chain).toBe('stacks');
    expect(result.action).toBe('send');
    expect(result.counterparty).toBe('SP_TO');
    expect(result.contract).toBeUndefined();
    expect(result.protocol).toBeUndefined();
  });

  it('uses the sender as counterparty for a received token transfer', () => {
    const result = buildStacksActivity({
      common: { ...common, initiatedByUser: false },
      core: { kind: 'token_transfer', recipient: 'SP_TO', sender: 'SP_FROM' },
      action: 'receive',
      balanceChanges: [],
    });
    expect(result.counterparty).toBe('SP_FROM');
  });

  it('attaches a deploy contract and no counterparty for smart_contract', () => {
    const result = buildStacksActivity({
      common,
      core: { kind: 'smart_contract', contractId: 'SP.deployed' },
      action: 'contract-deploy',
      balanceChanges: [],
    });
    expect(result.contract).toEqual({ type: 'deploy', contractId: 'SP.deployed' });
    expect(result.counterparty).toBeUndefined();
  });

  it('attaches a call contract and protocol for a classified contract_call', () => {
    const result = buildStacksActivity({
      common,
      core: { kind: 'contract_call', contractId: 'SP.pool', functionName: 'swap-x-for-y' },
      action: 'swap',
      protocol: 'bitflow',
      balanceChanges: [],
    });
    expect(result.contract).toEqual({
      type: 'call',
      contractId: 'SP.pool',
      functionName: 'swap-x-for-y',
    });
    expect(result.action).toBe('swap');
    expect(result.protocol).toBe('bitflow');
  });

  it('attaches the counterparty to a contract_call when one is supplied', () => {
    const result = buildStacksActivity({
      common,
      core: { kind: 'contract_call', contractId: 'SP.token', functionName: 'transfer' },
      action: 'receive',
      counterparty: 'SP_FROM',
      balanceChanges: [],
    });
    expect(result.counterparty).toBe('SP_FROM');
    expect(result.contract).toEqual({
      type: 'call',
      contractId: 'SP.token',
      functionName: 'transfer',
    });
  });

  it('omits the counterparty from a contract_call when none is supplied', () => {
    const result = buildStacksActivity({
      common,
      core: { kind: 'contract_call', contractId: 'SP.x', functionName: 'run' },
      action: 'contract-execution',
      balanceChanges: [],
    });
    expect(result.counterparty).toBeUndefined();
  });

  it('omits protocol when the contract_call is unclassified', () => {
    const result = buildStacksActivity({
      common,
      core: { kind: 'contract_call', contractId: 'SP.x', functionName: 'run' },
      action: 'contract-execution',
      balanceChanges: [],
    });
    expect(result.protocol).toBeUndefined();
  });

  it('passes balance changes through unchanged', () => {
    const change = buildStxBalanceChange('-500');
    const result = buildStacksActivity({
      common,
      core: { kind: 'token_transfer', recipient: 'SP_TO', sender: 'SP_FROM' },
      action: 'send',
      balanceChanges: change === null ? [] : [change],
    });
    expect(result.balanceChanges).toHaveLength(1);
    expect(result.balanceChanges[0].direction).toBe('sent');
  });
});

describe(reclassifySip10Transfer.name, () => {
  const unmapped = { action: 'contract-execution' as const };
  const sender = 'SP_SENDER';
  function change(
    protocol: CryptoAsset['protocol'],
    direction: BlockchainActivityBalanceChange['direction']
  ): BlockchainActivityBalanceChange {
    return { direction, asset: { protocol } as CryptoAsset, amount: {} as never };
  }

  it('reclassifies a sent SIP-10 transfer as send', () => {
    const result = reclassifySip10Transfer(unmapped, 'transfer', [change('sip10', 'sent')], sender);
    expect(result.action).toBe('send');
    expect(result.counterparty).toBeUndefined();
  });

  it('reclassifies a received SIP-10 transfer as receive with the sender as counterparty', () => {
    const result = reclassifySip10Transfer(
      unmapped,
      'transfer',
      [change('sip10', 'received')],
      sender
    );
    expect(result.action).toBe('receive');
    expect(result.counterparty).toBe(sender);
  });

  it('ignores the incidental STX fee change and keys off the single SIP-10 change', () => {
    const result = reclassifySip10Transfer(
      unmapped,
      'transfer',
      [change('nativeStx', 'sent'), change('sip10', 'sent')],
      sender
    );
    expect(result.action).toBe('send');
  });

  it('leaves a classified protocol action untouched', () => {
    const classified = { action: 'swap' as const, protocol: 'bitflow' as const };
    expect(reclassifySip10Transfer(classified, 'transfer', [change('sip10', 'sent')], sender)).toBe(
      classified
    );
  });

  it('does not reclassify a non-transfer function', () => {
    expect(
      reclassifySip10Transfer(unmapped, 'stack-stx', [change('sip10', 'sent')], sender).action
    ).toBe('contract-execution');
  });

  it('does not reclassify when no SIP-10 change is present', () => {
    expect(
      reclassifySip10Transfer(unmapped, 'transfer', [change('nativeStx', 'sent')], sender).action
    ).toBe('contract-execution');
  });

  it('does not reclassify when multiple SIP-10 changes are present', () => {
    expect(
      reclassifySip10Transfer(
        unmapped,
        'transfer',
        [change('sip10', 'sent'), change('sip10', 'received')],
        sender
      ).action
    ).toBe('contract-execution');
  });
});

describe(buildConfirmedStacksActivity.name, () => {
  it('nets the fee out and attaches it for the sponsor of a contract call', () => {
    const result: HiroPrincipalTransactionsResultItem = {
      transaction: {
        ...baseTx(),
        sponsor: { address: 'SPME', nonce: 0 },
        type: 'contract_call',
        contract_call: { contract_id: 'SP2.dex', function_name: 'swap' },
      },
      involvement: 'sponsor',
      balance_changes: { stx: { sent: '100', received: '0', net: '-100' } },
      affected_balances: { stx: true, ft: false, nft: false },
    };
    const activity = buildConfirmedStacksActivity(result, []);
    expect(activity?.balanceChanges).toEqual([]);
    expect(activity?.fee?.amount.toNumber()).toBe(100);
    expect(activity?.initiatedByUser).toBe(false);
  });

  it('does not mint a phantom sent change for the sponsor of a token transfer', () => {
    const result: HiroPrincipalTransactionsResultItem = {
      transaction: {
        ...baseTx(),
        sponsor: { address: 'SPME', nonce: 0 },
        type: 'token_transfer',
        token_transfer: { recipient: 'SP3', amount: '500', memo: null },
      },
      involvement: 'sponsor',
      balance_changes: { stx: { sent: '100', received: '0', net: '-100' } },
      affected_balances: { stx: true, ft: false, nft: false },
    };
    const activity = buildConfirmedStacksActivity(result, []);
    expect(activity?.balanceChanges).toEqual([]);
    expect(activity?.fee?.amount.toNumber()).toBe(100);
  });
});

describe(buildOnchainStacksActivity.name, () => {
  const stxAddress = 'SP_ME';
  const noChanges = { stxNet: '0', ftChanges: [] };

  function tokenTransfer(
    overrides: Partial<TokenTransferTransaction> = {}
  ): TokenTransferTransaction {
    return {
      tx_id: '0xabc',
      tx_type: 'token_transfer',
      tx_status: 'success',
      sender_address: 'SP_SENDER',
      sponsored: false,
      fee_rate: '200',
      block_height: 42,
      block_time: 1_700_000_000,
      burn_block_time: 1_700_000_000,
      token_transfer: { recipient_address: 'SP_TO', amount: '5000000', memo: '' },
      ...overrides,
    } as TokenTransferTransaction;
  }

  it('maps a confirmed received transfer with the sender as counterparty', () => {
    const activity = buildOnchainStacksActivity(
      tokenTransfer({
        token_transfer: { recipient_address: stxAddress, amount: '5000000', memo: '' },
      }),
      stxAddress,
      noChanges
    );
    expect(activity?.action).toBe('receive');
    expect(activity?.initiatedByUser).toBe(false);
    expect(activity?.counterparty).toBe('SP_SENDER');
    expect(activity?.status).toBe('success');
    expect(activity?.blockHeight).toBe(42);
    expect(activity?.timestamp).toBe(1_700_000_000);
    expect(activity?.fee).toBeUndefined();
    expect(activity?.balanceChanges).toHaveLength(1);
    expect(activity?.balanceChanges[0].direction).toBe('received');
    expect(activity?.balanceChanges[0].amount.crypto.amount.toString()).toBe('5000000');
  });

  it('maps a confirmed sent transfer with the recipient as counterparty and attaches the fee', () => {
    const activity = buildOnchainStacksActivity(
      tokenTransfer({ sender_address: stxAddress }),
      stxAddress,
      noChanges
    );
    expect(activity?.action).toBe('send');
    expect(activity?.initiatedByUser).toBe(true);
    expect(activity?.counterparty).toBe('SP_TO');
    expect(activity?.fee?.amount.toNumber()).toBe(200);
    expect(activity?.balanceChanges[0].direction).toBe('sent');
    expect(activity?.balanceChanges[0].amount.crypto.amount.toString()).toBe('5000000');
  });

  it('does not attach a fee for a sponsored send', () => {
    const activity = buildOnchainStacksActivity(
      tokenTransfer({ sender_address: stxAddress, sponsored: true }),
      stxAddress,
      noChanges
    );
    expect(activity?.fee).toBeUndefined();
  });

  it('maps an aborted transaction as failed with no balance change', () => {
    const activity = buildOnchainStacksActivity(
      tokenTransfer({
        tx_status: 'abort_by_response',
        token_transfer: { recipient_address: stxAddress, amount: '5000000', memo: '' },
      }),
      stxAddress,
      noChanges
    );
    expect(activity?.status).toBe('failed');
    expect(activity?.balanceChanges).toHaveLength(0);
  });

  it('returns null for a transfer the account neither sent nor received', () => {
    expect(buildOnchainStacksActivity(tokenTransfer(), stxAddress, noChanges)).toBeNull();
  });

  it('returns null for a contract call the account neither sent nor was affected by', () => {
    const tx = {
      tx_id: '0x5',
      tx_type: 'contract_call',
      tx_status: 'success',
      sender_address: 'SP_SENDER',
      sponsored: false,
      fee_rate: '200',
      block_height: 10,
      block_time: 1000,
      burn_block_time: 1000,
      contract_call: { contract_id: 'SP.dex', function_name: 'swap-x-for-y' },
    } as ContractCallTransaction;
    expect(buildOnchainStacksActivity(tx, stxAddress, noChanges)).toBeNull();
  });

  it('returns null for a contract deploy the account did not send', () => {
    const tx = {
      tx_id: '0x6',
      tx_type: 'smart_contract',
      tx_status: 'success',
      sender_address: 'SP_SENDER',
      sponsored: false,
      fee_rate: '200',
      smart_contract: { contract_id: 'SP.deployed' },
    } as SmartContractTransaction;
    expect(buildOnchainStacksActivity(tx, stxAddress, noChanges)).toBeNull();
  });

  it('maps a mempool transfer as pending with no block height', () => {
    const tx = {
      tx_id: '0xdef',
      tx_type: 'token_transfer',
      tx_status: 'pending',
      sender_address: 'SP_SENDER',
      sponsored: false,
      fee_rate: '200',
      receipt_time: 1_700_000_500,
      token_transfer: { recipient_address: stxAddress, amount: '1000', memo: '' },
    } as MempoolTokenTransferTransaction;
    const activity = buildOnchainStacksActivity(tx, stxAddress, noChanges);
    expect(activity?.status).toBe('pending');
    expect(activity?.blockHeight).toBeUndefined();
    expect(activity?.timestamp).toBe(1_700_000_500);
  });

  it('nets the fee out of the stx balance change for a contract call the account paid for', () => {
    const tx = {
      tx_id: '0x1',
      tx_type: 'contract_call',
      tx_status: 'success',
      sender_address: stxAddress,
      sponsored: false,
      fee_rate: '200',
      block_height: 10,
      block_time: 1000,
      burn_block_time: 1000,
      contract_call: { contract_id: 'SP.dex', function_name: 'swap-x-for-y' },
    } as ContractCallTransaction;
    const activity = buildOnchainStacksActivity(
      tx,
      stxAddress,
      { stxNet: '-1000', ftChanges: [] },
      { action: 'swap', protocol: 'bitflow', protocolName: 'Bitflow' }
    );
    expect(activity?.action).toBe('swap');
    expect(activity?.protocol).toBe('bitflow');
    expect(activity?.contract).toEqual({
      type: 'call',
      contractId: 'SP.dex',
      functionName: 'swap-x-for-y',
    });
    expect(activity?.balanceChanges[0].amount.crypto.amount.toString()).toBe('800');
    expect(activity?.fee?.amount.toNumber()).toBe(200);
  });

  it('reclassifies a received SIP-10 transfer using the supplied ft change', () => {
    const tx = {
      tx_id: '0x2',
      tx_type: 'contract_call',
      tx_status: 'success',
      sender_address: 'SP_SENDER',
      sponsored: false,
      fee_rate: '200',
      block_height: 10,
      block_time: 1000,
      burn_block_time: 1000,
      contract_call: { contract_id: 'SP.token', function_name: 'transfer' },
    } as ContractCallTransaction;
    const ftChange: BlockchainActivityBalanceChange = {
      direction: 'received',
      asset: { protocol: 'sip10' } as CryptoAsset,
      amount: {} as never,
    };
    const activity = buildOnchainStacksActivity(tx, stxAddress, {
      stxNet: '0',
      ftChanges: [ftChange],
    });
    expect(activity?.action).toBe('receive');
    expect(activity?.counterparty).toBe('SP_SENDER');
  });

  it('maps a smart_contract deploy', () => {
    const tx = {
      tx_id: '0x3',
      tx_type: 'smart_contract',
      tx_status: 'success',
      sender_address: stxAddress,
      sponsored: false,
      fee_rate: '200',
      smart_contract: { contract_id: 'SP.deployed' },
    } as SmartContractTransaction;
    const activity = buildOnchainStacksActivity(tx, stxAddress, { stxNet: '-200', ftChanges: [] });
    expect(activity?.action).toBe('contract-deploy');
    expect(activity?.contract).toEqual({ type: 'deploy', contractId: 'SP.deployed' });
  });

  it('returns null for a non-activity transaction type', () => {
    const tx = {
      tx_id: '0x4',
      tx_type: 'coinbase',
      tx_status: 'success',
      sender_address: stxAddress,
      sponsored: false,
      fee_rate: '0',
      block_height: 1,
      block_time: 1,
      burn_block_time: 1,
    } as StacksTx;
    expect(buildOnchainStacksActivity(tx, stxAddress, noChanges)).toBeNull();
  });
});
