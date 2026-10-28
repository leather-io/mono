import { type TransactionEvent } from '@stacks/stacks-blockchain-api-types';

import { stxAsset } from '@leather.io/constants';
import {
  type AccountAddresses,
  ActivityLevels,
  CryptoAssetCategories,
  OnChainActivityStatuses,
  OnChainActivityTypes,
} from '@leather.io/models';
import { initBigNumber } from '@leather.io/utils';

import {
  createActivityContractCallTx,
  createActivityMempoolTokenTransferTx,
  createActivitySip10Asset,
  createActivitySmartContractLogEvent,
  createActivitySmartContractTx,
  createActivityTokenTransferTx,
  removeActivityBlockTimes,
} from '../test/activity-fixtures';
import { type StacksAssetTransferWithInfo } from './stacks-asset-transfer.utils';
import { getStacksTxByStatus } from './stacks-mempool-tx.utils';
import {
  getEventsByTxId,
  mapContractCallActivity,
  mapSmartContractActivity,
  mapStacksTxBlockHeight,
  mapStacksTxBlockTime,
  mapStacksTxFee,
  mapStacksTxStatus,
  mapTokenTransferActivity,
  mapTxAssetTransfersToActivity,
} from './stacks-tx-activity.utils';

describe('mapTokenTransferActivity', () => {
  const account: AccountAddresses = {
    id: { fingerprint: 'xyz', accountIndex: 0 },
    stacks: {
      stxAddress: 'ST123',
    },
  };

  const commonTxProps = {
    tx_id: 'tx123',
    tx_status: 'success' as const,
    token_transfer: {
      amount: '1000',
      memo: '',
    },
  };

  it('maps send activity when sender matches account', () => {
    const tx = removeActivityBlockTimes(
      createActivityTokenTransferTx({
        ...commonTxProps,
        sender_address: 'ST123',
        token_transfer: {
          ...commonTxProps.token_transfer,
          recipient_address: 'ST456',
        },
      }),
      ['block_time', 'burn_block_time']
    );

    const result = mapTokenTransferActivity(tx, account);

    expect(result).toEqual([
      {
        type: OnChainActivityTypes.sendAsset,
        receivers: ['ST456'],
        asset: stxAsset,
        amount: initBigNumber('1000'),
        account: account.id,
        txid: 'tx123',
        status: OnChainActivityStatuses.success,
        timestamp: undefined, // No block time in test tx
        level: ActivityLevels.account,
      },
    ]);
  });

  it('maps receive activity when recipient matches account', () => {
    const tx = removeActivityBlockTimes(
      createActivityTokenTransferTx({
        ...commonTxProps,
        sender_address: 'ST456',
        token_transfer: {
          ...commonTxProps.token_transfer,
          recipient_address: 'ST123',
        },
      }),
      ['block_time', 'burn_block_time']
    );

    const result = mapTokenTransferActivity(tx, account);

    expect(result).toEqual([
      {
        type: OnChainActivityTypes.receiveAsset,
        senders: ['ST456'],
        asset: stxAsset,
        amount: initBigNumber('1000'),
        account: account.id,
        txid: 'tx123',
        status: OnChainActivityStatuses.success,
        timestamp: undefined,
        level: ActivityLevels.account,
      },
    ]);
  });
});

describe('mapSmartContractActivity', () => {
  const account: AccountAddresses = {
    id: { fingerprint: 'xyz', accountIndex: 0 },
    stacks: {
      stxAddress: 'ST123',
    },
  };

  it('adds deploy activity when sender matches account', () => {
    const tx = removeActivityBlockTimes(
      createActivitySmartContractTx({
        tx_id: 'tx123',
        tx_status: 'success',
        sender_address: 'ST123',
        smart_contract: {
          contract_id: 'ST123.my-contract',
          source_code: '',
        },
      }),
      ['block_time', 'burn_block_time']
    );

    const result = mapSmartContractActivity(tx, account, []);

    expect(result).toEqual([
      {
        type: OnChainActivityTypes.deploySmartContract,
        contractId: 'ST123.my-contract',
        account: account.id,
        txid: 'tx123',
        status: OnChainActivityStatuses.success,
        timestamp: undefined,
        level: ActivityLevels.account,
      },
    ]);
  });

  it('includes asset transfers if present', () => {
    const tx = removeActivityBlockTimes(
      createActivitySmartContractTx({
        tx_id: 'tx123',
        tx_status: 'success',
        sender_address: 'ST123',
        smart_contract: {
          contract_id: 'ST123.my-contract',
          source_code: '',
        },
      }),
      ['block_time', 'burn_block_time']
    );

    const transfers: StacksAssetTransferWithInfo[] = [
      {
        assetCategory: CryptoAssetCategories.fungible,
        assetId: 'STX',
        asset: stxAsset,
        sender: 'ST123',
        receiver: 'ST456',
        tokenValue: '1000',
      },
    ];

    const result = mapSmartContractActivity(tx, account, transfers);

    expect(result).toHaveLength(2);
    expect(result).toContainEqual({
      type: OnChainActivityTypes.sendAsset,
      asset: stxAsset,
      amount: initBigNumber('1000'),
      receivers: ['ST456'],
      account: account.id,
      txid: 'tx123',
      status: OnChainActivityStatuses.success,
      timestamp: undefined,
      level: ActivityLevels.account,
    });
  });
});

describe('mapContractCallActivity', () => {
  const account: AccountAddresses = {
    id: { fingerprint: 'xyz', accountIndex: 0 },
    stacks: {
      stxAddress: 'ST123',
    },
  };

  it('maps execute activity when no transfers present', () => {
    const tx = removeActivityBlockTimes(
      createActivityContractCallTx({
        tx_id: 'tx123',
        tx_status: 'success',
        sender_address: 'ST123',
        contract_call: {
          contract_id: 'ST456.contract',
          function_name: 'transfer',
          function_signature: '',
        },
      }),
      ['block_time', 'burn_block_time']
    );

    const result = mapContractCallActivity(tx, account, []);

    expect(result).toEqual([
      {
        type: OnChainActivityTypes.executeSmartContract,
        contractId: 'ST456.contract',
        functionName: 'transfer',
        account: account.id,
        txid: 'tx123',
        status: OnChainActivityStatuses.success,
        timestamp: undefined,
        level: ActivityLevels.account,
      },
    ]);
  });

  it('only maps transfers if present', () => {
    const tx = removeActivityBlockTimes(
      createActivityContractCallTx({
        tx_id: 'tx123',
        tx_status: 'success',
        sender_address: 'ST123',
        contract_call: {
          contract_id: 'ST456.contract',
          function_name: 'transfer',
          function_signature: '',
        },
      }),
      ['block_time', 'burn_block_time']
    );

    const transfers = [
      {
        assetCategory: CryptoAssetCategories.fungible,
        assetId: 'STX',
        asset: stxAsset,
        sender: 'ST123',
        receiver: 'ST456',
        tokenValue: '1000',
      },
    ];

    const result = mapContractCallActivity(tx, account, transfers);

    expect(result).toHaveLength(1);
    expect(result).toContainEqual({
      type: OnChainActivityTypes.sendAsset,
      asset: stxAsset,
      amount: initBigNumber('1000'),
      receivers: ['ST456'],
      account: account.id,
      txid: 'tx123',
      status: OnChainActivityStatuses.success,
      timestamp: undefined,
      level: ActivityLevels.account,
    });
  });
});

describe('mapTxAssetTransfersToActivity', () => {
  const account: AccountAddresses = {
    id: { fingerprint: 'xyz', accountIndex: 0 },
    stacks: {
      stxAddress: 'ST123',
    },
  };

  const tx = removeActivityBlockTimes(
    createActivityTokenTransferTx({
      tx_id: 'tx123',
      tx_status: 'success',
    }),
    ['block_time', 'burn_block_time']
  );
  const tokenXyz = createActivitySip10Asset({ assetId: 'ST000.token::xyz' });

  it('maps simple asset sends and aggregates amounts and receivers', () => {
    const transfers = [
      {
        assetCategory: CryptoAssetCategories.fungible,
        assetId: 'STX',
        asset: stxAsset,
        sender: 'ST123',
        receiver: 'ST456',
        tokenValue: '1000',
      },
      {
        assetCategory: CryptoAssetCategories.fungible,
        assetId: 'STX',
        asset: stxAsset,
        sender: 'ST123',
        receiver: 'ST789',
        tokenValue: '2000',
      },
    ];

    expect(mapTxAssetTransfersToActivity(tx, account, transfers)).toEqual([
      {
        type: OnChainActivityTypes.sendAsset,
        asset: stxAsset,
        amount: initBigNumber('3000'),
        receivers: ['ST456', 'ST789'],
        account: account.id,
        txid: 'tx123',
        status: OnChainActivityStatuses.success,
        timestamp: undefined,
        level: ActivityLevels.account,
      },
    ]);
  });

  it('maps simple asset receives and aggregates amounts and senders', () => {
    const transfers = [
      {
        assetCategory: CryptoAssetCategories.fungible,
        assetId: 'ST000.token::xyz',
        asset: tokenXyz,
        sender: 'ST456',
        receiver: 'ST123',
        tokenValue: '1000',
      },
      {
        assetCategory: CryptoAssetCategories.fungible,
        assetId: 'ST000.token::xyz',
        asset: tokenXyz,
        sender: 'ST789',
        receiver: 'ST123',
        tokenValue: '2000',
      },
    ];

    expect(mapTxAssetTransfersToActivity(tx, account, transfers)).toEqual([
      {
        type: OnChainActivityTypes.receiveAsset,
        asset: tokenXyz,
        amount: initBigNumber('3000'),
        senders: ['ST456', 'ST789'],
        account: account.id,
        txid: 'tx123',
        status: OnChainActivityStatuses.success,
        timestamp: undefined,
        level: ActivityLevels.account,
      },
    ]);
  });

  it('maps 1 send transfer and 1 receive transfer to swap activity', () => {
    const transfers: StacksAssetTransferWithInfo[] = [
      {
        assetCategory: CryptoAssetCategories.fungible,
        assetId: 'STX',
        asset: stxAsset,
        sender: 'ST123',
        receiver: 'ST456',
        tokenValue: '1000',
      },
      {
        assetCategory: CryptoAssetCategories.fungible,
        assetId: 'ST000.token::xyz',
        asset: tokenXyz,
        sender: 'ST456',
        receiver: 'ST123',
        tokenValue: '2000',
      },
    ];

    const result = mapTxAssetTransfersToActivity(tx, account, transfers);

    expect(result).toEqual([
      {
        type: OnChainActivityTypes.swapAssets,
        fromAsset: stxAsset,
        fromAmount: initBigNumber('1000'),
        toAsset: tokenXyz,
        toAmount: initBigNumber('2000'),
        account: account.id,
        txid: 'tx123',
        status: OnChainActivityStatuses.success,
        timestamp: undefined,
        level: ActivityLevels.account,
      },
    ]);
  });

  it('ignores complex transfers with >1 asset sent or received', () => {
    const transfers: StacksAssetTransferWithInfo[] = [
      {
        assetCategory: CryptoAssetCategories.fungible,
        assetId: 'STX',
        asset: stxAsset,
        sender: 'ST123',
        receiver: 'ST456',
        tokenValue: '1000',
      },
      {
        assetCategory: CryptoAssetCategories.fungible,
        assetId: 'TOKEN1',
        asset: createActivitySip10Asset({ name: 'Token1' }),
        sender: 'ST123',
        receiver: 'ST456',
        tokenValue: '2000',
      },
    ];

    const result = mapTxAssetTransfersToActivity(tx, account, transfers);

    expect(result).toEqual([]);
  });
});

describe('getStacksTxByStatus', () => {
  it('returns false for success status', () => {
    expect(
      getStacksTxByStatus(createActivityTokenTransferTx({ tx_status: 'success' })).mempoolTx
    ).toBeUndefined();
  });

  it('returns false for abort_by_post_condition', () => {
    expect(
      getStacksTxByStatus(createActivityTokenTransferTx({ tx_status: 'abort_by_post_condition' }))
        .mempoolTx
    ).toBeUndefined();
  });

  it('returns false for abort_by_response', () => {
    expect(
      getStacksTxByStatus(createActivityTokenTransferTx({ tx_status: 'abort_by_response' }))
        .mempoolTx
    ).toBeUndefined();
  });

  it('returns true for pending status', () => {
    expect(
      getStacksTxByStatus(createActivityMempoolTokenTransferTx({ tx_status: 'pending' })).mempoolTx
    ).toBeDefined();
  });
});

describe('mapStacksTxStatus', () => {
  it('maps success', () => {
    expect(mapStacksTxStatus(createActivityTokenTransferTx({ tx_status: 'success' }))).toBe(
      'success'
    );
  });

  it('maps pending', () => {
    expect(mapStacksTxStatus(createActivityMempoolTokenTransferTx({ tx_status: 'pending' }))).toBe(
      'pending'
    );
  });

  it('maps abort statuses to failed', () => {
    expect(
      mapStacksTxStatus(createActivityTokenTransferTx({ tx_status: 'abort_by_response' }))
    ).toBe('failed');
    expect(
      mapStacksTxStatus(createActivityTokenTransferTx({ tx_status: 'abort_by_post_condition' }))
    ).toBe('failed');
  });
});

describe('mapStacksTxBlockTime', () => {
  it('returns receipt_time for mempool tx', () => {
    const tx = createActivityMempoolTokenTransferTx({
      tx_status: 'pending',
      receipt_time: 1700000001,
    });
    expect(mapStacksTxBlockTime(tx)).toBe(1700000001);
  });

  it('returns block_time for confirmed tx', () => {
    const tx = createActivityTokenTransferTx({
      tx_status: 'success',
      block_time: 1700000000,
      burn_block_time: 1699999999,
    });
    expect(mapStacksTxBlockTime(tx)).toBe(1700000000);
  });

  it('falls back to burn_block_time when block_time is missing', () => {
    const tx = removeActivityBlockTimes(
      createActivityTokenTransferTx({
        tx_status: 'success',
        burn_block_time: 1699999999,
      }),
      ['block_time']
    );
    expect(mapStacksTxBlockTime(tx)).toBe(1699999999);
  });
});

describe('mapStacksTxBlockHeight', () => {
  it('returns block_height for confirmed tx', () => {
    const tx = createActivityTokenTransferTx({ tx_status: 'success', block_height: 500 });
    expect(mapStacksTxBlockHeight(tx)).toBe(500);
  });

  it('returns undefined for mempool tx', () => {
    const tx = createActivityMempoolTokenTransferTx({ tx_status: 'pending' });
    expect(mapStacksTxBlockHeight(tx)).toBeUndefined();
  });
});

describe('mapStacksTxFee', () => {
  it('returns fee_rate', () => {
    expect(mapStacksTxFee(createActivityTokenTransferTx({ fee_rate: '2500' }))).toBe('2500');
  });
});

describe('getEventsByTxId', () => {
  it('groups events by tx_id', () => {
    const events: TransactionEvent[] = [
      createActivitySmartContractLogEvent({ tx_id: '0xaaa', event_index: 0 }),
      createActivitySmartContractLogEvent({ tx_id: '0xbbb', event_index: 0 }),
      createActivitySmartContractLogEvent({ tx_id: '0xaaa', event_index: 1 }),
    ];

    const map = getEventsByTxId(events);

    expect(map.size).toBe(2);
    expect(map.get('0xaaa')).toHaveLength(2);
    expect(map.get('0xbbb')).toHaveLength(1);
  });

  it('returns empty map for empty events', () => {
    expect(getEventsByTxId([])).toEqual(new Map());
  });
});
