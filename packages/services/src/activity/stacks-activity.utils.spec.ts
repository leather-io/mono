import { describe, expect, it } from 'vitest';

import type { BlockchainActivityBalanceChange, CryptoAsset } from '@leather.io/models';

import type {
  HiroPrincipalTransaction,
  HiroPrincipalTransactionsResultItem,
} from '../infrastructure/api/hiro/hiro-stacks-api.types';
import {
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
  function change(
    protocol: CryptoAsset['protocol'],
    direction: BlockchainActivityBalanceChange['direction']
  ): BlockchainActivityBalanceChange {
    return { direction, asset: { protocol } as CryptoAsset, amount: {} as never };
  }

  it('reclassifies a sent SIP-10 transfer as send', () => {
    expect(reclassifySip10Transfer(unmapped, 'transfer', [change('sip10', 'sent')]).action).toBe(
      'send'
    );
  });

  it('reclassifies a received SIP-10 transfer as receive', () => {
    expect(
      reclassifySip10Transfer(unmapped, 'transfer', [change('sip10', 'received')]).action
    ).toBe('receive');
  });

  it('ignores the incidental STX fee change and keys off the single SIP-10 change', () => {
    const result = reclassifySip10Transfer(unmapped, 'transfer', [
      change('nativeStx', 'sent'),
      change('sip10', 'sent'),
    ]);
    expect(result.action).toBe('send');
  });

  it('leaves a classified protocol action untouched', () => {
    const classified = { action: 'swap' as const, protocol: 'bitflow' as const };
    expect(reclassifySip10Transfer(classified, 'transfer', [change('sip10', 'sent')])).toBe(
      classified
    );
  });

  it('does not reclassify a non-transfer function', () => {
    expect(reclassifySip10Transfer(unmapped, 'stack-stx', [change('sip10', 'sent')]).action).toBe(
      'contract-execution'
    );
  });

  it('does not reclassify when no SIP-10 change is present', () => {
    expect(
      reclassifySip10Transfer(unmapped, 'transfer', [change('nativeStx', 'sent')]).action
    ).toBe('contract-execution');
  });

  it('does not reclassify when multiple SIP-10 changes are present', () => {
    expect(
      reclassifySip10Transfer(unmapped, 'transfer', [
        change('sip10', 'sent'),
        change('sip10', 'received'),
      ]).action
    ).toBe('contract-execution');
  });
});
